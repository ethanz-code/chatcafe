<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { NButton, NSpace, NTooltip, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';

import { fetchGetConfiguration, fetchPostConfiguration } from '@/service/api/core/configuration';

const data = ref<Api.Core.Configuration[]>([]);

const createColumns = ({
  edit
}: {
  edit: (row: Api.Core.Configuration) => void;
}): DataTableColumns<Api.Core.Configuration> => {
  return [
    {
      title: 'ID',
      key: 'id'
    },
    {
      title: '名称',
      key: 'name'
    },
    {
      title: '值',
      key: 'value'
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
                onClick: () => edit(row)
              },
              { default: () => '编辑' }
            )
          ]
        });
      }
    }
  ];
};

const show = ref(false); // 抽屉是否显示出来
const curEditing = ref<Api.Core.Configuration>(); // 当前正在编辑的配置信息

const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    name: '',
    value: ''
  }
});
const setDrawerDefaultData = (row: Api.Core.Configuration) => {
  formValue.value.data.name = row.name;
  formValue.value.data.value = row.value;
};
const setAPieceOfDataById = (id: number, d: { name: string; value: string }) => {
  const index = data.value.findIndex(item => item.id === id);
  if (index !== -1) {
    data.value[index].name = d.name;
    data.value[index].value = d.value;
    data.value[index].updatedAt = dayjs().format('YYYY-MM-DD HH:mm');
  }
};
const rules = {
  data: {
    name: {
      required: true,
      trigger: 'blur',
      // eslint-disable-next-line
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error('请输入名称');
        } else if (!/^(?!-)[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(?<!-)$/.test(value)) {
          return new Error('格式有误：数字、字母、中划线组成，且不能以中划线开头或结尾');
        }
        return true;
      }
    },
    value: {
      required: true,
      message: '请输入值',
      trigger: ['input', 'blur']
    }
  }
};
const message = useMessage();
function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async errors => {
    if (!errors) {
      // 修改当前行配置数据，做网络请求
      const p = {
        id: curEditing.value!.id,
        name: formValue.value.data.name,
        value: formValue.value.data.value
      };
      await fetchPostConfiguration(p.id, p.name, p.value);
      setAPieceOfDataById(curEditing.value!.id, { name: p.name, value: p.value });
      message.success('修改成功');
      show.value = false;
    }
  });
}

const columns = createColumns({
  edit(row) {
    curEditing.value = row;
    show.value = true;
    setDrawerDefaultData(row);
  }
});

onMounted(async () => {
  const result = await fetchGetConfiguration();
  if (result.error) return;
  data.value = result.data;
});
</script>

<template>
  <div>
  <NAlert type="warning">请谨慎修改配置信息，修改后需要重启API服务程序才可生效，若有疑问之处联系开发者。</NAlert>
  <NCard title="配置信息" size="small">
    <NDataTable :columns="columns" :data="data" :pagination="false" :bordered="false" />
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
</template>
