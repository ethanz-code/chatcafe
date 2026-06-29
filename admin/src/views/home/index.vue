<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { NButton, NTooltip, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetConfiguration, fetchPostConfiguration } from '@/service/api/core/configuration';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.Configuration[]>([]);

function edit(row: Api.Core.Configuration) {
  curEditing.value = row;
  show.value = true;
  formValue.value.data = { name: row.name, value: row.value };
}

const columns: DataTableColumns<Api.Core.Configuration> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '名称', key: 'name', width: 200 },
  { title: '值', key: 'value', width: 250, ellipsis: { tooltip: true } },
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
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(NTooltip, { trigger: 'hover' }, {
          default: () => row.description,
          trigger: () => h(NButton, { quaternary: true, size: 'small' }, { default: () => '帮助' })
        }),
        h(NButton, { quaternary: true, type: 'primary', size: 'small', onClick: () => edit(row) }, { default: () => '编辑' })
      ]);
    }
  }
];

const show = ref(false);
const curEditing = ref<Api.Core.Configuration>();
const formRef = ref<FormInst | null>(null);
const formValue = ref({ data: { name: '', value: '' } });
const rules = {
  data: {
    name: {
      required: true,
      trigger: 'blur',
      validator(rule: FormItemRule, value: string) {
        if (!value) return new Error('请输入名称');
        if (!/^(?!-)[a-zA-Z0-9_]+(-[a-zA-Z0-9_]+)*(?<!-)$/.test(value)) return new Error('格式有误：数字、字母、下划线、中划线组成，且不能以中划线开头或结尾');
        return true;
      }
    },
    value: { required: true, message: '请输入值', trigger: ['input', 'blur'] }
  }
};

async function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  try {
    await formRef.value?.validate();
    const p = { id: curEditing.value!.id, name: formValue.value.data.name, value: formValue.value.data.value };
    await fetchPostConfiguration(p.id, p.name, p.value);
    const index = data.value.findIndex(item => item.id === p.id);
    if (index !== -1) {
      data.value[index] = { ...data.value[index], name: p.name, value: p.value, updatedAt: dayjs().format('YYYY-MM-DD HH:mm') };
    }
    message.success('修改成功');
    show.value = false;
  } catch {
    message.error('请正确填写必填信息');
  }
}

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetConfiguration();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <NCard size="small" :bordered="true">
      <template #header><span class="text-15px font-600">配置信息</span></template>
      <NDataTable
        :columns="columns"
        :data="data"
        :loading="loading"
        :bordered="false"
        :scroll-x="750"
      />
    </NCard>

    <NDrawer v-model:show="show" :width="360">
      <NDrawerContent title="修改数据" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="名称" path="data.name">
            <NInput v-model:value="formValue.data.name" placeholder="输入名称" />
          </NFormItem>
          <NFormItem label="值" path="data.value">
            <NInput v-model:value="formValue.data.value" placeholder="输入值" />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
