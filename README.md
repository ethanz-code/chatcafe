# ChatCafe

<p align="center">
  <img src="docs/assets/banner.svg" alt="ChatCafe — ask. brew ideas." width="100%"/>
</p>

AIGC 智能对话应用，支持多模型聊天。

## 项目背景

这个项目是起源于 24 年 AIGC 生成式人工智能爆火阶段 24 年 7 月份开发的 **聊天** + **生图** 应用了，当时做这个主要是因为接了个单子，认识了济南的军哥，签合同自己在家搞了两个月，虽然最后不了了之了，但我也真的认真在做，也算不愧对军哥，不愧对自己。

现在 26 年 6 月份回头来看这个项目，当时逼自己**几乎每天**呆在家从早工作到晚，然后每周汇报工作进度，实际也是锻炼了**编码能力**的，这也算是我自己做的真正完全的一个项目，最神的是没有用 AI 辅助工具，用了两个月时间。

现在看来我能给的评价：**编码工整、代码清晰、简单易懂**，

我做项目以来最大的缺点是没法真正得到应用，很遗憾，也就是宣发，我自己并不是全能的，但我努力做到更好。

现在我决定重新操办起来，把他换一换上游对接（我不清楚之前对接的上游还活不活着），现在考虑对接 Deepseek Flash 那个模型了，让这个项目发挥余热用于过各种资质验证了，比如说支付进件的申请。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 后端 | Node.js + Elysia + Prisma |
| 管理后台 | Vue3 + NaiveUI + Vite |
| 移动端 | Vue3 + Vant + Vite |
| 数据库 | PostgreSQL 16 |
| AI SDK | Vercel AI SDK + OpenAI 兼容接口 |
| 部署 | Docker Compose + Nginx |

## 本地开发

### 你需要装好

- Node.js >= 18 + pnpm
- Docker

### 跑起来

```bash
# 1. 启动数据库（自动拉取 postgres:16-alpine）
docker compose up -d postgres

# 2. 安装依赖
pnpm install

# 3. 生成 Prisma Client（编译当前平台的查询引擎）
cd api && pnpm exec prisma generate && cd ..

# 4. 建表 + 种子数据
cd api
pnpm exec dotenvx run -f .env.development -- pnpm exec prisma db push
pnpm exec tsx prisma/seed.ts
cd ..

# 5. 启动所有服务
pnpm dev
```

| 服务 | 地址 |
| --- | --- |
| 移动端 | http://localhost:5173 |
| 管理后台 | http://localhost:8000 |
| API 后端 | http://localhost:9091 |

### 关于 Prisma binaryTargets

不同操作系统需要不同的 Prisma 引擎二进制。`api/prisma/schema.prisma` 中已配置：

```prisma
binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
```

- `native` → 你的本地电脑（macOS / Windows 自动适配）
- `linux-musl-openssl-3.0.x` → Docker 部署（Alpine Linux）

如果部署到其他 Linux（如 Ubuntu），添加 `linux-glibc-openssl-3.0.x`；ARM 架构添加 `linux-arm-*` 系列。

### 配置 AI

种子数据中的 API Key 是占位符，启动后访问管理后台 → 语言模型管理，填入你的 Key：

- `apiKey`：你的 DeepSeek / OpenAI API Key
- `baseUrl`：如 `https://api.deepseek.com`
- `model`：如 `deepseek-v4-flash`

## Docker 部署

### 1. 构建镜像

```bash
# 构建 4 个服务（api 暂缺 Dockerfile 需自行补上）
docker build -t your-registry/chatcafe/api:latest api/
docker build -t your-registry/chatcafe/admin:latest admin/
docker build -t your-registry/chatcafe/client:latest client/
docker build -t your-registry/chatcafe/gateway:latest gateway/

# 推送到仓库
docker push your-registry/chatcafe/api:latest
docker push your-registry/chatcafe/admin:latest
docker push your-registry/chatcafe/client:latest
docker push your-registry/chatcafe/gateway:latest
```

### 2. 部署到服务器

把 `docker-compose.yml` 和 `.env` 放到服务器上（或 1Panel Compose 管理），然后：

```bash
# 拉镜像 + 启动
docker compose pull
docker compose up -d

# 建表 + 种子数据（首次部署）
docker compose run --rm chatcafe-api pnpm exec prisma db push
docker compose run --rm chatcafe-api pnpm exec tsx prisma/seed.ts
```

| 路径 | 服务 |
| --- | --- |
| `/` | 移动端 |
| `/admin/` | 管理后台 |
| `/api/*` | API 后端 |
| `/media/*` | 媒体文件 |

### 从本地推送数据库结构到生产库

本地能连到生产库的话，也可以直接推：

```bash
cd api
pnpm exec dotenvx run -f .env.production -- pnpm exec prisma db push
pnpm exec tsx prisma/seed.ts
```

## 项目结构

```
chatcafe/
├── api/                # 后端 API（Elysia + Prisma）
├── admin/              # 管理后台（Vue3 + NaiveUI）
├── client/             # 移动端（Vue3 + Vant）
├── gateway/            # Nginx 反向代理
├── docker-compose.yml  # 部署编排
├── .env                # Docker 部署配置
└── package.json        # 根目录 pnpm dev 一键启动
```

## 常用命令

```bash
pnpm dev                              # 一键启动所有开发服务
docker compose up -d postgres         # 启动本地数据库
docker compose up -d                  # 启动所有 Docker 容器
docker compose logs -f chatcafe-api   # 查看 API 日志
```
