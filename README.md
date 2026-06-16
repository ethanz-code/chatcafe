# ChatCafe

AIGC 智能对话应用，支持多模型聊天。

## 项目背景

这个项目是起源于 24 年 AIGC 生成式人工智能爆火阶段 24 年 7 月份开发的 **聊天** + **生图** 应用了，当时做这个主要是因为接了个单子，认识了济南的军哥，签合同自己在家搞了两个月，虽然最后不了了之了，但我也真的认真在做，也算不愧对军哥，不愧对自己。

现在 26 年 6 月份回头来看这个项目，当时逼自己**几乎每天**呆在家从早工作到晚，然后每周汇报工作进度，实际也是锻炼了**编码能力**的，这也算是我自己做的真正完全的一个项目，最神的是没有用 AI 辅助工具，用了两个月时间。

现在看来我能给的评价：**编码工整、代码清晰、简单易懂**，

我做项目以来最大的缺点是没法真正得到应用，很遗憾，也就是宣发，我自己并不是全能的，但我努力做到更好。

现在我决定重新操办起来，把他换一换上游对接（我不清楚之前对接的上游还活不活着），现在考虑对接 Deepseek Flash 那个模型了，让这个项目发挥余热用于过各种资质验证了，比如说支付进件的申请。

---

## 快速启动

### 环境要求

- Node.js >= 18
- pnpm
- bun（用于运行 API）
- PostgreSQL 16

### 1. 安装依赖

```bash
# API 后端
cd api && pnpm install

# 管理后台
cd admin && pnpm install

# 移动端
cd mobile && pnpm install
```

### 2. 启动数据库

使用已有的本地 PostgreSQL 容器，或通过 Docker 启动：

```bash
docker compose up -d postgres
```

### 3. 创建数据库

```bash
# 连接到 PostgreSQL，创建数据库
docker exec local-postgres psql -U yassine -d postgres -c "CREATE DATABASE chatcafe;"
```

### 4. 修改环境变量

编辑 `api/.env.development`，将 `DATABASE_URL` 改为你的数据库连接信息：

```
DATABASE_URL="postgresql://用户名:密码@localhost:5432/chatcafe?schema=public"
```

然后重新加密（可选）：

```bash
cd api && pnpm encrypt-dev
```

### 5. 初始化数据库

```bash
cd api

# 执行迁移（建表）
pnpm exec dotenvx run -f .env .env.development -- pnpm exec prisma migrate deploy

# 导入种子数据
pnpm exec dotenvx run -f .env .env.development -- pnpm exec prisma db seed
```

### 6. 配置 DeepSeek API Key

种子数据中的 API Key 为占位符，需要手动更新为真实的 Key：

```bash
docker exec local-postgres psql -U yassine -d chatcafe -c "UPDATE \"Configuration\" SET value = 'sk-你的真实Key' WHERE name = 'chat-secret-key';"
```

### 7. 启动项目

```bash
# API 后端（端口 9091）
cd api && pnpm dev

# 管理后台（另开终端）
cd admin && pnpm dev

# 移动端（另开终端）
cd mobile && pnpm dev
```

## Docker Compose 部署

所有服务部署在同一域名下，通过 nginx 反向代理统一入口：

| 路径 | 服务 |
|------|------|
| `/` | 移动端 |
| `/admin/` | 管理后台 |
| `/api/*` | API 后端 |
| `/media/*` | 媒体文件 |

### 1. 修改配置

编辑根目录 `.env`，按需修改：

```env
POSTGRES_PASSWORD=chatcafe123
SUPER_USERNAME=admin
SUPER_PASSWORD=admin123
CORS_ORIGIN=.*
```

### 2. 构建并启动

```bash
docker compose build
docker compose up -d postgres

# 等待 PostgreSQL 启动完成（约 5 秒）
sleep 5

# 执行数据库迁移
docker compose run --rm chatcafe-api bun run node_modules/.bin/prisma migrate deploy

# 导入种子数据
docker compose run --rm chatcafe-api bun run node_modules/.bin/prisma db seed

# 启动所有服务
docker compose up -d
```

### 3. 更新 DeepSeek API Key

```bash
docker compose exec postgres psql -U chatcafe -d chatcafe -c "UPDATE \"Configuration\" SET value = 'sk-你的真实Key' WHERE name = 'chat-secret-key';"
```

### 项目结构

```
chatcafe/
├── api/              # 后端 API（Bun + Elysia + Prisma）
├── admin/            # 管理后台（Vue3 + NaiveUI）
├── mobile/           # 移动端（Vue3 + Vant）
├── nginx.conf        # 反向代理配置
├── docker-compose.yml
├── .env              # Docker 部署配置（不进 git）
└── api/.env.keys     # dotenvx 加密密钥（不进 git）
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 本地启动开发服务 |
| `pnpm exec prisma migrate deploy` | 执行数据库迁移 |
| `pnpm exec prisma db seed` | 导入种子数据 |
| `pnpm exec prisma studio` | 打开数据库可视化 |
| `pnpm encrypt-dev` / `pnpm decrypt-dev` | 加密/解密开发环境变量 |
| `docker compose build` | 构建 Docker 镜像 |
| `docker compose up -d` | 启动所有容器 |
| `docker compose logs -f chatcafe-api` | 查看 API 日志 |
