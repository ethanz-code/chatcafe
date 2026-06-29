<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import type { DataTableColumns, FormInst } from 'naive-ui';
import { NButton, NSpace, useMessage } from 'naive-ui';
import dayjs from 'dayjs';
import {
  fetchCreateHotIssue,
  fetchDeleteHotIssue,
  fetchGetAllHotIssues
} from '@/service/api/core/chat/language/hotIssues';

const message = useMessage();
const data = ref<Api.Core.Chat.Language.HotIssues[]>([]);
const createColumns = (): DataTableColumns<Api.Core.Chat.Language.HotIssues> => {
  return [
    {
      title: 'ID',
      key: 'id'
    },
    {
      title: '描述',
      key: 'description'
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      defaultSortOrder: false,
      sorter: {
        compare: (row1, row2) => {
          return dayjs(row1.updatedAt).unix() - dayjs(row2.updatedAt).unix();
        },
        multiple: 1
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '',
      key: 'actions',
      render(row) {
        return h('div', null, [
          h(
            NSpace,
            { justify: 'end' },
            {
              default: () => [
                h(
                  NButton,
                  {
                    size: 'small',
                    secondary: true,
                    type: 'error',
                    onClick: () => {
                      fetchDeleteHotIssue(row.id);
                      message.success('删除成功');
                      data.value = data.value.filter(item => item.id !== row.id);
                    }
                  },
                  { default: () => '删除' }
                )
              ]
            }
          )
        ]);
      }
    }
  ];
};

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const columns = createColumns();

const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    description: ''
  }
});
const rules = ref({
  data: {
    description: {
      required: true,
      message: '描述词不能为空',
      trigger: ['input', 'blur']
    }
  }
});

const newHotIssue = async () => {
  try {
    await formRef.value?.validate();
    const res = await fetchCreateHotIssue(formValue.value.data.description);
    data.value.unshift({
      id: res.data.id,
      description: formValue.value.data.description,
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    });
  } catch (error) {
    message.error('新增失败');
  }
};

onMounted(async () => {
  const result = await fetchGetAllHotIssues();
  if (!result.error) {
    data.value = result.data;
  }
});
</script>

<template>
  <NSpace vertical :size="12">
    <NCard title="快捷功能" size="small">
      <NSpace inline>
        <NForm ref="formRef" inline :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="问题描述词" path="data.description">
            <NInput v-model:value="formValue.data.description" placeholder="输入需要创建的问题描述" />
          </NFormItem>
          <NFormItem>
            <NButton class="mr-3" @click="newHotIssue">新增热门问题</NButton>
          </NFormItem>
        </NForm>
      </NSpace>
    </NCard>
    <NCard title="主页热门问题推荐" size="small">
      <NDataTable :columns="columns" :data="filtersDataByPage" :pagination="false" :bordered="false" />
      <div class="flex justify-end pt-12px">
        <NPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          show-size-picker
          :page-sizes="[5, 10, 20, 30, 999]"
        />
      </div>
    </NCard>
  </NSpace>
</template>
