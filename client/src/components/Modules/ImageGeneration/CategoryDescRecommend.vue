<template>
  <div class="mt-4">
    <p
      class="text-gray-500 leading-4 pl-2 box-border border-0 border-solid border-l-[3px] border-[#ff6e65]"
    >
      {{ `${title}(${datas.length})` }}
    </p>
    <div class="mt-2.5 flex flex-wrap gap-2.5">
      <span
        :key="item"
        v-for="item in datas"
        @click="item.selected = !item.selected"
        :class="[
          'pl-2 transition-all duration-300 rounded-sm  p-1.5',
          item.selected ? 'bg-red-50 text-[#ff6e65]' : 'bg-gray-100 text-black'
        ]"
      >
        {{ item.title }}
      </span>
    </div>
  </div>
</template>
<script setup lang="js">
// datas: [{ title: '刺客', value： 'assassins', selected: false }, { title: '', ...res }]
defineProps(['title', 'datas'])
</script>
