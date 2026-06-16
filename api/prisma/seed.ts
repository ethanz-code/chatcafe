import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Configuration - 基础配置
  await prisma.configuration.createMany({
    data: [
      { name: 'jwt-secret', value: 'chatcafe-jwt-secret-change-me' },
      { name: 'chat-proxy-address', value: 'https://api.deepseek.com/', description: '聊天 API 地址（OpenAI 兼容格式）' },
      { name: 'chat-secret-key', value: 'sk-YOUR_DEEPSEEK_API_KEY', description: 'DeepSeek API Key' },
      { name: 'chat-max-tokens', value: '4096', description: '聊天最大 token 数' },
    ],
    skipDuplicates: true,
  })

  // LanguageModel - DeepSeek 最便宜的模型
  await prisma.languageModel.createMany({
    data: [
      {
        name: 'DeepSeek-V4-Flash',
        model: 'deepseek-v4-flash',
        cost: 1,
        description: 'DeepSeek V4 Flash，速度快，性价比最高',
        imgUrl: '/media/llm/deepseek.png',
        relatedUrl: 'https://platform.deepseek.com',
      },
    ],
    skipDuplicates: true,
  })

  // AssistantCategory - 助理分类
  const categories = await Promise.all([
    prisma.assistantCategory.create({ data: { name: '工作效率' } }),
    prisma.assistantCategory.create({ data: { name: '编程开发' } }),
    prisma.assistantCategory.create({ data: { name: '创意写作' } }),
    prisma.assistantCategory.create({ data: { name: '学习教育' } }),
    prisma.assistantCategory.create({ data: { name: '日常生活' } }),
  ])

  // Assistant - 预设助理
  await prisma.assistant.createMany({
    data: [
      {
        name: '翻译助手',
        imgUrl: '/media/assistant/translate.png',
        description: '专业的多语言翻译助手',
        content_zh_CN: '你是一个专业的翻译助手，能够准确流畅地翻译多种语言。请将用户输入的内容翻译为目标语言，保持原文的语气和风格。',
        content_en_US: 'You are a professional translation assistant. Translate the user input accurately while maintaining the original tone and style.',
        categoryId: categories[0].id,
      },
      {
        name: '代码助手',
        imgUrl: '/media/assistant/code.png',
        description: '专业的编程开发助手',
        content_zh_CN: '你是一个专业的编程助手，精通多种编程语言和框架。请帮助用户解决编程问题，提供清晰的代码示例和解释。',
        content_en_US: 'You are a professional programming assistant proficient in multiple languages and frameworks. Help users with clear code examples and explanations.',
        categoryId: categories[1].id,
      },
      {
        name: '文案写手',
        imgUrl: '/media/assistant/writer.png',
        description: '创意文案和内容创作助手',
        content_zh_CN: '你是一个创意文案写手，擅长撰写各类营销文案、社交媒体内容和品牌故事。请根据用户需求创作有吸引力的内容。',
        content_en_US: 'You are a creative copywriter skilled in marketing copy, social media content, and brand storytelling.',
        categoryId: categories[2].id,
      },
      {
        name: '数学老师',
        imgUrl: '/media/assistant/math.png',
        description: '耐心的数学辅导老师',
        content_zh_CN: '你是一个耐心的数学老师，擅长用简单易懂的方式解释数学概念。请逐步引导学生理解问题，而不是直接给出答案。',
        content_en_US: 'You are a patient math teacher who explains concepts in simple terms. Guide students step by step.',
        categoryId: categories[3].id,
      },
      {
        name: '健身教练',
        imgUrl: '/media/assistant/fitness.png',
        description: '专业的健身和饮食建议',
        content_zh_CN: '你是一个专业的健身教练，能够根据用户的目标制定训练计划和饮食建议。请给出科学、安全的健身指导。',
        content_en_US: 'You are a professional fitness coach providing scientific training plans and diet advice.',
        categoryId: categories[4].id,
      },
    ],
    skipDuplicates: true,
  })

  // LanguageHotIssues - 热门问题
  await prisma.languageHotIssues.createMany({
    data: [
      { description: '帮我写一篇关于人工智能的文章' },
      { description: '用 Python 写一个爬虫程序' },
      { description: '解释一下量子计算的原理' },
      { description: '推荐一些提升效率的工作方法' },
      { description: '帮我翻译这段英文' },
    ],
    skipDuplicates: true,
  })

  // ApplicationCenter - 应用中心（仅聊天）
  await prisma.applicationCenter.deleteMany();
  await prisma.applicationCenter.createMany({
    data: [
      {
        name: 'AI 对话',
        imgUrl: '/media/app/chat.png',
        description: '与 AI 进行自然语言对话',
        model: 'DeepSeek-V4-Flash',
        cost: 1,
        type: 'chat',
        path: '/chat',
        queryType: 'chat',
      },
    ],
  })

  // Goods - 商品（充值套餐，仅对话）
  await prisma.goods.createMany({
    data: [
      {
        title: '体验套餐',
        description: '对话 100 次',
        dialogueCount: 100,
        paintingCount: 0,
        imgUrl: '/media/goods/trial.png',
        price: 9.9,
      },
      {
        title: '标准套餐',
        description: '对话 500 次',
        dialogueCount: 500,
        paintingCount: 0,
        imgUrl: '/media/goods/standard.png',
        price: 29.9,
      },
      {
        title: '高级套餐',
        description: '对话 2000 次',
        dialogueCount: 2000,
        paintingCount: 0,
        imgUrl: '/media/goods/premium.png',
        price: 99.9,
      },
    ],
    skipDuplicates: true,
  })

  // TaskReward - 任务奖励
  await prisma.taskReward.createMany({
    data: [
      {
        name: 'first_avatar',
        description: '首次上传头像，奖励对话余额 50 次',
        rewardDialogue: 50,
        rewardPainting: 0,
        fluentIconName: 'PersonCircle',
        condition: '0',
      },
      {
        name: 'first_chat',
        description: '首次对话，奖励对话余额 30 次',
        rewardDialogue: 30,
        rewardPainting: 0,
        fluentIconName: 'ChatMultiple',
        condition: '0',
      },
      {
        name: 'invite_register',
        description: '邀请好友注册，奖励对话余额 100 次',
        rewardDialogue: 100,
        rewardPainting: 0,
        fluentIconName: 'PeopleCommunity',
        condition: '0',
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
