import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai'
import type { 
  ExtractedContent, 
  UserRequirements, 
  TravelPlan, 
  AICommand,
  ChatMessage 
} from '@/types'
import { retry, getErrorMessage } from '@/lib/utils'

export class GeminiService {
  private vertexAI: VertexAI
  private model: any

  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT || 'cloud-llm-preview3',
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    })
    
    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
    })
  }

  /**
   * Generate travel plan from extracted content and user requirements
   */
  async generateTravelPlan(
    extractedContents: ExtractedContent[],
    requirements: UserRequirements
  ): Promise<TravelPlan> {
    const prompt = this.buildTravelPlanPrompt(extractedContents, requirements)
    
    try {
      const result = await retry(async () => {
        const response = await this.model.generateContent(prompt)
        const text = response.response.text()
        return JSON.parse(text)
      }, 3, 2000)

      return this.validateAndFormatTravelPlan(result, requirements)
    } catch (error) {
      throw new Error(`旅行计划生成失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * Adjust existing travel plan based on user instruction
   */
  async adjustTravelPlan(
    currentPlan: TravelPlan,
    instruction: string
  ): Promise<TravelPlan> {
    const prompt = this.buildAdjustmentPrompt(currentPlan, instruction)
    
    try {
      const result = await retry(async () => {
        const response = await this.model.generateContent(prompt)
        const text = response.response.text()
        return JSON.parse(text)
      }, 3, 2000)

      return this.validateAndFormatTravelPlan(result, {
        duration: currentPlan.totalDays,
        travelers: 2, // Default, should be extracted from current plan
        travelStyle: [],
        interests: [],
        freeText: instruction
      })
    } catch (error) {
      throw new Error(`行程调整失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * Parse user command and generate execution plan
   */
  async parseCommand(
    command: string,
    context: TravelPlan
  ): Promise<AICommand> {
    const prompt = this.buildCommandParsingPrompt(command, context)
    
    try {
      const result = await retry(async () => {
        const response = await this.model.generateContent(prompt)
        const text = response.response.text()
        return JSON.parse(text)
      }, 3, 1000)

      return result
    } catch (error) {
      throw new Error(`指令解析失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * Generate AI chat response
   */
  async generateChatResponse(
    message: string,
    chatHistory: ChatMessage[],
    context?: TravelPlan
  ): Promise<string> {
    const prompt = this.buildChatPrompt(message, chatHistory, context)
    
    try {
      const result = await retry(async () => {
        const response = await this.model.generateContent(prompt)
        return response.response.text()
      }, 3, 1000)

      return result
    } catch (error) {
      throw new Error(`AI回复生成失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * Build travel plan generation prompt
   */
  private buildTravelPlanPrompt(
    extractedContents: ExtractedContent[],
    requirements: UserRequirements
  ): string {
    const contentSummary = extractedContents.map(content => ({
      platform: content.platform,
      title: content.title,
      locations: content.locations,
      activities: content.activities,
      tags: content.tags
    }))

    return `你是一个专业的旅行规划师。请根据以下信息生成一个详细的旅行计划：

用户需求：
- 旅行天数：${requirements.duration}天
- 旅行人数：${requirements.travelers}人
- 预算范围：${requirements.budget ? `${requirements.budget}元` : '不限'}
- 旅行风格：${requirements.travelStyle.join(', ')}
- 兴趣偏好：${requirements.interests.join(', ')}
- 饮食限制：${requirements.dietaryRestrictions?.join(', ') || '无'}
- 无障碍需求：${requirements.accessibility?.join(', ') || '无'}
- 其他要求：${requirements.freeText}

参考内容：
${JSON.stringify(contentSummary, null, 2)}

请生成一个JSON格式的旅行计划，包含以下结构：
{
  "title": "旅行计划标题",
  "destination": "目的地",
  "totalDays": ${requirements.duration},
  "estimatedBudget": {
    "min": 最低预算,
    "max": 最高预算,
    "breakdown": {
      "accommodation": 住宿费用,
      "food": 餐饮费用,
      "activities": 活动费用,
      "transport": 交通费用
    }
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "第一天标题",
      "theme": "主题描述",
      "activities": [
        {
          "order": 1,
          "startTime": "09:00",
          "endTime": "11:00",
          "type": "ATTRACTION|RESTAURANT|HOTEL|TRANSPORT|ACTIVITY",
          "title": "活动标题",
          "description": "详细描述",
          "location": {
            "name": "地点名称",
            "address": "详细地址",
            "coordinates": [纬度, 经度]
          },
          "estimatedCost": 预估费用,
          "tips": ["实用建议1", "实用建议2"]
        }
      ],
      "dailySummary": {
        "totalCost": 当日总费用,
        "walkingDistance": 步行距离(公里),
        "highlights": ["亮点1", "亮点2"]
      }
    }
  ]
}

要求：
1. 确保每天的行程安排合理，考虑交通时间和游览时长
2. 根据用户偏好选择合适的景点和活动
3. 提供实用的旅行建议和注意事项
4. 预算分配要合理，符合当地消费水平
5. 考虑地理位置，优化路线规划
6. 只返回JSON，不要包含其他文字说明`
  }

  /**
   * Build adjustment prompt
   */
  private buildAdjustmentPrompt(
    currentPlan: TravelPlan,
    instruction: string
  ): string {
    return `请根据用户指令调整以下旅行计划：

当前计划：
${JSON.stringify(currentPlan, null, 2)}

用户指令：${instruction}

请返回调整后的完整旅行计划JSON，保持原有结构，只修改需要调整的部分。

要求：
1. 理解用户指令的具体要求
2. 保持计划的整体合理性
3. 重新计算相关的时间、费用和距离
4. 确保调整后的安排符合逻辑
5. 只返回JSON，不要包含其他文字说明`
  }

  /**
   * Build command parsing prompt
   */
  private buildCommandParsingPrompt(
    command: string,
    context: TravelPlan
  ): string {
    return `请解析以下用户指令，并生成执行计划：

用户指令：${command}

当前旅行计划上下文：
${JSON.stringify(context, null, 2)}

请返回以下JSON格式的解析结果：
{
  "userInput": "${command}",
  "parsedIntent": {
    "action": "MOVE|REPLACE|ADD|REMOVE|OPTIMIZE",
    "target": "目标对象描述",
    "parameters": {
      "具体参数": "参数值"
    },
    "scope": "SINGLE|DAY|TRIP"
  },
  "executionPlan": {
    "steps": [
      {
        "description": "步骤描述",
        "type": "MODIFY|QUERY|CALCULATE",
        "estimatedTime": 预估时间(秒)
      }
    ],
    "affectedItems": ["受影响的项目ID"],
    "estimatedImpact": "LOW|MEDIUM|HIGH"
  },
  "confirmation": {
    "required": true/false,
    "message": "确认信息",
    "risks": ["风险提示1", "风险提示2"]
  }
}

只返回JSON，不要包含其他文字说明。`
  }

  /**
   * Build chat prompt
   */
  private buildChatPrompt(
    message: string,
    chatHistory: ChatMessage[],
    context?: TravelPlan
  ): string {
    const historyText = chatHistory
      .slice(-5) // 只保留最近5条消息
      .map(msg => `${msg.type === 'USER' ? '用户' : 'AI'}：${msg.content}`)
      .join('\n')

    const contextText = context 
      ? `\n当前旅行计划：${context.title} - ${context.destination}，${context.totalDays}天`
      : ''

    return `你是AI笔记DevInn的智能旅行助手。请根据对话历史和上下文，为用户提供有帮助的回复。

对话历史：
${historyText}

当前消息：${message}${contextText}

请提供简洁、有用的回复，重点关注旅行规划相关的建议和帮助。如果用户询问具体的行程调整，建议他们使用具体的指令。`
  }

  /**
   * Validate and format travel plan
   */
  private validateAndFormatTravelPlan(
    rawPlan: any,
    requirements: UserRequirements
  ): TravelPlan {
    // Basic validation
    if (!rawPlan.title || !rawPlan.destination || !rawPlan.days) {
      throw new Error('生成的旅行计划格式不正确')
    }

    // Ensure required fields
    const plan: TravelPlan = {
      id: '', // Will be set by the caller
      title: rawPlan.title,
      destination: rawPlan.destination,
      totalDays: requirements.duration,
      estimatedBudget: rawPlan.estimatedBudget || {
        min: 0,
        max: 0,
        breakdown: {
          accommodation: 0,
          food: 0,
          activities: 0,
          transport: 0
        }
      },
      days: rawPlan.days.map((day: any, index: number) => ({
        ...day,
        dayNumber: index + 1,
        activities: day.activities.map((activity: any, actIndex: number) => ({
          ...activity,
          id: '', // Will be set by the caller
          order: actIndex + 1
        }))
      })),
      noteId: '', // Will be set by the caller
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return plan
  }
}

// Singleton instance
export const geminiService = new GeminiService()
