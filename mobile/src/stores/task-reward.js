import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import axios from '@/utils/axios'
import moment from 'moment'
import { ref } from 'vue'

export const useTaskRewardStore = defineStore(
  'task-reward',
  () => {
    const englishToChineseWeekday = ref({
      Monday: '周一',
      Tuesday: '周二',
      Wednesday: '周三',
      Thursday: '周四',
      Friday: '周五',
      Saturday: '周六',
      Sunday: '周日'
    })

    const taskList = ref([])
    const taskQuickSort = () => {
      taskList.value.sort((a, b) => {
        if (a.status === 'available reward' && b.status !== 'available reward') return -1
        if (a.status !== 'available reward' && b.status === 'available reward') return 1
        if (a.status === 'finished' && b.status !== 'finished') return 1
        if (a.status !== 'finished' && b.status === 'finished') return -1
        return 0
      })
    }
    // 从服务器获取任务列表
    const getNetworkTaskList = async () => {
      // if (taskList.value.length !== 0) return
      const res = await axios.request({
        url: '/user/service/task/getAllTaskReward',
        method: 'get',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (res.status === 200) {
        const parsedData = JSON.parse(res.data)
        if (parsedData.status === 0) {
          // 更新任务列表
          // console.log('rewrite taskList.value')
          taskList.value = parsedData.data.map((item) => {
            return {
              name: item.name,
              fluentIconName: item.fluentIconName,
              title: item.description.split('】')[0].slice(1),
              dialogue: item.rewardDialogue,
              painting: item.rewardPainting,
              status: item.status // in progress || available reward || finished
            }
          })
          taskQuickSort()
        }
      }
    }

    // 提示用户的点数
    const getPoints = async () => {
      let points = 0
      const { canPunchIn } = await checkIfYouCanPunchIn()
      if (canPunchIn) points++

      // 检测任务列表是否有已完成待领取的奖励
      await getNetworkTaskList()
      taskList.value.forEach((item) => {
        if (item.status === 'available reward') points++
      })

      return points
    }

    // 检测是否可以打卡
    const checkIfYouCanPunchIn = async () => {
      const punchInDaysRes = await axios.request({
        url: '/user/service/task/getPunchDaily',
        method: 'get',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (punchInDaysRes.status === 200) {
        const parsedData = JSON.parse(punchInDaysRes.data)

        if (parsedData.status === 0) {
          // 如果有数据检测第一条是否与当前时间相差不到1分钟
          if (parsedData.punchInDaily.length > 0) {
            const minutesDiff = moment(moment().toISOString()).diff(
              moment(parsedData.punchInDaily[0].createdAt),
              'minutes'
            )
            if (minutesDiff >= 1440) {
              // 相差超过1天，可以打卡
              return { data: parsedData, canPunchIn: true }
            } else return { data: parsedData, canPunchIn: false }
          }
          return { data: parsedData, canPunchIn: true }
        } else return { status: -1 }
      }
    }
    return {
      checkIfYouCanPunchIn,
      englishToChineseWeekday,
      getPoints,
      taskList,
      getNetworkTaskList,
      taskQuickSort
    }
  },
  {
    persist: {
      enabled: true,
      key: 'task-reward',
      encryptionKey: 'task-reward',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-task-reward', {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Iso97971
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-task-reward', {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Iso97971
          })
        }
      }
    }
  }
)
