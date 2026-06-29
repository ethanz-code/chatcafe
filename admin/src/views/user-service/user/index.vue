<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref } from 'vue';
import { NImage, NSpace, NTag, NTooltip, useMessage } from 'naive-ui';
import type { DataTableColumns, DropdownOption, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllUser, fetchPostBalance } from '@/service/api/core/user-service/user';
import copy from '@/utils/clipboard';

const message = useMessage();
const backupData = ref<Api.Core.UserService.User[]>([]);
const data = ref<Api.Core.UserService.User[]>([]);
const createColumns = ({
  copyPassword
}: {
  copyPassword(row: Api.Core.UserService.User): void;
}): DataTableColumns<Api.Core.UserService.User> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80
    },
    {
      title: '账号',
      key: 'phoneNumber',
      render(row) {
        return h(
          NTag,
          {
            type: 'info',
            bordered: false
          },
          {
            default: () => row.phoneNumber
          }
        );
      }
    },
    {
      title: '密码',
      key: 'password',
      render(row) {
        return h(NTooltip, null, {
          trigger: () =>
            h(
              NTag,
              {
                size: 'small',
                class: 'cursor-pointer',
                onClick: () => copyPassword(row)
              },
              { default: () => '******' }
            ),
          default: () => '点击复制密码'
        });
      }
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
      title: '对话余额',
      key: 'dialogueBalance',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.dialogueBalance - b.dialogueBalance,
        multiple: 2
      },
      render(row) {
        return h('span', { class: 'text-primary font-medium' }, { default: () => row.dialogueBalance });
      }
    },
    {
      title: '绘画余额',
      key: 'paintingBalance',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.paintingBalance - b.paintingBalance,
        multiple: 3
      },
      render(row) {
        return h('span', { class: 'text-error font-medium' }, { default: () => row.paintingBalance });
      }
    },
    {
      title: '昵称',
      key: 'name',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '头像',
      key: 'avatar',
      render(row) {
        return h(NImage, {
          width: '45',
          class: 'bg-transparent rounded-full',
          src: import.meta.env.VITE_BACKEND_ADDRESS + row.avatar
        });
      }
    }
  ];
};
const columns = createColumns({
  copyPassword(row) {
    copy(row.password, () => message.success('复制成功'));
  }
});

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const formRef = ref<FormInst | null>(null);
const formRef2 = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    userId: '11000'
  }
});
const formValue2 = ref({
  data: {
    id: 0,
    dialogueBalance: 0,
    paintingBalance: 0
  }
});
const rules = {
  data: {
    userId: {
      required: true,
      trigger: ['input', 'blur'],
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error('请输入用户ID');
        } else if (!/^[1-9]\d*$/.test(value)) {
          return new Error('格式有误：请输入正整数');
        }
        return true;
      }
    }
  }
};
const rules2 = {
  data: {
    dialogueBalance: {
      required: true,
      trigger: ['input', 'blur'],
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: number) {
        if (!value && value !== 0) {
          return new Error('对话余额不能为空');
        } else if (!/^[0-9]+$/.test(value.toString())) {
          return new Error('格式有误：请输入正整数');
        }
        return true;
      }
    },
    paintingBalance: {
      required: true,
      trigger: ['input', 'blur'],
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: number) {
        if (!value && value !== 0) {
          return new Error('绘画余额不能为空');
        } else if (!/^[0-9]+$/.test(value.toString())) {
          return new Error('格式有误：请输入正整数');
        }
        return true;
      }
    }
  }
};
function queryUserById(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async errors => {
    if (!errors) {
      data.value = backupData.value.filter(item => item.id === Number(formValue.value.data.userId));
      if (data.value.length === 0) message.error(`暂无ID: ${formValue.value.data.userId}的用户数据`);
    }
  });
}
function clearUserQuery() {
  data.value = backupData.value;
  message.success('清除成功');
}

const show = ref(false);
const handleValidateClick = async (e: MouseEvent) => {
  e.preventDefault();
  try {
    await formRef2.value?.validate();
    const p = {
      id: formValue2.value.data.id,
      db: formValue2.value.data.dialogueBalance,
      pb: formValue2.value.data.paintingBalance
    };
    const result = await fetchPostBalance(p.id, p.db, p.pb);
    if (!result.error) {
      const index = backupData.value.findIndex(item => item.id === p.id);
      if (index !== -1) {
        backupData.value[index].dialogueBalance = p.db;
        backupData.value[index].paintingBalance = p.pb;
        data.value = backupData.value;

        message.success('修改成功');
      }

      show.value = false;
    }
  } catch (error) {
    message.error('正确输入必填信息');
  }
};

const options: DropdownOption[] = [
  {
    label: '编辑',
    key: 'edit'
  }
];
const showDropdownRef = ref(false);
const xRef = ref(0);
const yRef = ref(0);
function handleSelect() {
  showDropdownRef.value = false;
  show.value = true;
}
function onClickoutside() {
  showDropdownRef.value = false;
}

const rowProps = (row: Api.Core.UserService.User) => {
  return {
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault();
      showDropdownRef.value = false;
      formValue2.value.data = {
        id: row.id,
        dialogueBalance: row.dialogueBalance,
        paintingBalance: row.paintingBalance
      };
      nextTick().then(() => {
        showDropdownRef.value = true;
        xRef.value = e.clientX;
        yRef.value = e.clientY;
      });
    }
  };
};

onMounted(async () => {
  const result = await fetchGetAllUser();
  if (!result.error) {
    backupData.value = result.data;
    data.value = result.data;
  }
});
</script>

<template>
  <div>
  <NCard title="用户列表" size="small">
    <template #header-extra>
      <NForm ref="formRef" inline :label-width="0" :model="formValue" :rules="rules" size="small">
        <NFormItem path="data.userId">
          <NInput v-model:value="formValue.data.userId" placeholder="输入用户ID" style="width:160px" />
        </NFormItem>
        <NFormItem>
          <NButton size="small" attr-type="button" @click="queryUserById">查询</NButton>
          <NButton size="small" class="ml-8px" attr-type="button" @click="clearUserQuery">清除</NButton>
        </NFormItem>
      </NForm>
    </template>
      <NAlert class="mb-4" type="info" :bordered="false">在行数据中右键可以自定义修改账户余额。</NAlert>
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :row-props="rowProps"
        :pagination="false"
        :bordered="false"
      />
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

    <NDrawer v-model:show="show" placement="bottom" :height="300">
      <NDrawerContent title="自定义余额" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
        <NForm ref="formRef2" inline :label-width="80" :model="formValue2" :rules="rules2" size="medium">
          <NFormItem :span="12" label="对话余额" path="data.dialogueBalance">
            <NInputNumber v-model:value="formValue2.data.dialogueBalance" :min="0" clearable />
          </NFormItem>
          <NFormItem :span="12" label="绘画余额" path="data.paintingBalance">
            <NInputNumber v-model:value="formValue2.data.paintingBalance" :min="0" clearable />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>

    <NDropdown
      placement="bottom-start"
      trigger="manual"
      :x="xRef"
      :y="yRef"
      :options="options"
      :show="showDropdownRef"
      :on-clickoutside="onClickoutside"
      @select="handleSelect"
    />
  </div>
</template>
