import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const FORCE = process.argv.includes('--force')

// ---- 种子数据 ----

const languageModels = [
  {
    name: 'DeepSeek V4 Flash',
    model: 'deepseek-chat',
    cost: 1,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com',
    imgUrl: 'https://cdn.simpleicons.org/deepseek',
    description: 'DeepSeek V4 Flash，速度快，性价比最高',
    relatedUrl: 'https://platform.deepseek.com',
  },
  {
    name: 'DeepSeek V4 Pro',
    model: 'deepseek-reasoner',
    cost: 4,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com',
    imgUrl: 'https://cdn.simpleicons.org/deepseek',
    description: 'DeepSeek V4 Pro 深度推理，复杂逻辑和数学',
    relatedUrl: 'https://platform.deepseek.com',
  },
]

const categoryNames = ['工作效率', '编程开发', '创意写作', '学习教育', '日常生活']

const assistants = [
  {
    name: '翻译助手',
    imgUrl: '/media/assistant/translator.svg',
    description: '专业的多语言翻译助手',
    content_zh_CN: '你是一个专业的翻译助手，能够准确流畅地翻译多种语言。请将用户输入的内容翻译为目标语言，保持原文的语气和风格。',
    content_en_US: 'You are a professional translation assistant. Translate the user input accurately while maintaining the original tone and style.',
    categoryIndex: 0,
  },
  {
    name: '代码助手',
    imgUrl: '/media/assistant/coder.svg',
    description: '专业的编程开发助手',
    content_zh_CN: '你是一个专业的编程助手，精通多种编程语言和框架。请帮助用户解决编程问题，提供清晰的代码示例和解释。',
    content_en_US: 'You are a professional programming assistant proficient in multiple languages and frameworks. Help users with clear code examples and explanations.',
    categoryIndex: 1,
  },
  {
    name: '文案写手',
    imgUrl: '/media/assistant/writer.svg',
    description: '创意文案和内容创作助手',
    content_zh_CN: '你是一个创意文案写手，擅长撰写各类营销文案、社交媒体内容和品牌故事。请根据用户需求创作有吸引力的内容。',
    content_en_US: 'You are a creative copywriter skilled in marketing copy, social media content, and brand storytelling.',
    categoryIndex: 2,
  },
  {
    name: '数学老师',
    imgUrl: '/media/assistant/math.svg',
    description: '耐心的数学辅导老师',
    content_zh_CN: '你是一个耐心的数学老师，擅长用简单易懂的方式解释数学概念。请逐步引导学生理解问题，而不是直接给出答案。',
    content_en_US: 'You are a patient math teacher who explains concepts in simple terms. Guide students step by step.',
    categoryIndex: 3,
  },
  {
    name: '健身教练',
    imgUrl: '/media/assistant/fitness.svg',
    description: '专业的健身和饮食建议',
    content_zh_CN: '你是一个专业的健身教练，能够根据用户的目标制定训练计划和饮食建议。请给出科学、安全的健身指导。',
    content_en_US: 'You are a professional fitness coach providing scientific training plans and diet advice.',
    categoryIndex: 4,
  },
]

const hotIssues = [
  { description: '帮我写一篇关于人工智能的文章' },
  { description: '用 Python 写一个爬虫程序' },
  { description: '解释一下量子计算的原理' },
  { description: '推荐一些提升效率的工作方法' },
  { description: '帮我翻译这段英文' },
]

const appCenterItems = [
  {
    name: 'AI 对话',
    imgUrl: '/media/app-center/chat.svg',
    description: '与 AI 进行自然语言对话',
    model: 'DeepSeek-V4-Flash',
    cost: 1,
    type: 'chat',
    path: '/',
    queryType: 'chat',
  },
]

const configurationItems = [
  { name: 'site_name', value: 'ChatCafe', description: '网站名称' },
  { name: 'contact_email', value: '', description: '联系邮箱' },
  { name: 'record_number', value: '', description: '备案号' },
  { name: 'maintenance_mode', value: 'false', description: '维护模式' },
]

const goodsItems = [
  { title: '体验套餐', description: '对话 100 次', dialogueCount: 100, paintingCount: 0, imgUrl: '/media/pay/basic.svg', price: 9.9 },
  { title: '标准套餐', description: '对话 500 次', dialogueCount: 500, paintingCount: 0, imgUrl: '/media/pay/standard.svg', price: 29.9 },
  { title: '高级套餐', description: '对话 2000 次', dialogueCount: 2000, paintingCount: 0, imgUrl: '/media/pay/premium.svg', price: 99.9 },
]

const taskRewards = [
  { name: 'first_avatar', description: '首次上传头像，奖励对话余额 50 次', rewardDialogue: 50, rewardPainting: 0, fluentIconName: 'PersonCircle', condition: '0' },
  { name: 'first_chat', description: '首次对话，奖励对话余额 30 次', rewardDialogue: 30, rewardPainting: 0, fluentIconName: 'ChatMultiple', condition: '0' },
  { name: 'invite_register', description: '邀请好友注册，奖励对话余额 100 次', rewardDialogue: 100, rewardPainting: 0, fluentIconName: 'PeopleCommunity', condition: '0' },
]

// ---- 辅助函数 ----

// 有 @unique name 字段的表，直接用 upsert
async function upsertByName(model: any, data: any[]) {
  for (const item of data) {
    const existing = await model.findFirst({ where: { name: item.name } })
    if (!existing) {
      await model.create({ data: item })
    } else if (FORCE) {
      await model.update({ where: { id: existing.id }, data: item })
    }
  }
}

// 没有唯一约束的表，按业务字段匹配
async function upsertByField(model: any, data: any[], matchFn: (item: any) => any) {
  for (const item of data) {
    if (FORCE) {
      const existing = await model.findFirst({ where: matchFn(item) })
      if (existing) {
        await model.update({ where: { id: existing.id }, data: item })
      } else {
        await model.create({ data: item })
      }
    } else {
      const existing = await model.findFirst({ where: matchFn(item) })
      if (!existing) {
        await model.create({ data: item })
      }
    }
  }
}

// 查找或创建分类，返回 id 映射
async function resolveCategories(): Promise<number[]> {
  const ids: number[] = []
  for (const name of categoryNames) {
    const existing = await prisma.assistantCategory.findFirst({ where: { name } })
    if (existing) {
      if (FORCE) {
        // 分类没有需要更新的字段
      }
      ids.push(existing.id)
    } else {
      const created = await prisma.assistantCategory.create({ data: { name } })
      ids.push(created.id)
    }
  }
  return ids
}

// ---- 主流程 ----

async function main() {
  console.log(`Seeding database... (mode: ${FORCE ? 'force update' : 'skip duplicates'})`)

  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "User_id_seq" RESTART WITH 100010`)

  // LanguageModel（name 唯一）
  await upsertByName(prisma.languageModel, languageModels)

  // AssistantCategory + Assistant
  const categoryIds = await resolveCategories()

  const assistantData = assistants.map((a) => ({
    name: a.name,
    imgUrl: a.imgUrl,
    description: a.description,
    content_zh_CN: a.content_zh_CN,
    content_en_US: a.content_en_US,
    categoryId: categoryIds[a.categoryIndex],
  }))
  await upsertByField(prisma.assistant, assistantData, (item) => ({
    name: item.name,
    categoryId: item.categoryId,
  }))

  // LanguageHotIssues（按 description 匹配）
  await upsertByField(prisma.languageHotIssues, hotIssues, (item) => ({
    description: item.description,
  }))

  // ApplicationCenter（按 name 匹配）
  await upsertByField(prisma.applicationCenter, appCenterItems, (item) => ({
    name: item.name,
  }))

  // Configuration（name 唯一）
  await upsertByName(prisma.configuration, configurationItems)

  // Goods（按 title 匹配）
  await upsertByField(prisma.goods, goodsItems, (item) => ({
    title: item.title,
  }))

  // TaskReward（按 name 匹配）
  await upsertByField(prisma.taskReward, taskRewards, (item) => ({
    name: item.name,
  }))

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
