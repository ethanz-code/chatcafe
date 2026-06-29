<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NImage, NInput, NPopover, NSelect, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, UploadFileInfo } from 'naive-ui';
import dayjs from 'dayjs';
import {
  type PostViewParams,
  fetchDeleteView,
  fetchGetAllViews,
  fetchPostView
} from '@/service/api/core/chat/assistant/view';
import { fetchGetAllCategory } from '@/service/api/core/chat/assistant/category';
import { PageHeader } from '@/components/usage';

const message = useMessage();
const loading = ref(true);
const backupData = ref<Api.Core.Chat.Assistant.View[]>([]);
const data = ref<Api.Core.Chat.Assistant.View[]>([]);
const categoryData = ref<Api.Core.Chat.Assistant.Category[]>([]);
let assistantFile: UploadFileInfo | undefined;
const categoryIdOptions = ref<{ label: string; value: number }[]>([]);

function editRow(row: Api.Core.Chat.Assistant.View) {
  setDrawerDefaultData(row, '修改数据');
  rules.value.data.imgUrl.required = false;
  show.value = true;
}

async function deleteRow(row: Api.Core.Chat.Assistant.View) {
  const result = await fetchDeleteView(row.id);
  if (!result.error) {
    message.info('删除成功');
    data.value = data.value.filter(item => item.id !== row.id);
    backupData.value = data.value;
  }
}

const columns: DataTableColumns<Api.Core.Chat.Assistant.View> = [
  { title: 'ID', key: 'id', width: 80, sorter: (a, b) => Number(b.id) - Number(a.id) },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 170,
    sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    render(row) {
      return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
    }
  },
  { title: '名字', key: 'name', width: 180 },
  {
    title: '助理Logo',
    key: 'imgUrl',
    width: 80,
    render(row) {
      return h(NImage, { width: '36', class: 'bg-transparent rounded-lg', src: import.meta.env.VITE_BACKEND_ADDRESS + row.imgUrl });
    }
  },
  {
    title: '系统提示词',
    key: 'content_zh_CN',
    width: 300,
    ellipsis: { tooltip: true }
  },
  {
    title: '分类',
    key: 'categoryId',
    width: 100,
    render(row) {
      return h(NPopover, null, {
        trigger: () => h(NTag, { size: 'small' }, { default: () => row.categoryId }),
        default: () => categoryData.value.find(item => item.id === row.categoryId)?.name || '-'
      });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 110,
    fixed: 'right',
    render(row) {
      return h('div', { class: 'flex gap-1' }, [
        h(NButton, { quaternary: true, type: 'primary', size: 'small', onClick: () => editRow(row) }, { default: () => '编辑' }),
        h(NButton, { quaternary: true, type: 'error', size: 'small', onClick: () => deleteRow(row) }, { default: () => '删除' })
      ]);
    }
  }
];

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const show = ref(false);
const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: { id: 0, name: '', content_zh_CN: '', categoryId: 1, imgUrl: '' },
  shortcutArea: { name: '数据分析' }
});
const rules = ref({
  data: {
    name: { required: true, message: '助理名称不能为空', trigger: ['input', 'blur'] },
    content_zh_CN: { required: true, message: '系统提示词不能为空', trigger: ['input', 'blur'] },
    categoryId: { required: false },
    imgUrl: { message: '助理Logo必须上传', required: true, trigger: ['input', 'blur'] }
  },
  shortcutArea: {
    name: { required: true, message: '助理名称不能为空', trigger: ['input', 'blur'] }
  }
});

const drawerTitle = ref('');

function setDrawerDefaultData(row: Api.Core.Chat.Assistant.View, title: string) {
  formValue.value.data = { id: row.id, name: row.name, content_zh_CN: row.content_zh_CN, categoryId: row.categoryId, imgUrl: '' };
  drawerTitle.value = title;
}

async function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  const validate = await formRef.value?.validate();
  if (validate) {
    const d: PostViewParams = {
      id: formValue.value.data.id, name: formValue.value.data.name,
      imgBlob: assistantFile?.file || undefined,
      content_zh_CN: formValue.value.data.content_zh_CN,
      categoryId: formValue.value.data.categoryId
    };
    const result = await fetchPostView(d);
    const idx = data.value.findIndex(item => item.id === d.id);
    if (idx !== -1) {
      data.value[idx] = { ...data.value[idx], name: d.name, content_zh_CN: d.content_zh_CN!, categoryId: d.categoryId, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') };
    }
    if (result.data) {
      if (d.id !== -1) {
        data.value[data.value.findIndex(item => item.id === d.id)].imgUrl = result.data;
        backupData.value[backupData.value.findIndex(item => item.id === d.id)].imgUrl = result.data;
      } else {
        formValue.value.data.id = result.data.id;
        data.value.unshift({ ...d, id: result.data.id, imgUrl: result.data.relativePath, updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') });
        backupData.value = data.value;
      }
    }
    message.success('处理成功');
    show.value = false;
  }
}

const formRef2 = ref<FormInst | null>(null);

function queryAssistantByName(name: string) {
  data.value = data.value.filter(item => item.name === name);
}

function clearAssistantQuery() {
  data.value = backupData.value;
}

function newAssistant() {
  show.value = true;
  setDrawerDefaultData({ id: -1, updatedAt: '', name: '', imgUrl: '', content_zh_CN: '', categoryId: 1 }, '新增数据');
  rules.value.data.imgUrl.required = true;
  setTimeout(() => formRef.value?.validate(), 300);
}

function changeAssistantImgEvent(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  assistantFile = undefined;
  formValue.value.data.imgUrl = '';
  if (options.fileList.length === 1) {
    if (!options.file.file?.type.startsWith('image/')) {
      message.error('请上传图片格式的文件');
      options.fileList.pop();
    } else {
      assistantFile = options.file;
      formValue.value.data.imgUrl = options.file.fullPath || '';
    }
  }
}

onMounted(async () => {
  loading.value = true;
  const [res1, categoryRes] = await Promise.all([fetchGetAllViews(), fetchGetAllCategory()]);
  if (!res1.error && !categoryRes.error) {
    data.value = res1.data;
    backupData.value = res1.data;
    categoryData.value = categoryRes.data;
    data.value.forEach(item => {
      const cat = categoryData.value.find(d => d.id === item.categoryId);
      if (cat && !categoryIdOptions.value.find(c => c.value === item.categoryId)) {
        categoryIdOptions.value.push({ label: `ID:${item.categoryId} ${cat.name}`, value: item.categoryId });
      }
    });
  } else {
    if (res1.error) message.error(res1.error.message);
    if (categoryRes.error) message.error(categoryRes.error.message);
  }
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="助手一览" />
    <NCard size="small" :bordered="true">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-15px font-600">助手列表</span>
          <div class="flex items-center gap-2">
            <NInput v-model:value="formValue.shortcutArea.name" placeholder="输入助理名称" style="width:160px" size="small" />
            <NButton size="small" @click="queryAssistantByName(formValue.shortcutArea.name)">查询</NButton>
            <NButton size="small" @click="clearAssistantQuery">清除</NButton>
            <NButton size="small" type="primary" @click="newAssistant">新增</NButton>
          </div>
        </div>
      </template>
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :loading="loading"
        :bordered="false"
        :scroll-x="1050"
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

    <NDrawer v-model:show="show" :width="380">
      <NDrawerContent :title="drawerTitle" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
        <NForm ref="formRef" :label-width="90" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="助理名称" path="data.name">
            <NInput v-model:value="formValue.data.name" placeholder="输入自定义助理名称" />
          </NFormItem>
          <NFormItem label="系统提示词" path="data.content_zh_CN">
            <NInput v-model:value="formValue.data.content_zh_CN" placeholder="输入自定义系统提示词" />
          </NFormItem>
          <NFormItem label="助理分类" path="data.categoryId">
            <NSelect v-model:value="formValue.data.categoryId" placeholder="选择分类" :options="categoryIdOptions" />
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
