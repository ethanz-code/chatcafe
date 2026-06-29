# ChatCafe

AIGC 智能对话应用，支持多模型聊天。

## 项目背景

这个项目是起源于 24 年 AIGC 生成式人工智能爆火阶段 24 年 7 月份开发的 **聊天** + **生图** 应用了，当时做这个主要是因为接了个单子，认识了济南的军哥，签合同自己在家搞了两个月，虽然最后不了了之了，但我也真的认真在做，也算不愧对军哥，不愧对自己。

现在 26 年 6 月份回头来看这个项目，当时逼自己**几乎每天**呆在家从早工作到晚，然后每周汇报工作进度，实际也是锻炼了**编码能力**的，这也算是我自己做的真正完全的一个项目，最神的是没有用 AI 辅助工具，用了两个月时间。

现在看来我能给的评价：**编码工整、代码清晰、简单易懂**，

我做项目以来最大的缺点是没法真正得到应用，很遗憾，也就是宣发，我自己并不是全能的，但我努力做到更好。

现在我决定重新操办起来，把他换一换上游对接（我不清楚之前对接的上游还活不活着），现在考虑对接 Deepseek Flash 那个模型了，让这个项目发挥余热用于过各种资质验证了，比如说支付进件的申请。

---

## 技术栈

- **后端**：Node.js + Elysia + Prisma
- **管理后台**：Vue3 + NaiveUI + Vite
- **移动端**：Vue3 + Vant + Vite
- **数据库**：PostgreSQL 16
- **AI SDK**：Vercel AI SDK + OpenAI 兼容接口
- **部署**：Docker Compose + Nginx

## 本地开发

### 环境要求

- Node.js >= 18
- pnpm
- Node.js >= 18 + tsx（运行 API）
- PostgreSQL 16

### 启动步骤

```bash
# 1. 安装依赖
pnpm install
cd api && pnpm install && cd ..
cd admin && pnpm install && cd ..
cd client && pnpm install && cd ..

# 2. 启动数据库
docker compose up -d postgres

# 3. 修改数据库连接
# 编辑 api/.env.development，改 DATABASE_URL

# 4. 初始化数据库
cd api
pnpm exec prisma generate
pnpm exec dotenvx run -f .env .env.development -- pnpm exec prisma migrate deploy
pnpm seed

# 5. 启动项目（根目录）
pnpm dev
```

启动后访问：

| 服务     | 地址                  |
| -------- | --------------------- |
| 移动端   | http://localhost:5173 |
| 管理后台 | http://localhost:8000 |
| API 后端 | http://localhost:9091 |

### 配置 AI

种子数据中的 API Key 是占位符，需要：

1. 在 `.env` 中配置 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL`（默认 DeepSeek）
2. 或在 ChatCafe 后台面板更新 `openai-api-key` 和 `openai-base-url`

## Docker 部署

所有服务通过 Nginx 统一入口，域名 `cafe.htlabs.com.cn`：

| 路径      | 服务     |
| --------- | -------- |
| `/`       | 移动端   |
| `/admin/` | 管理后台 |
| `/api/*`  | API 后端 |
| `/media/*`| 媒体文件 |

### 部署命令

```bash
# 修改 .env（数据库密码、CORS 等）
docker compose build
docker compose up -d postgres && sleep 5
docker compose run --rm chatcafe-api pnpm exec prisma migrate deploy
docker compose run --rm chatcafe-api pnpm exec tsx prisma/seed.ts
docker compose up -d
```

## 项目结构

```
chatcafe/
├── api/              # 后端 API
├── admin/            # 管理后台
├── client/           # 移动端
├── nginx.conf        # 反向代理
├── docker-compose.yml
├── package.json      # 根目录 pnpm dev 一键启动
└── .env              # Docker 部署配置（不进 git）
```

## 常用命令

```bash
pnpm dev                              # 一键启动所有服务
pnpm encrypt / pnpm decrypt           # 加密/解密 .env
pnpm encrypt:dev / pnpm decrypt:dev   # 加密/解密 .env.development
docker compose up -d                  # 启动所有容器
docker compose logs -f chatcafe-api   # 查看 API 日志
```
