<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { NButton, NSpace, NTooltip, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';
import {
  fetchCreateActicationCode,
  fetchDeleteActicationCode,
  fetchGetActicationCode
} from '@/service/api/core/user-service/activation-code';
import copy from '@/utils/clipboard';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.UserService.ActivationCode[]>([]);

async function deleteRow(row: Api.Core.UserService.ActivationCode) {
  const result = await fetchDeleteActicationCode(row.id);
  if (!result.error) {
    message.success('已删除该记录');
    data.value = data.value.filter(item => item.id !== row.id);
  } else {
    message.error(result.error.message);
  }
}

const columns: DataTableColumns<Api.Core.UserService.ActivationCode> = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '代码',
    key: 'code',
    width: 220,
    ellipsis: { tooltip: true }
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 170,
    sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    render(row) {
      return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
    }
  },
  {
    title: '对话次数',
    key: 'dialogueCount',
    width: 100,
    render(row) {
      return h('span', { class: 'text-#6366f1 font-600' }, { default: () => row.dialogueCount });
    }
  },
  {
    title: '绘画次数',
    key: 'paintingCount',
    width: 100,
    render(row) {
      return h('span', { class: 'text-#f43f5e font-600' }, { default: () => row.paintingCount });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render(row) {
      return h(NSpace, null, {
        default: () => [
          h(NTooltip, { trigger: 'hover' }, {
            default: () => row.description,
            trigger: () => h(NButton, { quaternary: true, size: 'small' }, { default: () => '帮助' })
          }),
          h(NButton, { quaternary: true, type: 'info', size: 'small', onClick: () => copy(row.code, () => message.success('复制成功')) }, { default: () => '复制代码' }),
          h(NButton, { quaternary: true, type: 'error', size: 'small', onClick: () => deleteRow(row) }, { default: () => '删除' })
        ]
      });
    }
  }
];

const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    password: '',
    dialogueCount: '0',
    paintingCount: '0'
  }
});
const rules = {
  data: {
    password: {
      required: true,
      trigger: 'blur',
      message: '请输入卡密密码'
    },
    dialogueCount: {
      required: true,
      trigger: ['input', 'blur'],
      validator(rule: FormItemRule, value: string) {
        if (!value) return new Error('请输入对话次数');
        if (!/^[1-9]\d*$/.test(value)) return new Error('格式有误：请输入正整数');
        return true;
      }
    },
    paintingCount: {
      required: true,
      trigger: ['input', 'blur'],
      validator(rule: FormItemRule, value: string) {
        if (!value) return new Error('请输入对话次数');
        if (!/^[1-9]\d*$/.test(value)) return new Error('格式有误：请输入正整数');
        return true;
      }
    }
  }
};

function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async errors => {
    if (!errors) {
      const params = {
        password: formValue.value.data.password,
        dialogueCount: Number(formValue.value.data.dialogueCount),
        paintingCount: Number(formValue.value.data.paintingCount)
      };
      const result = await fetchCreateActicationCode(params);
      if (!result.error) {
        message.success('生成成功');
        data.value.push(result.data);
      } else message.error(result.error.message);
    } else message.error('格式有误！');
  });
}

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetActicationCode();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-4">
      <NCard size="small" :bordered="true">
        <template #header><span class="text-15px font-600">卡密生成</span></template>
        <NForm ref="formRef" inline :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="密码" path="data.password">
            <NInput v-model:value="formValue.data.password" placeholder="输入卡密生成密码" />
          </NFormItem>
          <NFormItem label="对话次数" path="data.dialogueCount">
            <NInput v-model:value="formValue.data.dialogueCount" placeholder="输入对话次数" />
          </NFormItem>
          <NFormItem label="绘画次数" path="data.paintingCount">
            <NInput v-model:value="formValue.data.paintingCount" placeholder="输入绘画次数" />
          </NFormItem>
          <NFormItem>
            <NButton attr-type="button" type="primary" @click="handleValidateClick">生成</NButton>
          </NFormItem>
        </NForm>
      </NCard>
      <NCard size="small" :bordered="true">
        <template #header><span class="text-15px font-600">卡密列表</span></template>
        <NDataTable
          :columns="columns"
          :data="data"
          :loading="loading"
          :bordered="false"
          :scroll-x="1000"
        />
      </NCard>
    </div>
  </div>
</template>
