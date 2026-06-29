<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NImage, NPopover, NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, UploadFileInfo } from 'naive-ui';
import dayjs from 'dayjs';
import {
  type PostViewParams,
  fetchDeleteView,
  fetchGetAllViews,
  fetchPostView
} from '@/service/api/core/chat/assistant/view';
import { fetchGetAllCategory } from '@/service/api/core/chat/assistant/category';

const message = useMessage();
const backupData = ref<Api.Core.Chat.Assistant.View[]>([]);
const data = ref<Api.Core.Chat.Assistant.View[]>([]);
const categoryData = ref<Api.Core.Chat.Assistant.Category[]>([]);
let assistantFile: UploadFileInfo | undefined;
const categoryIdOptions = ref<{ label: string; value: number }[]>([]);
const createColumns = ({
  editRow,
  deleteRow
}: {
  editRow: (row: Api.Core.Chat.Assistant.View) => void;
  deleteRow: (row: Api.Core.Chat.Assistant.View) => void;
}): DataTableColumns<Api.Core.Chat.Assistant.View> => {
  return [
    {
      title: 'ID',
      key: 'id',
      defaultSortOrder: false,
      sorter: (row1, row2) => {
        return Number(row2.id) - Number(row1.id);
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
      title: '名字',
      key: 'name'
    },
    {
      title: '助理Logo',
      key: 'imgUrl',
      render(row) {
        return h(NImage, {
          width: '45',
          class: 'bg-transparent rounded-lg',
          src: import.meta.env.VITE_BACKEND_ADDRESS + row.imgUrl
        });
      }
    },
    {
      title: '系统提示词',
      key: 'content_zh_CN',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '分类ID',
      key: 'categoryId',
      render(row) {
        return h(NPopover, null, {
          trigger: () => h(NTag, { size: 'small' }, { default: () => row.categoryId }),
          default: () => categoryData.value.find(item => item.id === row.categoryId)?.name
        });
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
                type: 'error',
                secondary: true,
                size: 'small',
                onClick: () => {
                  deleteRow(row);
                }
              },
              { default: () => '删除' }
            ),
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
    name: '',
    content_zh_CN: '',
    categoryId: 1,
    imgUrl: ''
  },
  shortcutArea: {
    name: '数据分析'
  }
});
const rules = ref({
  data: {
    name: {
      required: true,
      message: '助理名称不能为空',
      trigger: ['input', 'blur']
    },
    content_zh_CN: {
      required: true,
      message: '系统提示词不能为空',
      trigger: ['input', 'blur']
    },
    categoryId: {
      required: false
    },
    imgUrl: {
      message: '助理Logo必须上传',
      required: true,
      trigger: ['input', 'blur']
    }
  },
  shortcutArea: {
    name: {
      required: true,
      message: '助理名称不能为空',
      trigger: ['input', 'blur']
    }
  }
});

const drawerTitle = ref('');
const setDrawerDefaultData = (row: Api.Core.Chat.Assistant.View, title: string) => {
  formValue.value.data = {
    id: row.id,
    name: row.name,
    content_zh_CN: row.content_zh_CN,
    categoryId: row.categoryId,
    imgUrl: ''
  };
  drawerTitle.value = title;
};
const setAPieceOfDataById = (row: Partial<Api.Core.Chat.Assistant.View>) => {
  const index = data.value.findIndex(item => item.id === row.id);
  if (index !== -1) {
    data.value[index] = {
      ...data.value[index],
      name: row.name || '',
      content_zh_CN: row.content_zh_CN || '',
      categoryId: row.categoryId || 0,
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };
  }
};
const handleValidateClick = async (e: MouseEvent) => {
  e.preventDefault();
  const validate = await formRef.value?.validate();
  if (validate) {
    const d: PostViewParams = {
      id: formValue.value.data.id,
      name: formValue.value.data.name,
      imgBlob: assistantFile?.file || undefined,
      content_zh_CN: formValue.value.data.content_zh_CN,
      categoryId: formValue.value.data.categoryId
    };
    const result = await fetchPostView(d);
    setAPieceOfDataById(formValue.value.data);
    if (result.data && d.id !== -1) {
      data.value[data.value.findIndex(item => item.id === d.id)].imgUrl = result.data;
      backupData.value[data.value.findIndex(item => item.id === d.id)].imgUrl = result.data;
    } else if (result.data && d.id === -1) {
      formValue.value.data.id = result.data.id;
      d.id = result.data.id;
      data.value.unshift({ ...d, imgUrl: result.data.relativePath, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') });
      backupData.value = data.value;
    }

    message.success('处理成功');
    show.value = false;
  }
};
const columns = createColumns({
  editRow(row) {
    setDrawerDefaultData(row, '修改数据');
    rules.value.data.imgUrl.required = false;
    show.value = true;
  },
  async deleteRow(row) {
    const result = await fetchDeleteView(row.id);
    if (!result.error) {
      message.info('删除成功');
      data.value = data.value.filter(item => item.id !== row.id);
      backupData.value = data.value;
    }
  }
});

function isImageFile(file: File | null | undefined) {
  return file?.type.startsWith('image/');
}
const changeAssistantImgEvent = (options: { file: UploadFileInfo; fileList: Array<UploadFileInfo>; event?: Event }) => {
  // console.log(options.file.file);
  assistantFile = undefined;
  formValue.value.data.imgUrl = '';
  if (options.fileList.length === 1) {
    if (!isImageFile(options.file.file)) {
      message.error('请上传图片格式的文件');
      options.fileList.pop();
    } else {
      assistantFile = options.file;
      formValue.value.data.imgUrl = options.file.fullPath || '';
    }
  }
  formRef.value?.validate();
};

const formRef2 = ref<FormInst | null>(null);
async function queryAssistantByName(name: string) {
  const res = await formRef2.value?.validate();
  if (res) {
    data.value = data.value.filter(item => item.name === name);
  }
}
function clearAssistantQuery() {
  data.value = backupData.value;
}
function newAssistant() {
  show.value = true;
  const p: Api.Core.Chat.Assistant.View = {
    id: -1,
    updatedAt: '',
    name: '',
    imgUrl: '',
    content_zh_CN: '',
    categoryId: 1
  };
  setDrawerDefaultData(p, '新增数据');
  rules.value.data.imgUrl.required = true;
  const timer = setTimeout(() => {
    formRef.value?.validate();
    clearTimeout(timer);
  }, 300);
}

onMounted(async () => {
  const result = await fetchGetAllViews();
  const categoryResult = await fetchGetAllCategory();
  if (!result.error && !categoryResult.error) {
    data.value = result.data;
    backupData.value = result.data;
    categoryData.value = categoryResult.data;
    data.value.forEach(item => {
      if (categoryIdOptions.value.findIndex(cate => cate.value === item.categoryId) === -1)
        categoryIdOptions.value.push({
          label: `ID: ${item.categoryId} ${categoryData.value.filter(d => d.id === item.categoryId)[0].name}`,
          value: item.categoryId
        });
    });
  }
});
</script>

<template>
  <div>
  <NCard title="助手列表" size="small">
    <template #header-extra>
      <NForm ref="formRef2" inline :label-width="0" :model="formValue" :rules="rules" size="small">
        <NFormItem path="shortcutArea.name">
          <NInput v-model:value="formValue.shortcutArea.name" placeholder="输入助理名称" style="width:160px" />
        </NFormItem>
        <NFormItem>
          <NButton size="small" attr-type="button" @click="queryAssistantByName(formValue.shortcutArea.name)">
            查询
          </NButton>
          <NButton size="small" class="ml-8px" secondary type="error" attr-type="button" @click="clearAssistantQuery">
            清除
          </NButton>
          <NButton size="small" class="ml-8px" secondary type="success" @click="newAssistant">新增</NButton>
        </NFormItem>
      </NForm>
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

    <NDrawer v-model:show="show" :width="380">
      <NDrawerContent :title="drawerTitle" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="助理名称" path="data.name">
            <NInput v-model:value="formValue.data.name" placeholder="输入自定义助理名称" />
          </NFormItem>
          <NFormItem label="系统提示词" path="data.content_zh_CN">
            <NInput v-model:value="formValue.data.content_zh_CN" placeholder="输入自定义系统提示词" />
          </NFormItem>
          <NFormItem label="助理分类" path="data.categoryId">
            <NSelect v-model:value="formValue.data.categoryId" placeholder="选择分类ID" :options="categoryIdOptions" />
          </NFormItem>
          <NFormItem label="助理Logo" path="data.imgUrl">
            <NUpload :on-change="changeAssistantImgEvent" :max="1">
              <NButton>上传文件</NButton>
            </NUpload>
            <NInput v-model:value="formValue.data.imgUrl" class="hidden" />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
