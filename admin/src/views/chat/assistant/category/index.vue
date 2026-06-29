<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NSpace, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllCategory, fetchPostCategory } from '@/service/api/core/chat/assistant/category';

const message = useMessage();
const data = ref<Api.Core.Chat.Assistant.Category[]>([]);
const createColumns = ({
  editRow
}: {
  editRow: (row: Api.Core.Chat.Assistant.Category) => void;
}): DataTableColumns<Api.Core.Chat.Assistant.Category> => {
  return [
    {
      title: 'ID',
      key: 'id'
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
      title: '分类名称',
      key: 'name'
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

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const show = ref(false);
const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    id: 0,
    name: ''
  }
});
const rules = {
  data: {
    name: {
      required: true,
      message: '分类名称不能为空',
      trigger: ['input', 'blur']
    }
  }
};

const handleValidateClick = async (e: MouseEvent) => {
  e.preventDefault();

  const index = data.value.findIndex(item => item.id === formValue.value.data.id);
  if (index !== -1) {
    data.value[index].name = formValue.value.data.name;
    data.value[index].updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
  }
  await fetchPostCategory(formValue.value.data.id, formValue.value.data.name);
  message.success('修改成功');
  show.value = false;
};

const columns = createColumns({
  editRow(row) {
    formValue.value.data = {
      name: row.name,
      id: row.id
    };
    show.value = true;
  }
});

onMounted(async () => {
  const result = await fetchGetAllCategory();
  if (!result.error) {
    data.value = result.data;
  }
});
</script>

<template>
  <div>
  <NCard title="订单列表" size="small">
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

  <NDrawer v-model:show="show" placement="bottom" :height="300">
    <NDrawerContent title="修改数据" closable>
      <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
      <NForm ref="formRef" inline :label-width="80" :model="formValue" :rules="rules" size="medium">
        <NFormItem label="分类名称" path="data.name">
          <NInput v-model:value="formValue.data.name" placeholder="输入自定义分类名称" />
        </NFormItem>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
