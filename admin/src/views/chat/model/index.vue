<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NSpace, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';
import {
  type PostModelParams,
  type CreateModelParams,
  fetchGetAllModel,
  fetchPostModel,
  fetchCreateModel
} from '@/service/api/core/chat/language/model';

const message = useMessage();
const data = ref<Api.Core.Chat.Language.Model[]>([]);
const createColumns = ({
  editRow
}: {
  editRow: (row: Api.Core.Chat.Language.Model) => void;
}): DataTableColumns<Api.Core.Chat.Language.Model> => {
  return [
    {
      title: 'ID',
      key: 'id'
    },
    {
      title: '模型名称',
      key: 'name'
    },
    {
      title: '花费对话次数',
      key: 'cost',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.cost - b.cost,
        multiple: 1
      },
      render(row) {
        return h('span', { class: 'text-primary font-medium' }, { default: () => row.cost });
      }
    },
    {
      title: '模型型号',
      key: 'model'
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      defaultSortOrder: false,
      sorter: {
        compare: (row1, row2) => {
          return dayjs(row1.updatedAt).unix() - dayjs(row2.updatedAt).unix();
        },
        multiple: 2
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '外部详情链接',
      key: 'relatedUrl',
      ellipsis: {
        tooltip: true
      },
      render(row) {
        if (row.relatedUrl) return h('a', { href: row.relatedUrl, target: '_blank' }, row.relatedUrl);
        return '-';
      }
    },
    {
      title: '图片',
      key: 'imgUrl',
      width: 100,
      ellipsis: { tooltip: true },
      render(row) {
        if (row.imgUrl) return h('a', { href: row.imgUrl, target: '_blank' }, '查看');
        return '-';
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
                onClick: () => editRow(row)
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

const active = ref(false);
const isCreate = ref(false);
const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    id: 0,
    name: '',
    model: '',
    cost: 0,
    relatedUrl: '',
    imgUrl: '',
    apiKey: '',
    baseUrl: ''
  }
});
const rules = ref({
  data: {
    name: {
      required: true,
      message: '模型名称不能为空',
      trigger: ['input', 'blur']
    },
    model: {
      required: true,
      message: '模型型号不能为空',
      trigger: ['input', 'blur']
    },
    cost: {
      required: true,
      trigger: ['input', 'blur'],
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: number) {
        if (!value && value !== 0) {
          return new Error('模型价格不能为空');
        } else if (!/^[0-9]+$/.test(value.toString())) {
          return new Error('格式有误：请输入正整数');
        }
        return true;
      }
    },
    relatedUrl: {
      required: false
    }
  }
});

const openCreateDrawer = () => {
  isCreate.value = true;
  formValue.value.data = {
    id: 0,
    name: '',
    model: '',
    cost: 1,
    relatedUrl: '',
    imgUrl: '',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com'
  };
  active.value = true;
};

const setDrawerDefaultData = (row: Api.Core.Chat.Language.Model) => {
  isCreate.value = false;
  formValue.value.data = {
    id: row.id,
    name: row.name,
    model: row.model,
    cost: row.cost,
    relatedUrl: row.relatedUrl,
    imgUrl: row.imgUrl || '',
    apiKey: row.apiKey || '',
    baseUrl: row.baseUrl || 'https://api.deepseek.com'
  };
};
const setAPieceOfDataById = (row: Partial<Api.Core.Chat.Language.Model>) => {
  const index = data.value.findIndex(item => item.id === row.id);
  if (index !== -1) {
    data.value[index] = {
      ...data.value[index],
      name: row.name || '',
      cost: row.cost || 0,
      relatedUrl: row.relatedUrl || '',
      imgUrl: row.imgUrl || '',
      apiKey: row.apiKey || '',
      baseUrl: row.baseUrl || '',
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };
  }
};
const drawerValidate = async () => {
  try {
    await formRef.value?.validate();

    if (isCreate.value) {
      const p: CreateModelParams = {
        name: formValue.value.data.name,
        model: formValue.value.data.model,
        cost: formValue.value.data.cost,
        relatedUrl: formValue.value.data.relatedUrl || '',
        imgUrl: formValue.value.data.imgUrl || '',
        apiKey: formValue.value.data.apiKey || '',
        baseUrl: formValue.value.data.baseUrl || ''
      };
      const result = await fetchCreateModel(p);
      if (!result.error) {
        data.value.push(result.data);
        message.success('新增成功');
      } else {
        message.error('新增失败');
      }
    } else {
      const p: PostModelParams = {
        id: formValue.value.data.id,
        name: formValue.value.data.name,
        cost: formValue.value.data.cost,
        relatedUrl: formValue.value.data.relatedUrl || '',
        imgUrl: formValue.value.data.imgUrl || '',
        apiKey: formValue.value.data.apiKey || '',
        baseUrl: formValue.value.data.baseUrl || ''
      };
      setAPieceOfDataById(p);
      fetchPostModel(p);
      message.success('修改成功');
    }

    active.value = false;
  } catch (error) {
    message.error('处理失败');
  }
};

const columns = createColumns({
  editRow(row) {
    active.value = true;
    setDrawerDefaultData(row);
  }
});

onMounted(async () => {
  const result = await fetchGetAllModel();
  if (!result.error) {
    data.value = result.data;
  }
});
</script>

<template>
  <NCard title="模型列表" size="small">
    <template #header-extra>
      <NButton type="primary" @click="openCreateDrawer">新增模型</NButton>
    </template>
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

  <NDrawer v-model:show="active" :width="502" placement="right">
    <NDrawerContent :title="isCreate ? '新增模型' : '编辑模型'">
      <template #footer>
        <NButton type="primary" @click="drawerValidate">确认</NButton>
      </template>
      <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
        <NFormItem label="模型名称" path="data.name">
          <NInput v-model:value="formValue.data.name" placeholder="如：DeepSeek Flash" />
        </NFormItem>
        <NFormItem label="模型型号" path="data.model">
          <NInput v-model:value="formValue.data.model" :disabled="!isCreate" placeholder="如：deepseek-v4-flash" />
        </NFormItem>
        <NFormItem label="花费" path="data.cost">
          <NInputNumber v-model:value="formValue.data.cost" :min="0" clearable />
        </NFormItem>
        <NFormItem label="相关链接" path="data.relatedUrl">
          <NInput v-model:value="formValue.data.relatedUrl" placeholder="输入当前模型的相关链接" />
        </NFormItem>
        <NFormItem label="模型图片" path="data.imgUrl">
          <NInput v-model:value="formValue.data.imgUrl" placeholder="如：https://cdn.simpleicons.org/deepseek/1A1A1A" />
        </NFormItem>
        <NFormItem label="API Key" path="data.apiKey">
          <NInput v-model:value="formValue.data.apiKey" type="password" show-password-on="click" placeholder="模型独立的 API Key，留空则使用环境变量" />
        </NFormItem>
        <NFormItem label="API 端点" path="data.baseUrl">
          <NInput v-model:value="formValue.data.baseUrl" placeholder="https://api.deepseek.com" />
        </NFormItem>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
