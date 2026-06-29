<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';
import {
  fetchGetAllTask,
  fetchGetAllTaskRewardReceive,
  fetchPostTask
} from '@/service/api/core/user-service/task-reward';
import type { PostTaskStruct } from '@/service/api/core/user-service/task-reward';
import copy from '@/utils/clipboard';

const message = useMessage();
const loading = ref(true);
const loading2 = ref(true);
const data = ref<Api.Core.UserService.TaskReward[]>([]);
const data2 = ref<Api.Core.UserService.TaskRewardReceive[]>([]);

function editRow(row: Api.Core.UserService.TaskReward) {
  curEditing.value = row;
  show.value = true;
  setDrawerDefaultData(row);
}

const columns: DataTableColumns<Api.Core.UserService.TaskReward> = [
  { title: 'ID', key: 'id', width: 80 },
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
    title: '条件',
    key: 'condition',
    width: 110,
    render(row) {
      return h(NTag, { size: 'small' }, { default: () => row.condition });
    }
  },
  {
    title: '描述',
    key: 'description',
    width: 250,
    ellipsis: { tooltip: true }
  },
  {
    title: '对话次数',
    key: 'rewardDialogue',
    width: 100,
    sorter: (a, b) => a.rewardDialogue - b.rewardDialogue,
    render(row) {
      return h('span', { class: 'text-#6366f1 font-600' }, { default: () => row.rewardDialogue });
    }
  },
  {
    title: '绘画次数',
    key: 'rewardPainting',
    width: 100,
    sorter: (a, b) => a.rewardPainting - b.rewardPainting,
    render(row) {
      return h('span', { class: 'text-#f43f5e font-600' }, { default: () => row.rewardPainting });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render(row) {
      return h(NButton, { quaternary: true, type: 'primary', size: 'small', onClick: () => editRow(row) }, { default: () => '编辑' });
    }
  }
];

const finishedStatus: Record<string, 'default' | 'success' | 'warning'> = {
  '0': 'warning',
  '1': 'success',
  '-1': 'default'
};
const finishedStatusLabel: Record<string, string> = {
  '0': '进行中',
  '1': '已完成',
  '-1': '已领取'
};

const columns2: DataTableColumns<Api.Core.UserService.TaskRewardReceive> = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 170,
    sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    render(row) {
      return h('span', null, { default: () => dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') });
    }
  },
  {
    title: '用户ID',
    key: 'userId',
    width: 130,
    render(row) {
      return h(NTag, { size: 'small', class: 'cursor-pointer', onClick: () => copy(row.userId.toString(), () => message.success('复制成功')) }, { default: () => row.userId });
    }
  },
  { title: '任务ID', key: 'taskRewardId', width: 100 },
  {
    title: '完成状态',
    key: 'value',
    width: 100,
    render(row) {
      return h(NTag, { size: 'small', bordered: false, type: finishedStatus[row.value] || 'default' }, { default: () => finishedStatusLabel[row.value] || row.value });
    }
  }
];

const show = ref(false);
const curEditing = ref<Api.Core.UserService.TaskReward>();
const rules = {
  data: {
    condition: {
      required: true,
      trigger: ['input', 'blur'],
      validator(rule: FormItemRule, value: string) {
        if (!value) return new Error('不能为空');
        if (value === '0') return true;
        if (!/^(?:value\s)(?:>=|>|=)\s(?:[1-9]\d*|0)$/.test(value)) {
          return new Error('格式有误：开头是value字符串，中间是运算符>=或=或>，最后是不小于0的数字，他们之间都需要保留一个空格');
        }
        return true;
      }
    },
    description: { required: true, message: '请输入描述内容', trigger: ['input', 'blur'] },
    rewardDialogue: { required: false },
    rewardPainting: { required: false }
  }
};
const formRef = ref<FormInst | null>(null);
const formRef2 = ref<FormInst | null>(null);
const formValue = ref({
  data: { condition: '', description: '', rewardDialogue: 0, rewardPainting: 0 }
});

function setDrawerDefaultData(row: Api.Core.UserService.TaskReward) {
  formValue.value.data = {
    condition: row.condition,
    description: row.description,
    rewardDialogue: row.rewardDialogue,
    rewardPainting: row.rewardPainting
  };
}

async function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  try {
    await formRef.value?.validate();
    await formRef2.value?.validate();
    const p = {
      id: curEditing.value!.id,
      condition: formValue.value.data.condition,
      description: formValue.value.data.description,
      rewardDialogue: formValue.value.data.rewardDialogue,
      rewardPainting: formValue.value.data.rewardPainting
    };
    await fetchPostTask(p);
    const index = data.value.findIndex(item => item.id === p.id);
    if (index !== -1) {
      data.value[index] = { ...data.value[index], ...p, updatedAt: dayjs().format('YYYY-MM-DD HH:mm') };
    }
    message.success('修改成功');
    show.value = false;
  } catch {
    message.error('请正确填写必填信息');
  }
}

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const page2 = ref(1);
const pageSize2 = ref(20);
const pageCount2 = computed(() => Math.ceil(data2.value.length / pageSize2.value));
const filtersDataByPage2 = computed(() =>
  data2.value.slice((page2.value - 1) * pageSize2.value, page2.value * pageSize2.value)
);

onMounted(async () => {
  const [res1, res2] = await Promise.all([
    fetchGetAllTask(),
    fetchGetAllTaskRewardReceive()
  ]);
  if (!res1.error) data.value = res1.data;
  else message.error(res1.error.message);
  loading.value = false;
  if (!res2.error) data2.value = res2.data;
  else message.error(res2.error.message);
  loading2.value = false;
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-4">
      <NCard size="small" :bordered="true">
        <template #header><span class="text-15px font-600">任务列表</span></template>
        <NDataTable
          :columns="columns"
          :data="filtersDataByPage"
          :loading="loading"
          :bordered="false"
          :scroll-x="900"
        />
        <div class="flex justify-end pt-3">
          <NPagination
            v-model:page="page"
            v-model:page-size="pageSize"
            :page-count="pageCount"
            show-size-picker
            :page-sizes="[10, 20, 50, 100]"
          />
        </div>
      </NCard>

      <NAlert title="规则" type="info">
        <template #default>
          完成状态这一列的数据实际上就是任务所对应的值，经过计算后完成状态显示出来。
          <div class="flex items-center gap-4 mt-2">
            <span>1. 值为 <span class="text-#e6a23c font-bold">0</span>: <NTag size="small" type="warning" :bordered="false">进行中</NTag></span>
            <span>2. 值为 <span class="text-#67c23a font-bold">1</span>: <NTag size="small" type="success" :bordered="false">已完成</NTag></span>
            <span>3. 值为 <span class="text-#999 font-bold">-1</span>: <NTag size="small" type="default" :bordered="false">已领取</NTag></span>
          </div>
        </template>
      </NAlert>

      <NCard size="small" :bordered="true">
        <template #header><span class="text-15px font-600">奖励可领取状态</span></template>
        <NDataTable
          :columns="columns2"
          :data="filtersDataByPage2"
          :loading="loading2"
          :bordered="false"
          :scroll-x="660"
        />
        <div class="flex justify-end pt-3">
          <NPagination
            v-model:page="page2"
            v-model:page-size="pageSize2"
            :page-count="pageCount2"
            show-size-picker
            :page-sizes="[10, 20, 50, 100]"
          />
        </div>
      </NCard>

      <NDrawer v-model:show="show" :width="500">
        <NDrawerContent title="修改数据" closable>
          <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
          <NAlert title="任务条件格式要求" type="info" class="mb-4">
            1. 当值为"0"时，条件为布尔值，会在程序某一入口触发；<br />
            2. 当值为表达式，例如"value > 10"，仅当用户所对应任务的值满足表达式时，才可通过；<br />
            3. 任务列表每个任务的值可以在"奖励可领取状态"表中查看；
          </NAlert>
          <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
            <NFormItem label="任务条件" path="data.condition">
              <NInput v-model:value="formValue.data.condition" placeholder="不能为空" />
            </NFormItem>
            <NFormItem label="任务描述" path="data.description">
              <NInput v-model:value="formValue.data.description" placeholder="不能为空" />
            </NFormItem>
          </NForm>
          <NForm ref="formRef2" inline :label-width="80" :model="formValue" :rules="rules" size="medium" class="mt-3">
            <NFormItem label="对话奖励" path="data.rewardDialogue">
              <NInputNumber v-model:value="formValue.data.rewardDialogue" :min="0" />
            </NFormItem>
            <NFormItem label="绘画奖励" path="data.rewardPainting">
              <NInputNumber v-model:value="formValue.data.rewardPainting" :min="0" />
            </NFormItem>
          </NForm>
        </NDrawerContent>
      </NDrawer>
    </div>
  </div>
</template>
