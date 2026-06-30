## chatcafe-api

本项目为"聊咖ChatCafe"开发，主要提供API接口，用于给前端项目使用，技术上采取前后分离。

## 数据库同步

> 注意：`.env` 文件使用 `dotenvx` 加密，执行 prisma 命令时需要配合 `dotenvx run`。

### 开发环境

```bash
# 同步 schema 到数据库（幂等，不会丢数据）
dotenvx run -f .env.development -- npx prisma db push

# 执行种子数据
dotenvx run -f .env.development -- npx tsx prisma/seed.ts
# 强制更新种子数据（覆盖已有记录）
dotenvx run -f .env.development -- npx tsx prisma/seed.ts --force
```

### 生产环境

```bash
dotenvx run -f .env.production -- npx prisma db push
dotenvx run -f .env.production -- npx tsx prisma/seed.ts
```

### 价格单位

- DB 以 **元** 为单位（Float）
- 传给蓝兔支付 LTZF 时直接传元（`String(goods.price)`）
