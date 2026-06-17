<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="h-full bg-white flex flex-col items-center">
    <img src="/res/avatar.png" class="w-20 h-20 rounded-full mt-16" />
    <p class="font-bold mt-3">爱设计AIGC平台</p>
    <p class="text-gray-500 mt-3">{{ `版本号：${versionStore.version}` }}</p>
    <van-form class="w-full mt-14">
      <van-field @click="clickGoToReadUserAgreement" is-link clickable readonly label="用户协议" />
      <van-field @click="clickGoToReadUserAgreement" is-link clickable readonly label="隐私政策" />
    </van-form>
  </section>
</template>
<script setup lang="js">
import { useVersionStore } from '@/stores/version'

const versionStore = useVersionStore()

const userAgreement = 'https://aigc-yassine.notion.site/3e8f1814e8e6430aa771128cd9a1c220?pvs=4'

const clickGoToReadUserAgreement = () => {
  // console.log(userAgreement)
  // 新建一个a标签，之后js控制点击链接做跳转，并且target=_blank
  const a = document.createElement('a')
  a.href = userAgreement
  a.target = '_blank'
  // 模拟点击事件
  a.click()
  // 删除a标签
  a.remove()
}
</script>
