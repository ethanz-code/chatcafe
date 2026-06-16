<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NImage, NSpace, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst, FormItemRule } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllGoods, fetchPostGoods } from '@/service/api/core/recharge/goods';

const message = useMessage();
const prefix = import.meta.env.VITE_BACKEND_ADDRESS;
const data = ref<Api.Core.Recharge.Goods[]>([]);
const createColumns = ({
  editRow
}: {
  editRow: (row: Api.Core.Recharge.Goods) => void;
}): DataTableColumns<Api.Core.Recharge.Goods> => {
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
      title: '商品名称',
      key: 'title',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '对话次数',
      key: 'dialogueCount',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.dialogueCount - b.dialogueCount,
        multiple: 2
      },
      render(row) {
        return h('span', { class: 'text-primary font-medium' }, { default: () => row.dialogueCount });
      }
    },
    {
      title: '绘画次数',
      key: 'paintingCount',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.paintingCount - b.paintingCount,
        multiple: 3
      },
      render(row) {
        return h('span', { class: 'text-error font-medium' }, { default: () => row.paintingCount });
      }
    },
    {
      title: '头图',
      key: 'imgUrl',
      render(row) {
        return h(NImage, {
          width: '38',
          class: 'bg-transparent rounded-lg p-1',
          style: 'background-image: linear-gradient(135deg, rgb(67, 203, 255) 30%, rgb(151, 8, 204) 100%);',
          src: prefix + row.imgUrl
        });
      }
    },
    {
      title: '价格',
      key: 'price',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.price - b.price,
        multiple: 3
      },
      render(row) {
        return h('span', { class: 'text-success font-medium' }, { default: () => row.price });
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

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const show = ref(false); // 抽屉是否显示出来
const rules = {
  data: {
    title: {
      required: true,
      message: '请输入商品名称',
      trigger: ['input', 'blur']
    },
    dialogueCount: {
      required: false
    },
    paintingCount: {
      required: false
    },
    imgUrl: {
      required: true,
      message: '请选择商品图片',
      trigger: ['input', 'blur']
    },
    price: {
      required: false,
      trigger: ['input', 'blur'],
      // ^\d+(\.\d{1,2})?$
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      validator(rule: FormItemRule, value: string) {
        if (!value) {
          return new Error('请输入商品价格');
        } else if (value === '0') return true;
        else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          return new Error('格式有误：请输入数字，可保留两位小数');
        }
        return true;
      }
    }
  }
};
const formRef = ref<FormInst | null>(null);
const formRef2 = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    id: 0,
    title: '',
    dialogueCount: 0,
    paintingCount: 0,
    imgUrl: '',
    price: 0
  }
});
const ImgOptions: string[] = [];
const curSelectImgIndex = ref(-1);
const selectImg = (url: string) => {
  const url2 = url.replace(prefix, '');
  formValue.value.data.imgUrl = url2;
  curSelectImgIndex.value = ImgOptions.findIndex(item => item === url);
};
const setDrawerDefaultData = (row: Api.Core.Recharge.Goods) => {
  formValue.value.data = {
    id: row.id,
    title: row.title,
    dialogueCount: row.dialogueCount,
    paintingCount: row.paintingCount,
    imgUrl: row.imgUrl,
    price: row.price
  };
  selectImg(prefix + row.imgUrl);
};
const setAPieceOfDataById = (id: number, d: Partial<Api.Core.Recharge.Goods>) => {
  const index = data.value.findIndex(item => item.id === id);
  if (index !== -1) {
    data.value[index] = { ...data.value[index], ...d, updatedAt: dayjs().format('YYYY-MM-DD HH:mm') };
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
    ...formValue.value.data
  };
  await fetchPostGoods(p);
  setAPieceOfDataById(p.id, p);
  message.success('修改成功');
  show.value = false;
}

const columns = createColumns({
  editRow(row) {
    show.value = true;
    setDrawerDefaultData(row);
  }
});

onMounted(async () => {
  const result = await fetchGetAllGoods();
  if (!result.error) {
    data.value = result.data;
    data.value.forEach(item => {
      if (!ImgOptions.includes(prefix + item.imgUrl)) ImgOptions.push(prefix + item.imgUrl);
    });
  }
});
</script>

<template>
  <NSpace vertical :size="12">
    <NCard title="商品列表" size="small">
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

    <NDrawer v-model:show="show" :width="500">
      <NDrawerContent title="修改数据" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>

        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem :span="12" label="商品名称" path="data.title">
            <NInput v-model:value="formValue.data.title" placeholder="不能为空哦" />
          </NFormItem>
          <NFormItem :span="12" label="头图" path="data.imgUrl">
            <img
              v-for="(imgUrl, index) in ImgOptions"
              :key="imgUrl"
              :src="imgUrl"
              class="mr-2 cursor-pointer border rounded-lg transition-all hover:border-primary"
              :class="[curSelectImgIndex === index ? 'shadow-md border-primary' : '']"
              width="80"
              height="80"
              @click="selectImg(imgUrl)"
            />
          </NFormItem>
          <NFormItem :span="12" label="价格" path="data.price">
            <NInputNumber v-model:value="formValue.data.price" :min="0.0" clearable :precision="2" />
          </NFormItem>
        </NForm>

        <NForm ref="formRef2" inline :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem :span="12" label="对话次数" path="data.dialogueCount">
            <NInputNumber v-model:value="formValue.data.dialogueCount" :min="0" />
          </NFormItem>
          <NFormItem :span="12" label="绘画次数" path="data.paintingCount">
            <NInputNumber v-model:value="formValue.data.paintingCount" :min="0" />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </NSpace>
</template>
