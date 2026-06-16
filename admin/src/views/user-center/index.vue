<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetUserInfo } from '@/service/api';

const data = ref<Api.Auth.UserInfo>();

onMounted(async () => {
  const result = await fetchGetUserInfo();
  if (result.error) return;
  data.value = result.data;
});
</script>

<template>
  <NSpace vertical>
    <NCard title="管理员信息" size="small">
      <div class="flex items-center justify-start gap-3">
        <NAvatar round :size="48" src="./favicon.svg" class="bg-white dark:bg-black" />
        <div>
          <div class="text-lg">{{ data?.userName }}</div>
          <div class="flex items-center gap-1 text-sm">
            <span>
              规则:
              <NTag size="small" :bordered="false" type="success">{{ data?.roles[0] }}</NTag>
            </span>
            <span>{{ `ID: ${data?.userId}` }}</span>
          </div>
        </div>
      </div>
    </NCard>
  </NSpace>
</template>
