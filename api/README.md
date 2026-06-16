## chatcafe-api

本项目为"聊咖ChatCafe"开发，主要提供API接口，用于给前端项目使用，技术上采取前后分离。

## 注意要点

1. 每次对代码进行一个阶段性完结之后构建镜像要使用`bun run publish-[fix/feat/release]`，之后会先进行版本号迭代，再去构建镜像；
2. 推荐对代码进行一个阶段性完结之后使用`bun run devPublish-[fix/feat/release]`，之后会在本地数据库进行版本迭代；
3. 若要使代码格式化插件生效，需手动执行`bun run prepare-fallback`