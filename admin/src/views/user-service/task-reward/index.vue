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
const data = ref<Api.Core.UserService.TaskReward[]>([]);
const data2 = ref<Api.Core.UserService.TaskRewardReceive[]>([]);
const createColumns = ({
  editRow
}: {
  editRow: (row: Api.Core.UserService.TaskReward) => void;
}): DataTableColumns<Api.Core.UserService.TaskReward> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80
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
      title: '条件',
      key: 'condition',
      render(row) {
        return h(NTag, { size: 'small' }, { default: () => row.condition });
      }
    },
    {
      title: '描述',
      key: 'description',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '对话次数',
      key: 'rewardDialogue',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.rewardDialogue - b.rewardDialogue,
        multiple: 2
      },
      render(row) {
        return h('span', { class: 'text-primary font-medium' }, { default: () => row.rewardDialogue });
      }
    },
    {
      title: '绘画次数',
      key: 'rewardPainting',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.rewardPainting - b.rewardPainting,
        multiple: 3
      },
      render(row) {
        return h('span', { class: 'text-error font-medium' }, { default: () => row.rewardPainting });
      }
    },
    {
      title: '',
      key: 'actions',
      render(row) {
        return h(NSpace, null, {
          default: () => [
            h(
              NButton,
              {
                strong: true,
                type: 'info',
                secondary: true,
                size: 'small',
                onClick: () => {
                  editRow(row);
                }
              },
              { default: () => '编辑' }
            )
          ]
        });
      }
    }
  ];
};

const finishedStatus: Record<string, 'default' | 'success' | 'warning'> = {
  '0': 'warning',
  '1': 'success',
  '-1': 'default'
};
const finishedStatus2: Record<string, '已领取' | '已完成' | '进行中'> = {
  '0': '进行中',
  '1': '已完成',
  '-1': '已领取'
};
const createColumns2 = ({
  copyUserId
}: {
  copyUserId: (row: Api.Core.UserService.TaskRewardReceive) => void;
}): DataTableColumns<Api.Core.UserService.TaskRewardReceive> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80
    },
    {
      title: '创建时间',
      key: 'createdAt',
      defaultSortOrder: false,
      sorter: {
        compare: (row1, row2) => {
          return dayjs(row1.createdAt).unix() - dayjs(row2.createdAt).unix();
        },
        multiple: 1
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '用户ID',
      key: 'userId',
      render(row) {
        return h(
          NTag,
          { size: 'small', class: 'cursor-pointer', onClick: () => copyUserId(row) },
          { default: () => row.userId }
        );
      }
    },
    {
      title: '任务ID',
      key: 'taskRewardId'
    },
    {
      title: '完成状态',
      key: 'value',
      render(row) {
        return h(
          NTag,
          { size: 'small', bordered: false, type: finishedStatus[row.value] },
          { default: () => finishedStatus2[row.value] }
        );
      }
    }
  ];
};

const show = ref(false); // 抽屉是否显示出来
const curEditing = ref<Api.Core.UserService.TaskReward>(); // 当前正在编辑的配置信息
const rules = {
  data: {
    condition: {
      required: true,
      trigger: ['input', 'blur'],
      // ^(?:value\s*)?(?:>=|>|=)\s*\d+$
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error('不能为空');
        } else if (value === '0') return true;
        else if (!/^(?:value\s)(?:>=|>|=)\s(?:[1-9]\d*|0)$/.test(value)) {
          return new Error(
            '格式有误：开头是value字符串，中间是运算符>=或=或>，最后是不小于0的数字，他们之间都需要保留一个空格'
          );
        }
        return true;
      }
    },
    description: {
      required: true,
      message: '请输入描述内容',
      trigger: ['input', 'blur']
    },
    rewardDialogue: {
      required: false
    },
    rewardPainting: {
      required: false
    }
  }
};
const formRef = ref<FormInst | null>(null);
const formRef2 = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    condition: '',
    description: '',
    rewardDialogue: 0,
    rewardPainting: 0
  }
});
const setDrawerDefaultData = (row: Api.Core.UserService.TaskReward) => {
  formValue.value.data.condition = row.condition;
  formValue.value.data.description = row.description;
  formValue.value.data.rewardDialogue = row.rewardDialogue;
  formValue.value.data.rewardPainting = row.rewardPainting;
};
const setAPieceOfDataById = (id: number, d: PostTaskStruct) => {
  const index = data.value.findIndex(item => item.id === id);
  if (index !== -1) {
    data.value[index].updatedAt = dayjs().format('YYYY-MM-DD HH:mm');
    data.value[index].condition = d.condition;
    data.value[index].description = d.description;
    data.value[index].rewardDialogue = d.rewardDialogue;
    data.value[index].rewardPainting = d.rewardPainting;
  }
};
async function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  const status: number[] = [];
  await formRef.value?.validate(async errors => {
    if (!errors) {
      status.push(1);
    }
  });
  await formRef2.value?.validate(async errors => {
    if (!errors) {
      status.push(1);
    }
  });

  if (status.length < 2) return;

  // 修改当前行配置数据，做网络请求
  const p = {
    id: curEditing.value!.id,
    condition: formValue.value.data.condition,
    description: formValue.value.data.description,
    rewardDialogue: formValue.value.data.rewardDialogue,
    rewardPainting: formValue.value.data.rewardPainting
  };
  await fetchPostTask(p);
  setAPieceOfDataById(curEditing.value!.id, p);
  message.success('修改成功');
  show.value = false;
}
const columns = createColumns({
  async editRow(row) {
    curEditing.value = row;
    show.value = true;
    setDrawerDefaultData(row);
  }
});
const columns2 = createColumns2({
  copyUserId(row) {
    copy(row.userId.toString(), () => message.success('复制成功'));
  }
});

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
  const result = await fetchGetAllTask();
  if (!result.error) data.value = result.data;

  const result2 = await fetchGetAllTaskRewardReceive();
  if (!result2.error) data2.value = result2.data;
});
</script>

<template>
  <NSpace vertical :size="12">
    <NCard title="任务列表" size="small">
      <NDataTable :columns="columns" :data="filtersDataByPage" :pagination="false" :bordered="false" />
      <div class="w-full flex justify-end p-3 pb-0 pr-0">
        <NPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          show-size-picker
          :page-sizes="[5, 10, 20, 30, 999]"
        />
      </div>
    </NCard>
    <NCard title="奖励可领取状态" size="small">
      <NAlert title="规则" class="mb-4" :bordered="false" type="info">
        完成状态这一列的数据实际上就是任务所对应的值，经过计算后完成状态显示出来。
        <br />
        <ul class="flex items-center gap-4">
          <li>
            1. 当值为”
            <span class="text-warning font-bold">0</span>
            “时表示
            <NTag :bordered="false" size="small" type="warning">进行中</NTag>
            ；
          </li>
          <li>
            2. 当值为”
            <span class="text-success font-bold">1</span>
            “时表示
            <NTag :bordered="false" size="small" type="success">已完成</NTag>
            ；
          </li>
          <li>
            3. 当值为”
            <span class="text-gray font-bold">-1</span>
            “时表示
            <NTag :bordered="false" size="small" type="default">已领取</NTag>
            ；
          </li>
        </ul>
      </NAlert>
      <NDataTable :columns="columns2" :data="filtersDataByPage2" :pagination="false" :bordered="false" />
      <div class="w-full flex justify-end p-3 pb-0 pr-0">
        <NPagination
          v-model:page="page2"
          v-model:page-size="pageSize2"
          :page-count="pageCount2"
          show-size-picker
          :page-sizes="[5, 10, 20, 30, 999]"
        />
      </div>
    </NCard>

    <NDrawer v-model:show="show" :width="500">
      <NDrawerContent title="修改数据" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
        <NAlert title="任务条件格式要求" type="info">
          1. 当值为"0"时，条件为布尔值，会在程序某一入口触发；
          <br />
          2. 当值为表达式，例如"value > 10"，仅当用户所对应任务的值满足表达式时，才可通过；
          <br />
          3. 任务列表每个任务的值可以在”奖励可领取状态“表中查看；
        </NAlert>

        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium" class="mt-5">
          <NFormItem :span="12" label="任务条件" path="data.condition">
            <NInput v-model:value="formValue.data.condition" placeholder="不能为空哦" />
          </NFormItem>
          <NFormItem :span="12" label="任务描述" path="data.description">
            <NInput v-model:value="formValue.data.description" placeholder="不能为空哦" />
          </NFormItem>
        </NForm>

        <NForm ref="formRef2" inline :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem :span="12" label="对话奖励" path="data.rewardDialogue">
            <NInputNumber v-model:value="formValue.data.rewardDialogue" :min="0" />
          </NFormItem>
          <NFormItem :span="12" label="绘画奖励" path="data.rewardPainting">
            <NInputNumber v-model:value="formValue.data.rewardPainting" :min="0" />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </NSpace>
</template>
