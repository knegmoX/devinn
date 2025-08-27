import { z } from 'zod'

// 基础验证规则
export const createNoteSchema = z.object({
  // 基本信息
  title: z
    .string()
    .min(1, '请输入计划标题')
    .max(100, '标题不能超过100个字符'),
  
  destination: z
    .string()
    .min(1, '请输入目的地')
    .max(50, '目的地不能超过50个字符'),
  
  coverImage: z
    .string()
    .url('请输入有效的图片链接')
    .optional()
    .or(z.literal('')),
  
  description: z
    .string()
    .max(500, '描述不能超过500个字符')
    .optional(),
  
  // 内容链接
  contentLinks: z
    .array(z.string().url('请输入有效的链接'))
    .min(1, '请至少添加一个内容链接')
    .max(10, '最多只能添加10个链接'),
  
  // 旅行需求
  requirements: z.object({
    duration: z
      .number()
      .min(1, '旅行天数至少为1天')
      .max(30, '旅行天数不能超过30天'),
    
    travelers: z
      .number()
      .min(1, '旅行人数至少为1人')
      .max(20, '旅行人数不能超过20人'),
    
    budget: z
      .number()
      .min(0, '预算不能为负数')
      .max(1000000, '预算不能超过100万')
      .optional(),
    
    startDate: z
      .string()
      .min(1, '请选择出发日期')
      .refine((date) => {
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      }, '出发日期不能早于今天'),
    
    travelStyle: z
      .array(z.string())
      .min(1, '请至少选择一种旅行风格')
      .max(5, '最多只能选择5种旅行风格'),
    
    interests: z
      .array(z.string())
      .max(10, '最多只能选择10个兴趣标签'),
    
    dietaryRestrictions: z
      .array(z.string())
      .max(5, '最多只能选择5个饮食限制'),
    
    accessibility: z
      .array(z.string())
      .max(5, '最多只能选择5个无障碍需求'),
    
    freeText: z
      .string()
      .max(1000, '其他需求不能超过1000个字符')
      .optional()
  })
})

// 链接验证
export const linkSchema = z.object({
  url: z
    .string()
    .min(1, '请输入链接')
    .url('请输入有效的链接')
    .refine((url) => {
      // 验证支持的平台
      const supportedPlatforms = [
        'xiaohongshu.com',
        'bilibili.com',
        'douyin.com',
        'mafengwo.cn'
      ]
      return supportedPlatforms.some(platform => url.includes(platform))
    }, '暂不支持该平台，请输入小红书、B站、抖音或马蜂窝的链接')
})

// 分步表单验证
export const basicInfoSchema = createNoteSchema.pick({
  title: true,
  destination: true,
  coverImage: true,
  description: true
})

export const contentLinksSchema = createNoteSchema.pick({
  contentLinks: true
})

export const requirementsSchema = createNoteSchema.pick({
  requirements: true
})

// 类型导出
export type CreateNoteFormData = z.infer<typeof createNoteSchema>
export type BasicInfoData = z.infer<typeof basicInfoSchema>
export type ContentLinksData = z.infer<typeof contentLinksSchema>
export type RequirementsData = z.infer<typeof requirementsSchema>
export type LinkData = z.infer<typeof linkSchema>

// 旅行风格选项
export const travelStyleOptions = [
  { value: 'cultural', label: '文化探索', icon: '🏛️' },
  { value: 'foodie', label: '美食体验', icon: '🍜' },
  { value: 'relaxation', label: '休闲放松', icon: '🏖️' },
  { value: 'shopping', label: '购物血拼', icon: '🛍️' },
  { value: 'nature', label: '自然风光', icon: '🌲' },
  { value: 'urban', label: '城市探索', icon: '🏙️' },
  { value: 'adventure', label: '冒险刺激', icon: '🎢' },
  { value: 'photography', label: '摄影打卡', icon: '📸' }
] as const

// 兴趣标签选项
export const interestOptions = [
  { value: 'history', label: '历史文化', category: 'culture' },
  { value: 'art', label: '艺术展览', category: 'culture' },
  { value: 'music', label: '音乐演出', category: 'entertainment' },
  { value: 'nightlife', label: '夜生活', category: 'entertainment' },
  { value: 'local-food', label: '当地美食', category: 'food' },
  { value: 'street-food', label: '街头小吃', category: 'food' },
  { value: 'fine-dining', label: '高档餐厅', category: 'food' },
  { value: 'hiking', label: '徒步登山', category: 'outdoor' },
  { value: 'beach', label: '海滩度假', category: 'outdoor' },
  { value: 'parks', label: '公园游览', category: 'outdoor' },
  { value: 'shopping-malls', label: '购物中心', category: 'shopping' },
  { value: 'local-markets', label: '当地市场', category: 'shopping' },
  { value: 'luxury-brands', label: '奢侈品牌', category: 'shopping' }
] as const

// 饮食限制选项
export const dietaryOptions = [
  { value: 'vegetarian', label: '素食主义', icon: '🥬' },
  { value: 'vegan', label: '纯素食', icon: '🌱' },
  { value: 'halal', label: '清真食品', icon: '☪️' },
  { value: 'kosher', label: '犹太洁食', icon: '✡️' },
  { value: 'gluten-free', label: '无麸质', icon: '🌾' },
  { value: 'dairy-free', label: '无乳制品', icon: '🥛' },
  { value: 'nut-allergy', label: '坚果过敏', icon: '🥜' },
  { value: 'seafood-allergy', label: '海鲜过敏', icon: '🦐' }
] as const

// 无障碍需求选项
export const accessibilityOptions = [
  { value: 'wheelchair', label: '轮椅通道', icon: '♿' },
  { value: 'visual-impairment', label: '视觉辅助', icon: '👁️' },
  { value: 'hearing-impairment', label: '听觉辅助', icon: '👂' },
  { value: 'mobility-assistance', label: '行动辅助', icon: '🦯' },
  { value: 'elevator-access', label: '电梯通道', icon: '🛗' }
] as const

// 验证工具函数
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function extractPlatformFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    if (hostname.includes('xiaohongshu.com')) return 'XIAOHONGSHU'
    if (hostname.includes('bilibili.com')) return 'BILIBILI'
    if (hostname.includes('douyin.com')) return 'DOUYIN'
    if (hostname.includes('mafengwo.cn')) return 'MAFENGWO'
    
    return null
  } catch {
    return null
  }
}

export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  errors.issues.forEach((issue) => {
    const path = issue.path.join('.')
    formattedErrors[path] = issue.message
  })
  
  return formattedErrors
}

// 表单默认值
export const defaultFormValues: Partial<CreateNoteFormData> = {
  title: '',
  destination: '',
  coverImage: '',
  description: '',
  contentLinks: [],
  requirements: {
    duration: 5,
    travelers: 2,
    budget: undefined,
    startDate: '',
    travelStyle: [],
    interests: [],
    dietaryRestrictions: [],
    accessibility: [],
    freeText: ''
  }
}
