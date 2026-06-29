<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NImage, NInputNumber, NSpace, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllGoods, fetchPostGoods } from '@/service/api/core/recharge/goods';
import { PageHeader } from '@/components/usage';

const message = useMessage();
const loading = ref(true);
const prefix = import.meta.env.VITE_BACKEND_ADDRESS;
const data = ref<Api.Core.Recharge.Goods[]>([]);

function editRow(row: Api.Core.Recharge.Goods) {
  show.value = true;
  setDrawerDefaultData(row);
}

const columns: DataTableColumns<Api.Core.Recharge.Goods> = [
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
    title: '商品名称',
    key: 'title',
    width: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: '对话次数',
    key: 'dialogueCount',
    width: 100,
    sorter: (a, b) => a.dialogueCount - b.dialogueCount,
    render(row) {
      return h('span', { class: 'text-#6366f1 font-600' }, { default: () => row.dialogueCount });
    }
  },
  {
    title: '绘画次数',
    key: 'paintingCount',
    width: 100,
    sorter: (a, b) => a.paintingCount - b.paintingCount,
    render(row) {
      return h('span', { class: 'text-#f43f5e font-600' }, { default: () => row.paintingCount });
    }
  },
  {
    title: '头图',
    key: 'imgUrl',
    width: 80,
    render(row) {
      return h(NImage, {
        width: '38',
        class: 'bg-transparent rounded-lg p-0.5',
        style: 'background: linear-gradient(135deg, #43cbff 30%, #9708cc 100%)',
        src: prefix + row.imgUrl
      });
    }
  },
  {
    title: '价格',
    key: 'price',
    width: 100,
    sorter: (a, b) => a.price - b.price,
    render(row) {
      return h('span', { class: 'text-#67C23A font-600' }, { default: () => row.price.toFixed(2) });
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

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const show = ref(false);
const rules = {
  data: {
    title: { required: true, message: '请输入商品名称', trigger: ['input', 'blur'] },
    dialogueCount: { required: false },
    paintingCount: { required: false },
    imgUrl: { required: true, message: '请选择商品图片', trigger: ['input', 'blur'] },
    price: {
      required: false,
      trigger: ['input', 'blur'],
      validator(rule: FormItemRule, value: string) {
        if (!value) return new Error('请输入商品价格');
        if (value === '0') return true;
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return new Error('格式有误：请输入数字，可保留两位小数');
        return true;
      }
    }
  }
};
const formRef = ref<FormInst | null>(null);
const formRef2 = ref<FormInst | null>(null);
const formValue = ref({
  data: { id: 0, title: '', dialogueCount: 0, paintingCount: 0, imgUrl: '', price: 0 }
});
const ImgOptions: string[] = [];
const curSelectImgIndex = ref(-1);

function selectImg(url: string) {
  formValue.value.data.imgUrl = url.replace(prefix, '');
  curSelectImgIndex.value = ImgOptions.findIndex(item => item === url);
}

function setDrawerDefaultData(row: Api.Core.Recharge.Goods) {
  formValue.value.data = { ...row };
  selectImg(prefix + row.imgUrl);
}

async function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  try {
    await formRef.value?.validate();
    await formRef2.value?.validate();
    const p = { ...formValue.value.data };
    await fetchPostGoods(p);
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

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetAllGoods();
  if (!result.error) {
    data.value = result.data;
    data.value.forEach(item => {
      const url = prefix + item.imgUrl;
      if (!ImgOptions.includes(url)) ImgOptions.push(url);
    });
  } else {
    message.error(result.error.message);
  }
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="商品管理" />
    <NCard size="small" :bordered="true">
      <template #header><span class="text-15px font-600">商品列表</span></template>
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :loading="loading"
        :bordered="false"
        :scroll-x="950"
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

    <NDrawer v-model:show="show" :width="500">
      <NDrawerContent title="修改数据" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="商品名称" path="data.title">
            <NInput v-model:value="formValue.data.title" placeholder="不能为空" />
          </NFormItem>
          <NFormItem label="头图" path="data.imgUrl">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(imgUrl, index) in ImgOptions"
                :key="imgUrl"
                class="relative cursor-pointer rounded-lg border-2 transition-all"
                :class="curSelectImgIndex === index ? 'border-[var(--n-color-target)] shadow-[0_0_0_2px_var(--n-color-target)] scale-105' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'"
                @click="selectImg(imgUrl)"
              >
                <img :src="imgUrl" width="80" height="80" class="rounded-md block" />
                <div
                  v-if="curSelectImgIndex === index"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--n-color-target)] rounded-full flex items-center justify-center text-white text-xs font-bold"
                >✓</div>
              </div>
            </div>
          </NFormItem>
          <NFormItem label="价格" path="data.price">
            <NInputNumber v-model:value="formValue.data.price" :min="0" clearable :precision="2" />
          </NFormItem>
        </NForm>
        <NForm ref="formRef2" inline :label-width="80" :model="formValue" :rules="rules" size="medium" class="mt-3">
          <NFormItem label="对话次数" path="data.dialogueCount">
            <NInputNumber v-model:value="formValue.data.dialogueCount" :min="0" />
          </NFormItem>
          <NFormItem label="绘画次数" path="data.paintingCount">
            <NInputNumber v-model:value="formValue.data.paintingCount" :min="0" />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
