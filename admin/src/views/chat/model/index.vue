<script setup lang="ts">
import { computed, h, onMounted, ref } from "vue";
import { NButton, useMessage } from "naive-ui";
import type { DataTableColumns, FormInst, FormItemRule } from "naive-ui";
import dayjs from "dayjs";
import {
  type PostModelParams,
  type CreateModelParams,
  fetchGetAllModel,
  fetchPostModel,
  fetchCreateModel,
  fetchTestModelConnection,
} from "@/service/api/core/chat/language/model";
import { PageHeader } from "@/components/usage";

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.Chat.Language.Model[]>([]);

function editRow(row: Api.Core.Chat.Language.Model) {
  active.value = true;
  setDrawerDefaultData(row);
}

const columns: DataTableColumns<Api.Core.Chat.Language.Model> = [
  { title: "ID", key: "id", width: 80 },
  { title: "模型名称", key: "name", width: 180 },
  {
    title: "花费对话次数",
    key: "cost",
    width: 110,
    sorter: (a, b) => a.cost - b.cost,
    render(row) {
      return h(
        "span",
        { class: "text-#6366f1 font-600" },
        { default: () => row.cost },
      );
    },
  },
  { title: "模型型号", key: "model", width: 180 },
  {
    title: "更新时间",
    key: "updatedAt",
    width: 170,
    sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    render(row) {
      return h("span", null, {
        default: () => dayjs(row.updatedAt).format("YYYY-MM-DD HH:mm"),
      });
    },
  },
  {
    title: "外部详情链接",
    key: "relatedUrl",
    width: 200,
    ellipsis: { tooltip: true },
    render(row) {
      return row.relatedUrl
        ? h(
            "a",
            { href: row.relatedUrl, target: "_blank", class: "text-#6366f1" },
            row.relatedUrl,
          )
        : "-";
    },
  },
  {
    title: "图片",
    key: "imgUrl",
    width: 80,
    render(row) {
      return row.imgUrl
        ? h(
            "a",
            { href: row.imgUrl, target: "_blank", class: "text-#6366f1" },
            "查看",
          )
        : "-";
    },
  },
  {
    title: "操作",
    key: "actions",
    width: 80,
    fixed: "right",
    render(row) {
      return h(
        NButton,
        {
          quaternary: true,
          type: "primary",
          size: "small",
          onClick: () => editRow(row),
        },
        { default: () => "编辑" },
      );
    },
  },
];

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice(
    (page.value - 1) * pageSize.value,
    page.value * pageSize.value,
  ),
);

const active = ref(false);
const isCreate = ref(false);
const testingConnection = ref(false);
const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    id: 0,
    name: "",
    model: "",
    cost: 0,
    relatedUrl: "",
    imgUrl: "",
    apiKey: "",
    baseUrl: "",
  },
});
const rules = {
  data: {
    name: {
      required: true,
      message: "模型名称不能为空",
      trigger: ["input", "blur"],
    },
    model: {
      required: true,
      message: "模型型号不能为空",
      trigger: ["input", "blur"],
    },
    cost: {
      required: true,
      trigger: ["input", "blur"],
      validator(rule: FormItemRule, value: number) {
        if (!value && value !== 0) return new Error("模型价格不能为空");
        if (!/^[0-9]+$/.test(String(value)))
          return new Error("格式有误：请输入正整数");
        return true;
      },
    },
    relatedUrl: { required: false },
  },
};

function openCreateDrawer() {
  isCreate.value = true;
  formValue.value.data = {
    id: 0,
    name: "",
    model: "",
    cost: 1,
    relatedUrl: "",
    imgUrl: "",
    apiKey: "",
    baseUrl: "https://api.deepseek.com",
  };
  active.value = true;
}

function setDrawerDefaultData(row: Api.Core.Chat.Language.Model) {
  isCreate.value = false;
  formValue.value.data = {
    id: row.id,
    name: row.name,
    model: row.model,
    cost: row.cost,
    relatedUrl: row.relatedUrl,
    imgUrl: row.imgUrl || "",
    apiKey: row.apiKey || "",
    baseUrl: row.baseUrl || "https://api.deepseek.com",
  };
}

async function testConnection() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!formValue.value.data.apiKey || !formValue.value.data.baseUrl) {
    message.error("请填写 API Key 和 API 端点");
    return;
  }

  testingConnection.value = true;

  try {
    const result = await fetchTestModelConnection({
      model: formValue.value.data.model,
      apiKey: formValue.value.data.apiKey,
      baseUrl: formValue.value.data.baseUrl,
    });

    if (result.error) {
      message.error(result.error.message || "连接失败");
      return;
    }

    if (result.data.connected) {
      message.success(
        `连接成功，耗时 ${(result.data.durationMs / 1000).toFixed(2)} 秒`,
      );
    } else {
      message.error(result.data.message || "连接失败");
    }
  } catch {
    message.error("连接失败");
  } finally {
    testingConnection.value = false;
  }
}

async function drawerValidate() {
  try {
    await formRef.value?.validate();
    if (isCreate.value) {
      const p: CreateModelParams = {
        name: formValue.value.data.name,
        model: formValue.value.data.model,
        cost: formValue.value.data.cost,
        relatedUrl: formValue.value.data.relatedUrl || "",
        imgUrl: formValue.value.data.imgUrl || "",
        apiKey: formValue.value.data.apiKey || "",
        baseUrl: formValue.value.data.baseUrl || "",
      };
      const result = await fetchCreateModel(p);
      if (!result.error) {
        data.value.push(result.data);
        message.success("新增成功");
      } else message.error("新增失败");
    } else {
      const { id, ...modelData } = formValue.value.data;
      const p: PostModelParams = {
        id,
        ...modelData,
      };
      const index = data.value.findIndex((item) => item.id === p.id);
      if (index !== -1) {
        data.value[index] = {
          ...data.value[index],
          ...p,
          updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };
      }
      await fetchPostModel(p);
      message.success("修改成功");
    }
    active.value = false;
  } catch {
    message.error("处理失败");
  }
}

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetAllModel();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="大语言模型" />
    <NCard size="small" :bordered="true">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-15px font-600">模型列表</span>
          <NButton size="small" type="primary" @click="openCreateDrawer"
            >新增模型</NButton
          >
        </div>
      </template>
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :loading="loading"
        :bordered="false"
        :scroll-x="1100"
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

    <NDrawer v-model:show="active" :width="500" placement="right">
      <NDrawerContent :title="isCreate ? '新增模型' : '编辑模型'" closable>
        <template #footer
          ><NButton type="primary" @click="drawerValidate"
            >确认</NButton
          ></template
        >
        <NForm
          ref="formRef"
          :label-width="90"
          :model="formValue"
          :rules="rules"
          size="medium"
        >
          <NFormItem label="模型名称" path="data.name">
            <NInput
              v-model:value="formValue.data.name"
              placeholder="如：DeepSeek Flash"
            />
          </NFormItem>
          <NFormItem label="模型型号" path="data.model">
            <NInput
              v-model:value="formValue.data.model"
              :disabled="!isCreate"
              placeholder="如：deepseek-v4-flash"
            />
          </NFormItem>
          <NFormItem label="花费" path="data.cost">
            <NInputNumber
              v-model:value="formValue.data.cost"
              :min="0"
              clearable
            />
          </NFormItem>
          <NFormItem label="相关链接" path="data.relatedUrl">
            <NInput
              v-model:value="formValue.data.relatedUrl"
              placeholder="输入当前模型的相关链接"
            />
          </NFormItem>
          <NFormItem label="模型图片" path="data.imgUrl">
            <NInput
              v-model:value="formValue.data.imgUrl"
              placeholder="https://cdn.simpleicons.org/deepseek/1A1A1A"
            />
          </NFormItem>
          <NFormItem label="API Key" path="data.apiKey">
            <NInput
              v-model:value="formValue.data.apiKey"
              type="password"
              show-password-on="click"
              placeholder="请输入 API Key，留空将关闭该模型"
            />
          </NFormItem>
          <NFormItem label="API 端点" path="data.baseUrl">
            <NInput
              v-model:value="formValue.data.baseUrl"
              placeholder="https://api.deepseek.com"
            />
          </NFormItem>
          <NFormItem label="连通性测试">
            <NButton :loading="testingConnection" @click="testConnection"
              >测试连通性</NButton
            >
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
