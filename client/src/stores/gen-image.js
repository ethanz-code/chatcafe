import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import axios from '@/utils/axios'

export const useGenImageStore = defineStore(
  'gen-image',
  () => {
    // 生成的图片数据列表
    const genImageList = ref([])
    const getAllGenImage = (force = false) => {
      if (genImageList.value.length === 0 || force)
        axios
          .request({
            url: '/app-center/genimg/getAllGenImg',
            method: 'get',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          .then((res) => {
            if (res.status === 200) {
              const parsedData = JSON.parse(res.data)
              genImageList.value = parsedData.data
            }
          })
    }
    const deleteGenImage = (id, afterHandle = () => {}) => {
      axios
        .request({
          url: `/app-center/genimg/deleteGenImg?id=${id}`,
          method: 'delete',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then((res) => {
          if (res.status === 200) {
            afterHandle()
            genImageList.value = genImageList.value.filter((item) => item.id !== id)
          }
        })
    }
    const addGenImage = (model, status, prompt, afterHandle = () => {}) => {
      // 判断model如果是MIDJOURNEY那么需要将必要参数加到prompt后面
      if (model === 'MIDJOURNEY') {
        // 图像尺寸
        prompt += ` --ar ${imageAR.value}`
        // 图像复杂度
        prompt += ` --q ${complexity.value}`
        // 模型版本
        prompt += ` --v ${version.value}`
        // 忽略的元素
        if (noText.value.length > 0) prompt += ` --no ${noText.value}`
      }

      const options = new FormData()
      options.append('model', model)
      options.append('status', status)
      options.append('prompt', prompt)
      // 判断是MJ时还需检测用户是否上传了参考图
      if (model === 'MIDJOURNEY' && uploadImage.value.length > 0)
        options.append('base64', uploadImage.value[0])

      axios
        .request({
          url: '/app-center/genimg/addGenImg',
          method: 'post',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          },
          data: options
        })
        .then((res) => {
          if (res.status === 200) {
            const parsedData = JSON.parse(res.data)
            genImageList.value.unshift(parsedData.data)
            afterHandle()
          }
        })
    }
    const modifyGenImage = (imgId, status, imgUrl) => {
      const formData = new FormData()
      formData.append('imgId', imgId)
      formData.append('status', status)
      formData.append('imgUrl', imgUrl)
      axios.request({
        url: '/app-center/genimg/modifyGenImg',
        method: 'post',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: formData
      })
    }
    const generate = (onError = () => {}, onFinish = () => {}, insufficientBalance = () => {}) => {
      const arToSize = {
        '1:1': '1024x1024',
        '1:2': '1024x1792',
        '2:1': '1792x1024'
      }
      const size = arToSize[imageAR.value] || '1024x1024'
      if (genImageList.value[0].status === '进行中') {
        const obj = genImageList.value[0]
        const error = () => {
          // 修改本地数据
          obj.status = '绘画失败'
          obj.imgUrl = ''
          // 将数据库图片状态进行修改
          modifyGenImage(obj.id, '绘画失败', '')
          // 调用传过来的自定义函数
          onError()
        }
        const dataOptions = new FormData()
        dataOptions.append('imgId', obj.id)
        dataOptions.append('size', size)
        axios
          .request({
            url: '/app-center/genimg/generate',
            method: 'post',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            data: dataOptions,
            timeout: 1000 * 50 // 50s
          })
          .then((res) => {
            if (res.status === 200) {
              const parsedData = JSON.parse(res.data)
              if (parsedData.status === 0) {
                obj.imgUrl = parsedData.data
                obj.status = '绘画完成'
                lastGenerateLoadImg.value = obj.imgUrl
                onFinish()
              } else if (parsedData.status === -1) {
                error()
                if (parsedData.error === 'Insufficient balance') insufficientBalance()
              } else if (parsedData.status === 1) {
                // 后端返回的是1，说明模型是MJ，已提交生成记录。这个时候我们要保存下来result作为查询id
                const resultId = parsedData.data.result
                // 重试最多次数
                let retryCount = 25
                // 单次请求时间间隔5s
                const interval = 5000
                // 定时器
                const timer = setInterval(() => {
                  // 检测重试次数
                  if (retryCount <= 0) {
                    // 超时报错。。。
                    error()
                    clearInterval(timer)
                    return
                  }
                  retryCount--

                  // 发起请求获取结果
                  const formData = new FormData()
                  formData.append('taskId', resultId)
                  formData.append('imgId', obj.id)
                  axios
                    .request({
                      url: '/app-center/genimg/mjCheckStatus',
                      method: 'post',
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                      },
                      data: formData
                    })
                    .then((res) => {
                      if (res.status === 200) {
                        const parsedData = JSON.parse(res.data)
                        if (parsedData.status === 0) {
                          // 这个时候已经成功返回了图片url，
                          clearInterval(timer)
                          obj.imgUrl = parsedData.data
                          obj.status = '绘画完成'
                          lastGenerateLoadImg.value = obj.imgUrl
                          onFinish()
                        } else if (parsedData.state === 1) {
                          // 任务还未结束，仍需继续努力...
                        }
                      }
                    })
                }, interval)
              }
            }
          })
          .catch(() => {
            error()
          })
      }
    }

    // 当前用于生成图片输入的文本提示词
    const curInputPrompt = ref('')
    // 图片质量（仅用于SD和DALLE3但是其实无效不适用，中转平台无法传入质量参数）
    const imageQuality = ref('标准')
    // 图片尺寸（SD不适用, DALLE3部分不适用）
    const imageAR = ref('1:1')
    // 风格选择（默认：写实风格，风格实际上也是在prompt后面加上对应英文）
    const imageStyle = ref({ text: '写实风格', value: 'Realistic style' })
    // 上传参考图
    const uploadImage = ref([])
    // 允许忽略的元素（用于MJ）
    const noText = ref('')
    // 复杂度（用于MJ）
    const complexity = ref('1')
    // 模型版本（用于MJ）
    const version = ref('6')
    const resetParameterInfo = () => {
      curInputPrompt.value = ''
      imageQuality.value = '标准'
      imageAR.value = '1:1'
      imageStyle.value = { text: '写实风格', value: 'Realistic style' }
      uploadImage.value = []
      noText.value = ''
      complexity.value = '1'
      version.value = '6'
    }
    // 最后加载的图片url，默认#
    const lastGenerateLoadImg = ref('#')

    return {
      genImageList,
      getAllGenImage,
      deleteGenImage,
      addGenImage,
      generate,
      curInputPrompt,
      imageQuality,
      imageAR,
      imageStyle,
      uploadImage,
      noText,
      complexity,
      version,
      resetParameterInfo,
      lastGenerateLoadImg
    }
  },
  {
    persist: {
      enabled: true,
      key: 'gen-image',
      encryptionKey: 'gen-image',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-gen-image', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.NoPadding
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-gen-image', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.NoPadding
          })
        }
      }
    }
  }
)
