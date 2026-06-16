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
const data = ref<Api.Core.UserService.ActivationCode[]>([]);
const createColumns = ({
  deleteRow,
  copyCode
}: {
  deleteRow: (row: Api.Core.UserService.ActivationCode) => void;
  copyCode: (row: Api.Core.UserService.ActivationCode) => void;
}): DataTableColumns<Api.Core.UserService.ActivationCode> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 100
    },
    {
      title: '代码',
      key: 'code',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      sorter: (row1, row2) => {
        return dayjs(row1.updatedAt).unix() - dayjs(row2.updatedAt).unix();
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '对话次数',
      key: 'dialogueCount',
      width: 200,
      render(row) {
        return h('span', { class: 'text-primary font-medium' }, { default: () => row.dialogueCount });
      }
    },
    {
      title: '绘画次数',
      key: 'paintingCount',
      width: 200,
      render(row) {
        return h('span', { class: 'text-error font-medium' }, { default: () => row.paintingCount });
      }
    },
    {
      title: '',
      key: 'actions',
      render(row) {
        return h(NSpace, null, {
          default: () => [
            h(
              NTooltip,
              {
                trigger: 'hover'
              },
              {
                default: () => row.description,
                trigger: () =>
                  h(
                    NButton,
                    {
                      strong: true,
                      secondary: true,
                      size: 'small'
                    },
                    { default: () => '帮助' }
                  )
              }
            ),
            h(
              NButton,
              {
                strong: true,
                type: 'info',
                secondary: true,
                size: 'small',
                onClick: () => copyCode(row)
              },
              { default: () => '复制代码' }
            ),
            h(
              NButton,
              {
                strong: true,
                type: 'error',
                secondary: true,
                size: 'small',
                onClick: () => deleteRow(row)
              },
              { default: () => '删除' }
            )
          ]
        });
      }
    }
  ];
};
const columns = createColumns({
  async deleteRow(row) {
    const result = await fetchDeleteActicationCode(row.id);
    if (!result.error) {
      message.success('已删除该记录');
      data.value = data.value.filter(item => item.id !== row.id);
    } else {
      message.error(result.error.message);
    }
  },
  copyCode(row) {
    copy(row.code, () => message.success('复制成功'));
  }
});
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
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error('请输入对话次数');
        } else if (!/^[1-9]\d*$/.test(value)) {
          return new Error('格式有误：请输入正整数');
        }
        return true;
      }
    },
    paintingCount: {
      required: true,
      trigger: ['input', 'blur'],
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error('请输入对话次数');
        } else if (!/^[1-9]\d*$/.test(value)) {
          return new Error('格式有误：请输入正整数');
        }
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
  const result = await fetchGetActicationCode();
  if (!result.error) data.value = result.data;
});
</script>

<template>
  <NSpace vertical :size="12">
    <NAlert type="info">
      输入正确的密码，想要的对话，绘画次数点击“生成”即可生成出特有代码，可在客户端“用户” => “我的服务” =>
      ”卡密兑换“中使用。
    </NAlert>
    <NCard title="卡密生成" size="small">
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
          <NButton attr-type="button" @click="handleValidateClick">生成</NButton>
        </NFormItem>
      </NForm>
    </NCard>
    <NCard title="卡密列表" size="small">
      <NDataTable :columns="columns" :data="data" :pagination="false" :bordered="false" />
    </NCard>
  </NSpace>
</template>
