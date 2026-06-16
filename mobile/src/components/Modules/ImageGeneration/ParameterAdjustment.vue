<template>
  <!-- 文本描述 -->
  <div>
    <Headline text="文本描述" :required="true" />
    <div class="relative">
      <textarea
        placeholder="请输入文本提示词"
        v-model="genImageStore.curInputPrompt"
        rows="7"
        style="width: calc(100% - 16px); transition: border 0.3s"
        class="bg-gray-100/80 rounded-lg my-3 p-2 border border-solid border-white focus:border-[#ff6e65] box-content"
      >
      </textarea>
      <!-- 文本输入区域底部功能区 -->
      <div class="absolute bottom-5 right-3 flex gap-4 bg-gray-100 px-3 py-1 rounded-full">
        <!-- 描述词推荐 -->
        <div @click="descriptorRecommendation" class="text-[#ff6e65] cursor-pointer">
          描述词推荐
        </div>

        <!-- 清空功能 -->
        <div class="cursor-pointer text-gray-500" @click="genImageStore.curInputPrompt = ''">
          <van-icon name="delete-o" />
          <span>清空</span>
        </div>
      </div>
    </div>
    <!-- 文本输入区底部功能区2-随便试试 -->
    <div class="flex gap-3 flex-col mb-8">
      <div
        @click="selectedRandom2 = getRandomizationOf2()"
        class="text-gray-500 mr-3 cursor-pointer"
      >
        <van-icon name="replay" />
        <span>随便试试</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <p
          @click="genImageStore.curInputPrompt = item.value"
          class="cursor-pointer transition-all duration-300 border border-solid border-white p-2 bg-gray-100 rounded-lg active:bg-red-50 active:text-[#ff6e65] active:border-[#ff6e65]"
          v-for="item in selectedRandom2"
          :key="item"
        >
          {{ item.title }}
        </p>
      </div>
    </div>
  </div>
  <!-- 图像质量 -->
  <div v-if="type.toLowerCase() !== 'midjourney'">
    <Headline text="图像质量" :required="false" />
    <div class="flex flex-wrap gap-2 mt-3 mb-8">
      <div
        v-for="item in quality"
        :key="item"
        @click="setQualitySelected(item)"
        :class="[
          'cursor-pointer px-8 py-2 border border-solid rounded-md transition-all duration-300',
          qualityCompareItemTitle(item)
            ? 'border-[#ff6e65] text-[#ff6e65] bg-red-50'
            : 'border-gray-200 text-black bg-white'
        ]"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
  <!-- 上传参考图 -->
  <div v-if="type.toLowerCase() === 'midjourney'">
    <Headline text="上传参考图" :required="false" />
    <div class="mt-3 mb-8">
      <van-uploader v-model="uploadImage" :after-read="afterRead" :max-count="1" />
    </div>
  </div>
  <!-- 图像尺寸 -->
  <div v-if="type.toLowerCase() === 'dalle-3' || type.toLowerCase() === 'midjourney'">
    <Headline text="图像尺寸" :required="false" />
    <div
      class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 mt-3 mb-8"
    >
      <div
        v-for="item in ImageSize"
        :key="item"
        @click="
          () => {
            if (isDalle3DisableImageAR(item)) {
            } else setImageARSelected(item)
          }
        "
        :class="[
          'flex flex-col items-center gap-2 py-3 border border-solid rounded-md transition-all duration-300',
          imageARCompareItemAR(item)
            ? 'border-[#ff6e65] text-[#ff6e65] bg-red-50'
            : isDalle3DisableImageAR(item)
              ? 'border-white text-black bg-gray-50 cursor-not-allowed'
              : 'border-white text-black bg-gray-200/60 cursor-pointer'
        ]"
      >
        <div class="h-8 flex items-center">
          <div
            :style="{ width: item.w, height: item.h }"
            :class="[
              'border-solid transition-all duration-300 rounded-md border-2',
              imageARCompareItemAR(item) ? 'border-[#ff6e65]' : 'border-black'
            ]"
          ></div>
        </div>
        <div class="mt-1">{{ item.ar }}</div>
        <div>{{ item.title }}</div>
      </div>
    </div>
  </div>
  <!-- 风格选择 -->
  <div @click="styleShowPicker = true">
    <Headline text="风格选择" :required="false" />
    <div
      class="cursor-pointer max-w-[399px] mt-3 mb-8 flex justify-between items-center px-4 py-3 border border-solid rounded-md transition-all duration-300 border-[#ff6e65] text-[#ff6e65] bg-red-50"
    >
      <p class="text-[#ff6e65]">{{ genImageStore.imageStyle.text }}</p>
      <van-icon name="arrow" />
    </div>
  </div>
  <!-- 忽略的元素，图像复杂度和模型版本 -->
  <div v-if="type.toLowerCase() === 'midjourney'">
    <Headline text="其它参数" :required="false" />
    <!-- 输入任意文本 -->
    <van-field
      v-model="genImageStore.noText"
      label="忽略的元素"
      placeholder="输入图片中不想出现的词，例如fruit, dog"
      class="mt-3"
    />
    <van-field
      v-model="genImageStore.complexity"
      is-link
      readonly
      label="图像复杂度"
      placeholder="默认指数--q .25"
      @click="showComplexityPicker = true"
    />
    <van-popup v-model:show="showComplexityPicker" round position="bottom">
      <van-picker
        :columns="complexityColumns"
        @cancel="showComplexityPicker = false"
        @confirm="onComplexityConfirm"
      />
    </van-popup>

    <van-field
      v-model="genImageStore.version"
      is-link
      readonly
      label="模型版本"
      placeholder="默认版本--v 6"
      @click="showVersionPicker = true"
    />
    <van-popup v-model:show="showVersionPicker" round position="bottom">
      <van-picker
        :columns="versionColumns"
        @cancel="showVersionPicker = false"
        @confirm="onVersionConfirm"
      />
    </van-popup>
  </div>
  <!-- 底部弹起 -- 风格选择 -->
  <van-popup v-model:show="styleShowPicker" position="bottom">
    <van-picker
      :columns="styleColumns"
      @confirm="onStyleConfirm"
      @cancel="styleShowPicker = false"
    />
  </van-popup>
  <!-- 圆角弹窗（居中）-- 描述词推荐 -->
  <van-popup
    v-model:show="descRecommendShow"
    :style="{ width: '85%', height: '60%', borderRadius: '12px' }"
  >
    <template #default>
      <div class="flex h-full flex-col pb-3 box-border">
        <!-- 标题部分 -->
        <div class="mx-5 mt-5 relative items-center">
          <p class="text-[16px] font-medium text-center text-gray-600">描述词推荐</p>
          <van-icon
            class="absolute right-0 top-0"
            @click="descRecommendShow = false"
            name="cross"
            size="22"
            color="#c8c9cc"
          />
        </div>
        <!-- 横向标签 -->
        <van-tabs v-model:active="descRecommendTagActive">
          <van-tab :key="item" v-for="item in descRecommendDatas" :title="item.category"> </van-tab>
        </van-tabs>
        <!-- 内容 -->
        <div class="mx-5 flex-1 overflow-y-auto">
          <div
            class="mb-5 mt-3"
            v-for="item in descRecommendDatas.filter(
              (item) => item.category === descRecommendDatas[descRecommendTagActive].category
            )"
            :key="item"
          >
            <CategoryDescRecommend
              v-for="item2 in item.descriptions"
              :key="item2"
              :title="item2.title"
              :datas="item2.data"
            />
          </div>
        </div>
        <div class="mx-5 mt-3 grid grid-cols-2 gap-2 md:grid-cols-none md:flex">
          <van-button
            @click="addToTextDescription"
            color="linear-gradient(to right, #ff6034, #ee0a24)"
          >
            添加到文本描述 </van-button
          ><van-button @click="replaceTextDescription" plain color="#ff6034">
            替换当前文本
          </van-button>
        </div>
      </div>
    </template>
  </van-popup>
</template>
<script setup lang="js">
import { ref } from 'vue'
import Headline from '@/components/Modules/ImageGeneration/Headline.vue'
import { onMounted } from 'vue'
import { useGenImageStore } from '@/stores/gen-image'
import CategoryDescRecommend from '@/components/Modules/ImageGeneration/CategoryDescRecommend.vue'
import { reactive } from 'vue'
import descRecommendDatasOfOther from '@/assets/descRecommendDatas'

const genImageStore = useGenImageStore()
const props = defineProps(['type'])

// ---------文本描述区域---------
// const promptMsg = ref('')
const randomization = [
  {
    title: '猫咪的梦想世界',
    value:
      'Master works, high quality, beautiful cats, manga style, anime style, dynamic lighting, complex details, beautiful details, Golden Ratio, Unreal Details, Pixiv Trend, Acrylic toning, Ghibli Influence, Leonid Afremov'
  },
  {
    title: '古装美女',
    value:
      'The antique beauty dressed in Tang Dynasty clothing, holding a wooden Chinese drawer, looks into the camera, elegant color scheme'
  },
  {
    title: '海边星空',
    value:
      'This is a night sea map, a huge moon, rising from the sea, the light blue sky is shining with stars, couples walking by the sea, dreamy, romantic, super wide angle, night, soft, 8k, Gong Qijun, art –ar 9:16'
  },
  {
    title: '荔枝球形椅，凹凸白外观，内豪华，热带风。',
    value:
      'Photo of a lychee-inspired spherical chair, with a bumpy white exterior and plush interior, set against a tropical wallpaper.'
  },
  {
    title: '秋叶组成乐队，演奏蓝草乐器，乡村森林环境，丰收月亮光。',
    value:
      'A 2D animation of a folk music band composed of anthropomorphic autumn leaves, each playing traditional bluegrass instruments, amidst a rustic forest setting dappled with the soft light of a harvest moon.'
  },
  {
    title: '中年妇女在黑色背景下瓷器装束舞动。',
    value:
      'In front of a deep black backdrop, a figure of middle years, her Tongan skin rich and glowing, is captured mid-twirl, her curly hair flowing like a storm behind her. Her attire resembles a whirlwind of marble and porcelain fragments. Illuminated by the gleam of scattered porcelain shards, creating a dreamlike atmosphere, the dancer manages to appear fragmented, yet maintains a harmonious and fluid form.'
  },
  {
    title: '牛油果谈空虚，治疗师记笔记。',
    value:
      "An illustration of an avocado sitting in a therapist's chair, saying 'I just feel so empty inside' with a pit-sized hole in its center. The therapist, a spoon, scribbles notes."
  }
]
const selectedRandom2 = ref([])

const getRandomizationOf2 = () => {
  // 从randomization数组中随机抽出两个
  const randomIndexes = getRandomIndexes(2)
  const randomizationOf2 = randomIndexes.map((index) => randomization[index])
  return randomizationOf2
}

const getRandomIndexes = (count) => {
  // 从0到randomization.length-1中随机抽出count个不重复的数
  const randomIndexes = []
  while (randomIndexes.length < count) {
    const randomIndex = Math.floor(Math.random() * randomization.length)
    if (!randomIndexes.includes(randomIndex)) {
      randomIndexes.push(randomIndex)
    }
  }
  return randomIndexes
}

const descRecommendShow = ref(false)
const descRecommendTagActive = ref(0)
const descRecommendDatas = reactive(descRecommendDatasOfOther)
// 点击描述推荐按钮
const descriptorRecommendation = () => {
  descRecommendShow.value = true
}
const getSelectedDescRecommendDatas = () => {
  const selectedResult = []

  // 遍历descRecommendDatas
  descRecommendDatas.forEach((item) => {
    // 遍历item.descriptions
    item.descriptions.forEach((item2) => {
      // 遍历item2.data
      item2.data.forEach((item3) => {
        // 判断item3.selected是否为true
        if (item3.selected) {
          // 将item3.title添加到selectedResult数组中
          selectedResult.push(item3.value)
          // 将item3.selected设置为false
          item3.selected = false
        }
      })
    })
  })

  return selectedResult
}
const addToTextDescription = () => {
  // 添加到文本描述
  const selectedResult = getSelectedDescRecommendDatas()

  const raw = genImageStore.curInputPrompt
  genImageStore.curInputPrompt = `${selectedResult.join(', ')}  ${raw}`
  descRecommendShow.value = false
}
const replaceTextDescription = () => {
  // 替换当前文本描述
  const selectedResult = getSelectedDescRecommendDatas()

  genImageStore.curInputPrompt = `${selectedResult.join(', ')}`
  descRecommendShow.value = false
}
// ---------文本描述区域---------

// ---------图片质量---------
// 对于SD和DALLE-3的图片质量其实无用
const quality = ref([
  { title: '标准', selected: true },
  { title: 'HD-高清', selected: false }
])
// 判断genImageStore.imageQuality是否等于当前遍历item
const qualityCompareItemTitle = (item) => {
  return genImageStore.imageQuality === item.title
}
const setQualitySelected = (item) => {
  // 将quality数组中所有项的selected设置为false
  quality.value.forEach((item) => {
    item.selected = false
  })
  // 将传入的item的selected设置为true
  item.selected = true

  // 将选择的质量title保存到genImageStore.imageQuality中
  genImageStore.imageQuality = item.title
}
// ---------图片质量---------

// --------上传参考图---------
const uploadImage = ref()
const afterRead = (file) => {
  // console.log(file.content)
  genImageStore.uploadImage.push(file.content)
}
// --------上传参考图---------

// ---------图片尺寸---------
const ImageSize = ref([
  { title: '头像图', selected: true, size: '1024x1024', ar: '1:1', w: '18px', h: '18px' },
  { title: '手机壁纸', selected: false, size: '1024x1792', ar: '1:2', w: '13px', h: '26px' },
  { title: '文章配图', selected: false, size: '1792x1024', ar: '4:3', w: '24px', h: '18px' },
  {
    title: '宣传海报',
    selected: false,
    size: '1792x1024',
    dalle3Disable: true,
    ar: '9:16',
    w: '13.5px',
    h: '24px'
  },
  {
    title: '媒体配图',
    selected: false,
    size: '1792x1024',
    dalle3Disable: true,
    ar: '3:4',
    w: '18px',
    h: '24px'
  },
  {
    title: '电脑壁纸',
    selected: false,
    size: '1792x1024',
    dalle3Disable: true,
    ar: '16:9',
    w: '24px',
    h: '13.5px'
  },
  {
    title: '横版名片',
    selected: false,
    size: '1792x1024',
    dalle3Disable: true,
    ar: '3:2',
    w: '18px',
    h: '12px'
  },
  {
    title: '小红书图',
    selected: false,
    size: '1792x1024',
    dalle3Disable: true,
    ar: '2:3',
    w: '12px',
    h: '18px'
  }
])
// 判断genImageStore.imageAR是否等于当前遍历item
const imageARCompareItemAR = (item) => {
  return genImageStore.imageAR === item.ar
}
// 设置图像尺寸
const setImageARSelected = (item) => {
  // 将ImageSize数组中所有项的selected设置为false
  ImageSize.value.forEach((item) => {
    item.selected = false
  })
  // 将传入的item的selected设置为true
  item.selected = true

  // 将图片ar传入到genImageStore.imageAR中
  genImageStore.imageAR = item.ar
}
// 当前在dalle3界面，且已经禁用的图像尺寸
const isDalle3DisableImageAR = (item) => {
  return item.dalle3Disable && props.type.toLowerCase() === 'dalle-3'
}
// ---------图片尺寸---------

// ---------图片风格---------
const styleShowPicker = ref(false)
const styleColumns = ref([
  { text: '写实风格', value: 'Realistic style' },
  { text: '抽象风格', value: 'Abstract style' },
  { text: '超现实风格', value: 'Surrealistic style' },
  { text: '印象派风格', value: 'Impressionist style' },
  { text: '表现主义风格', value: 'Expressionist Style' },
  { text: '立体派风格', value: 'Cubist style' },
  { text: '流行艺术风格', value: 'Pop Art Style' },
  { text: '像素艺术风格', value: 'Pixel art style' },
  { text: '维多利亚或哥特式风格', value: 'Victorian or Gothic style' },
  { text: '未来主义风格', value: 'Futuristic style' },
  { text: '幻想风格', value: 'Fantasy style' },
  { text: '动漫风格', value: 'Anime style' },
  { text: '游戏风格', value: 'Game style' },
  { text: '概念艺术风格', value: 'Conceptual art style' },
  { text: '装饰艺术风格', value: 'Art deco style' },
  { text: '低多边形风格', value: 'Low polygon style' },
  { text: '新媒体艺术风格', value: 'New media art style' },
  { text: '无主义风格', value: 'Nonism style' }
])
const onStyleConfirm = ({ selectedOptions }) => {
  // console.log(selectedOptions)
  genImageStore.imageStyle = selectedOptions[0]
  styleShowPicker.value = false
}
// ---------图片风格---------

// --------忽略的元素，图像复杂度和模型版本---------
const complexityColumns = [
  { text: '.25', value: '.25' },
  { text: '.5', value: '.5' },
  { text: '1', value: '1' }
]
const showComplexityPicker = ref(false)

const onComplexityConfirm = ({ selectedOptions }) => {
  showComplexityPicker.value = false
  genImageStore.complexity = selectedOptions[0].value
}

const versionColumns = [
  { text: '5.1', value: '5.1' },
  { text: '5.2', value: '5.2' },
  { text: '6', value: '6' }
]
const showVersionPicker = ref(false)

const onVersionConfirm = ({ selectedOptions }) => {
  showVersionPicker.value = false
  genImageStore.version = selectedOptions[0].value
}
// --------忽略的元素，图像复杂度和模型版本---------

onMounted(() => {
  // 设置随机描述词
  selectedRandom2.value = getRandomizationOf2()
})
</script>
