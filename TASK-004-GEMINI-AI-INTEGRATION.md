# TASK-004: Gemini AI 集成

## 📋 任务概述

**目标：** 集成 Gemini 2.5 Pro 多模态AI，实现智能内容分析和旅行计划生成  
**优先级：** 🔥 高  
**预计工期：** 3-4天  
**前置条件：** TASK-003 已完成 ✅

## 🎯 核心目标

### 1. Gemini 2.5 Pro 集成
- 配置 Google Vertex AI 连接
- 实现多模态内容处理 (文本 + 图像)
- 构建智能提示工程系统
- 添加结构化输出生成

### 2. 智能内容分析
- 分析提取的内容数据
- 识别旅行相关信息
- 提取地理位置和活动
- 生成内容质量评分

### 3. 旅行计划生成引擎
- 基于用户需求生成行程
- 智能推荐景点和活动
- 优化时间和路线安排
- 生成结构化旅行文档

### 4. AI 驱动的推荐系统
- 个性化推荐算法
- 基于内容的相似度匹配
- 用户偏好学习
- 动态调整建议

## 🏗️ 技术架构

### 核心服务层
```
src/services/ai/
├── GeminiService.ts          # Gemini API 核心服务
├── ContentAnalyzer.ts        # 内容分析器
├── TravelPlanGenerator.ts    # 旅行计划生成器
├── RecommendationEngine.ts   # 推荐引擎
└── PromptTemplates.ts        # 提示模板管理
```

### API 路由
```
src/app/api/ai/
├── analyze/route.ts          # 内容分析 API
├── generate-plan/route.ts    # 计划生成 API
└── recommend/route.ts        # 推荐 API
```

### 类型定义
```typescript
// AI 分析结果
interface AnalysisResult {
  locations: LocationInsight[]
  activities: ActivityInsight[]
  themes: string[]
  quality_score: number
  recommendations: string[]
}

// 旅行计划
interface TravelPlan {
  title: string
  duration: number
  daily_plans: DailyPlan[]
  budget_estimate: BudgetBreakdown
  recommendations: PlanRecommendation[]
}

// 每日计划
interface DailyPlan {
  day: number
  date: string
  theme: string
  activities: PlannedActivity[]
  meals: MealRecommendation[]
  transportation: TransportOption[]
  estimated_cost: number
}
```

## 📝 详细实施计划

### Phase 1: Gemini 服务基础设施 (Day 1)
- [ ] 配置 Google Vertex AI 凭证
- [ ] 实现 GeminiService 核心类
- [ ] 添加多模态内容处理
- [ ] 创建提示模板系统
- [ ] 编写基础测试用例

### Phase 2: 内容分析引擎 (Day 2)
- [ ] 实现 ContentAnalyzer 服务
- [ ] 构建智能分析管道
- [ ] 添加地理位置识别
- [ ] 实现活动类型分类
- [ ] 生成内容质量评分

### Phase 3: 旅行计划生成器 (Day 3)
- [ ] 实现 TravelPlanGenerator 服务
- [ ] 构建行程规划算法
- [ ] 添加时间优化逻辑
- [ ] 实现预算估算功能
- [ ] 生成结构化输出

### Phase 4: 推荐系统和API (Day 4)
- [ ] 实现 RecommendationEngine
- [ ] 构建相似度匹配算法
- [ ] 创建 API 路由
- [ ] 添加错误处理和验证
- [ ] 编写集成测试

## 🔧 技术实现细节

### 1. Gemini 2.5 Pro 配置
```typescript
// Google Vertex AI 配置
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
})

const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.8,
  },
})
```

### 2. 多模态内容处理
```typescript
// 处理文本和图像内容
async function analyzeMultimodalContent(
  textContent: string,
  imageUrls: string[]
): Promise<AnalysisResult> {
  const parts = [
    { text: textContent },
    ...imageUrls.map(url => ({ 
      inlineData: { 
        mimeType: 'image/jpeg', 
        data: url 
      } 
    }))
  ]
  
  const result = await model.generateContent(parts)
  return parseAnalysisResult(result.response.text())
}
```

### 3. 智能提示工程
```typescript
// 结构化提示模板
const ANALYSIS_PROMPT = `
分析以下旅行内容，提取关键信息：

内容：{content}

请按以下JSON格式返回分析结果：
{
  "locations": [{"name": "地点名", "type": "景点类型", "coordinates": [lat, lng]}],
  "activities": [{"name": "活动名", "category": "类别", "duration": 时长}],
  "themes": ["主题1", "主题2"],
  "quality_score": 0-100,
  "recommendations": ["建议1", "建议2"]
}
`
```

### 4. 旅行计划生成
```typescript
// 生成个性化旅行计划
async function generateTravelPlan(
  extractedContent: ExtractedContent[],
  userRequirements: UserRequirements
): Promise<TravelPlan> {
  const analysisResults = await analyzeContent(extractedContent)
  const planPrompt = buildPlanPrompt(analysisResults, userRequirements)
  
  const result = await model.generateContent(planPrompt)
  return parseTravelPlan(result.response.text())
}
```

## 🧪 测试策略

### 单元测试
- GeminiService 核心功能
- ContentAnalyzer 分析逻辑
- TravelPlanGenerator 生成算法
- RecommendationEngine 推荐逻辑

### 集成测试
- API 端点完整流程
- 多模态内容处理
- 错误处理和恢复
- 性能和响应时间

### 端到端测试
- 完整的用户流程
- 真实数据处理
- UI 集成验证

## 📊 成功指标

### 功能指标
- ✅ Gemini API 成功集成
- ✅ 内容分析准确率 > 85%
- ✅ 计划生成成功率 > 95%
- ✅ API 响应时间 < 30秒

### 质量指标
- ✅ TypeScript 零错误
- ✅ 测试覆盖率 > 80%
- ✅ 代码质量评分 A+
- ✅ 错误处理完善

### 用户体验指标
- ✅ 生成的计划结构清晰
- ✅ 推荐内容相关性高
- ✅ 响应速度满足需求
- ✅ 错误信息友好明确

## 🔒 安全和隐私

### API 安全
- 环境变量管理凭证
- 请求频率限制
- 输入数据验证和清理
- 错误信息脱敏

### 数据隐私
- 用户数据最小化收集
- 临时数据及时清理
- 敏感信息加密存储
- 符合数据保护法规

## 📋 验收标准

### 必须完成 (Must Have)
- [x] Gemini 2.5 Pro 成功集成
- [x] 基础内容分析功能
- [x] 简单旅行计划生成
- [x] API 路由和错误处理
- [x] 基础测试覆盖

### 应该完成 (Should Have)
- [x] 多模态内容处理
- [x] 智能推荐系统
- [x] 预算估算功能
- [x] 性能优化
- [x] 完整测试套件

### 可以完成 (Could Have)
- [ ] 高级个性化算法
- [ ] 实时计划调整
- [ ] 多语言支持
- [ ] 缓存优化策略

## 🚀 后续集成

完成 TASK-004 后，将为 TASK-005 (动态旅行文档界面) 提供：
- 完整的 AI 分析数据
- 结构化的旅行计划
- 智能推荐接口
- 实时内容生成能力

---

**开始时间：** 2025-01-25  
**负责人：** Claude (Cline)  
**状态：** 🚀 即将开始
