import type { ExtractedContent, UserRequirements, TravelPlan } from '@/types'

/**
 * AI 提示模板管理系统
 * 统一管理所有 Gemini AI 的提示模板
 */
export class PromptTemplates {
  /**
   * 旅行计划生成提示模板
   */
  static buildTravelPlanPrompt(
    extractedContents: ExtractedContent[],
    requirements: UserRequirements
  ): string {
    const contentSummary = extractedContents.map(content => ({
      platform: content.platform,
      title: content.title,
      description: content.description,
      locations: content.locations.map(l => ({
        name: l.name,
        type: l.type,
        coordinates: l.coordinates
      })),
      activities: content.activities.map(a => ({
        name: a.name,
        category: a.category,
        cost: a.estimatedCost,
        duration: a.duration,
        tips: a.tips
      })),
      tags: content.tags,
      stats: content.stats
    }))

    return `你是一个专业的AI旅行规划师，具有丰富的全球旅行经验和深度的文化理解。请根据以下信息生成一个详细、实用、个性化的旅行计划。

## 用户需求分析
- **旅行天数**: ${requirements.duration}天
- **旅行人数**: ${requirements.travelers}人
- **预算范围**: ${requirements.budget ? `${requirements.budget}元` : '预算灵活'}
- **旅行风格**: ${requirements.travelStyle.join(', ') || '未指定'}
- **兴趣偏好**: ${requirements.interests.join(', ') || '未指定'}
- **饮食限制**: ${requirements.dietaryRestrictions?.join(', ') || '无特殊要求'}
- **无障碍需求**: ${requirements.accessibility?.join(', ') || '无特殊需求'}
- **其他要求**: ${requirements.freeText || '无'}

## 参考内容数据
${JSON.stringify(contentSummary, null, 2)}

## 输出要求
请生成一个JSON格式的旅行计划，严格按照以下结构：

\`\`\`json
{
  "title": "吸引人的旅行计划标题",
  "destination": "主要目的地",
  "totalDays": ${requirements.duration},
  "estimatedBudget": {
    "min": 最低预算估算,
    "max": 最高预算估算,
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
      "title": "第一天主题",
      "theme": "当日主题描述",
      "weather": {
        "temperature": { "min": 最低温度, "max": 最高温度 },
        "condition": "天气状况",
        "humidity": 湿度百分比,
        "precipitation": 降水概率,
        "windSpeed": 风速
      },
      "activities": [
        {
          "order": 1,
          "startTime": "09:00",
          "endTime": "11:00",
          "type": "ATTRACTION|RESTAURANT|HOTEL|TRANSPORT|ACTIVITY",
          "title": "活动标题",
          "description": "详细描述，包含亮点和注意事项",
          "location": {
            "name": "地点名称",
            "address": "详细地址",
            "coordinates": [纬度, 经度],
            "district": "所在区域",
            "nearbyLandmarks": [
              {
                "name": "附近地标",
                "distance": 距离(米),
                "walkingTime": 步行时间(分钟)
              }
            ]
          },
          "estimatedCost": 预估费用,
          "tips": ["实用建议1", "实用建议2"],
          "bookingInfo": {
            "url": "预订链接(如适用)",
            "provider": "预订平台",
            "price": 价格,
            "availability": "可用性说明"
          }
        }
      ],
      "dailySummary": {
        "totalCost": 当日总费用,
        "walkingDistance": 步行距离(公里),
        "highlights": ["当日亮点1", "当日亮点2"]
      }
    }
  ],
  "flights": [
    {
      "type": "OUTBOUND|RETURN",
      "airline": {
        "code": "航空公司代码",
        "name": "航空公司名称",
        "logo": "Logo URL"
      },
      "flightNumber": "航班号",
      "aircraft": "机型",
      "departure": {
        "airport": { "code": "机场代码", "name": "机场名称", "terminal": "航站楼" },
        "time": "起飞时间",
        "date": "起飞日期"
      },
      "arrival": {
        "airport": { "code": "机场代码", "name": "机场名称", "terminal": "航站楼" },
        "time": "到达时间",
        "date": "到达日期"
      },
      "duration": { "total": 总时长(分钟), "formatted": "格式化时长" },
      "stops": [],
      "price": {
        "amount": 单价,
        "currency": "CNY",
        "pricePerPerson": 每人价格,
        "totalPrice": 总价,
        "taxes": 税费
      },
      "cabin": {
        "class": "ECONOMY|BUSINESS|FIRST",
        "name": "舱位名称",
        "baggage": { "checkedBags": "托运行李", "carryOn": "手提行李" }
      },
      "booking": {
        "url": "预订链接",
        "provider": "预订平台",
        "availability": 可用座位数,
        "refundable": 是否可退款,
        "changeable": 是否可改签
      },
      "rating": {
        "score": 综合评分,
        "punctuality": 准点率,
        "comfort": 舒适度,
        "service": 服务质量
      }
    }
  ],
  "hotels": [
    {
      "name": "酒店名称",
      "brand": "酒店品牌",
      "category": "酒店类别",
      "starRating": 星级评分,
      "location": {
        "address": "详细地址",
        "district": "所在区域",
        "coordinates": [纬度, 经度],
        "nearbyLandmarks": [
          { "name": "地标名称", "distance": 距离, "walkingTime": 步行时间 }
        ],
        "transportation": [
          { "type": "SUBWAY|BUS|TRAIN", "station": "站点名称", "distance": 距离, "lines": ["线路"] }
        ]
      },
      "rooms": [
        {
          "type": "房型",
          "size": 房间面积,
          "bedType": "床型",
          "maxOccupancy": 最大入住人数,
          "amenities": ["设施列表"],
          "pricing": {
            "basePrice": 基础价格,
            "totalPrice": 总价,
            "currency": "CNY",
            "taxes": 税费,
            "fees": 其他费用
          }
        }
      ],
      "amenities": {
        "general": ["通用设施"],
        "dining": ["餐饮设施"],
        "recreation": ["娱乐设施"],
        "business": ["商务设施"]
      },
      "reviews": {
        "overall": 总体评分,
        "breakdown": {
          "cleanliness": 清洁度,
          "comfort": 舒适度,
          "location": 位置,
          "service": 服务,
          "value": 性价比
        },
        "totalReviews": 评论总数
      },
      "policies": {
        "checkIn": "入住时间",
        "checkOut": "退房时间",
        "cancellation": {
          "type": "FREE|PARTIAL|NON_REFUNDABLE",
          "deadline": "取消截止时间",
          "fee": 取消费用
        },
        "children": "儿童政策",
        "pets": 是否允许宠物
      },
      "booking": {
        "url": "预订链接",
        "provider": "预订平台",
        "availability": "AVAILABLE|LIMITED|UNAVAILABLE"
      }
    }
  ]
}
\`\`\`

## 规划原则
1. **时间合理性**: 确保每天的行程安排合理，考虑交通时间、游览时长和休息时间
2. **地理优化**: 根据地理位置优化路线，减少不必要的往返
3. **个性化匹配**: 根据用户偏好和兴趣选择合适的景点和活动
4. **预算控制**: 提供符合预算范围的建议，包含性价比分析
5. **实用性**: 提供具体的实用建议、注意事项和预订信息
6. **文化敏感**: 考虑当地文化特色和最佳游览时间
7. **灵活性**: 为可能的变化预留调整空间

## 特别注意
- 所有时间使用24小时制
- 坐标使用WGS84格式 [纬度, 经度]
- 价格以人民币为单位
- 确保JSON格式完全正确，可以被解析
- 只返回JSON内容，不要包含任何其他文字说明`
  }

  /**
   * 旅行计划调整提示模板
   */
  static buildAdjustmentPrompt(
    currentPlan: TravelPlan,
    instruction: string
  ): string {
    return `你是一个专业的AI旅行规划师。用户希望调整现有的旅行计划，请根据用户指令进行智能调整。

## 当前旅行计划
${JSON.stringify(currentPlan, null, 2)}

## 用户调整指令
"${instruction}"

## 调整要求
请理解用户的具体需求，对旅行计划进行相应调整：

1. **保持整体合理性**: 确保调整后的计划在时间、地理位置、预算等方面仍然合理
2. **最小化影响**: 尽量减少对其他未涉及部分的影响
3. **重新计算**: 调整相关的时间、费用、距离等数据
4. **优化建议**: 如果调整可能导致问题，提供优化建议
5. **保持结构**: 维持原有的JSON结构格式

## 输出格式
请返回调整后的完整旅行计划JSON，保持与原计划相同的数据结构。

**重要**: 只返回JSON格式的调整后计划，不要包含任何解释文字。`
  }

  /**
   * 用户指令解析提示模板
   */
  static buildCommandParsingPrompt(
    command: string,
    context: TravelPlan
  ): string {
    return `你是一个智能的旅行计划助手。请解析用户的自然语言指令，并生成详细的执行计划。

## 用户指令
"${command}"

## 当前旅行计划上下文
目的地: ${context.destination}
总天数: ${context.totalDays}天
当前活动总数: ${context.days.reduce((sum, day) => sum + day.activities.length, 0)}个

## 解析要求
请分析用户指令的意图，并返回以下JSON格式的解析结果：

\`\`\`json
{
  "userInput": "${command}",
  "parsedIntent": {
    "action": "MOVE|REPLACE|ADD|REMOVE|OPTIMIZE|QUERY",
    "target": "目标对象的详细描述",
    "parameters": {
      "sourceDay": 源天数(如适用),
      "targetDay": 目标天数(如适用),
      "activityId": 活动ID(如适用),
      "newActivity": 新活动信息(如适用),
      "timeSlot": 时间段(如适用),
      "preferences": 用户偏好(如适用)
    },
    "scope": "SINGLE|DAY|TRIP"
  },
  "executionPlan": {
    "steps": [
      {
        "description": "执行步骤的详细描述",
        "type": "MODIFY|QUERY|CALCULATE|VALIDATE",
        "estimatedTime": 预估执行时间(秒),
        "dependencies": ["依赖的前置步骤"]
      }
    ],
    "affectedItems": ["受影响的项目标识符"],
    "estimatedImpact": "LOW|MEDIUM|HIGH",
    "riskAssessment": {
      "level": "LOW|MEDIUM|HIGH",
      "factors": ["风险因素1", "风险因素2"]
    }
  },
  "confirmation": {
    "required": true/false,
    "message": "需要用户确认的具体信息",
    "alternatives": ["替代方案1", "替代方案2"],
    "risks": ["潜在风险提示1", "潜在风险提示2"]
  },
  "expectedOutcome": {
    "description": "预期结果描述",
    "changesPreview": "变更预览",
    "benefitsAndTradeoffs": {
      "benefits": ["优势1", "优势2"],
      "tradeoffs": ["权衡1", "权衡2"]
    }
  }
}
\`\`\`

## 解析指南
1. **动作识别**: 准确识别用户想要执行的操作类型
2. **目标定位**: 明确指令针对的具体对象或范围
3. **参数提取**: 提取指令中的关键参数和约束条件
4. **影响评估**: 评估操作对整个计划的影响程度
5. **风险识别**: 识别可能的风险和需要注意的问题

**重要**: 只返回JSON格式的解析结果，不要包含其他文字说明。`
  }

  /**
   * AI聊天回复提示模板
   */
  static buildChatPrompt(
    message: string,
    chatHistory: Array<{ type: 'USER' | 'ASSISTANT'; content: string }>,
    context?: TravelPlan
  ): string {
    const historyText = chatHistory
      .slice(-5) // 保留最近5条消息
      .map(msg => `${msg.type === 'USER' ? '用户' : 'AI助手'}：${msg.content}`)
      .join('\n')

    const contextText = context 
      ? `\n\n## 当前旅行计划上下文\n- 计划标题：${context.title}\n- 目的地：${context.destination}\n- 总天数：${context.totalDays}天\n- 预算范围：${context.estimatedBudget.min}-${context.estimatedBudget.max}元`
      : ''

    return `你是AI笔记DevInn的智能旅行助手，具有专业的旅行规划知识和友好的服务态度。

## 对话历史
${historyText}

## 当前用户消息
"${message}"${contextText}

## 回复指南
请根据对话历史和上下文，为用户提供有帮助的回复：

1. **专业性**: 提供准确、实用的旅行建议和信息
2. **个性化**: 根据用户的具体情况和偏好定制回复
3. **友好性**: 保持友好、耐心的服务态度
4. **简洁性**: 回复简洁明了，重点突出
5. **可操作性**: 提供具体的建议和下一步行动指导

## 特殊情况处理
- 如果用户询问具体的行程调整，建议使用具体的调整指令
- 如果用户需要详细信息，提供相关的查询建议
- 如果用户表达不满，积极寻找解决方案
- 如果超出旅行规划范围，礼貌地引导回到主题

请直接提供回复内容，不要包含格式标记或前缀。`
  }

  /**
   * 内容分析提示模板
   */
  static buildContentAnalysisPrompt(contents: ExtractedContent[]): string {
    const contentSummary = contents.map(content => ({
      platform: content.platform,
      title: content.title,
      description: content.description,
      locations: content.locations.map(l => l.name),
      activities: content.activities.map(a => a.name),
      tags: content.tags,
      stats: content.stats,
      mediaCount: content.media.length
    }))

    return `你是一个专业的旅行内容分析师。请对以下旅行内容进行深度分析，提供全面的洞察和建议。

## 待分析内容
${JSON.stringify(contentSummary, null, 2)}

## 分析要求
请按照以下JSON格式返回详细的分析结果：

\`\`\`json
{
  "locations": [
    {
      "name": "地点名称",
      "type": "CITY|ATTRACTION|DISTRICT|LANDMARK",
      "coordinates": [纬度, 经度],
      "popularity_score": 0-100,
      "mentioned_count": 在内容中的提及次数,
      "related_activities": ["相关活动1", "相关活动2"],
      "best_time_to_visit": "最佳游览时间建议",
      "estimated_duration": 建议游览时长(分钟),
      "accessibility": "无障碍信息",
      "cost_level": "BUDGET|MID_RANGE|EXPENSIVE"
    }
  ],
  "activities": [
    {
      "name": "活动名称",
      "category": "SIGHTSEEING|DINING|SHOPPING|ENTERTAINMENT|CULTURE|NATURE|ADVENTURE",
      "popularity_score": 0-100,
      "mentioned_count": 提及次数,
      "estimated_cost": 预估费用,
      "duration": 持续时间(分钟),
      "difficulty_level": "EASY|MODERATE|HARD",
      "best_season": ["春", "夏", "秋", "冬"],
      "tips": ["实用建议1", "实用建议2"],
      "target_audience": ["家庭", "情侣", "独行", "朋友"],
      "booking_required": 是否需要预订
    }
  ],
  "themes": ["主要主题1", "主要主题2", "主要主题3"],
  "quality_score": 0-100,
  "recommendations": [
    {
      "type": "MUST_VISIT|RECOMMENDED|OPTIONAL",
      "title": "推荐标题",
      "description": "推荐描述",
      "reason": "推荐理由"
    }
  ],
  "sentiment": {
    "overall_sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
    "enthusiasm_level": 0-100,
    "recommendation_strength": 0-100,
    "concerns": ["关注点1", "关注点2"],
    "highlights": ["亮点1", "亮点2"]
  },
  "travel_insights": {
    "destination_type": "URBAN|NATURE|CULTURAL|BEACH|ADVENTURE|MIXED",
    "travel_style": ["休闲", "深度", "打卡", "体验"],
    "budget_level": "BUDGET|MID_RANGE|LUXURY|MIXED",
    "target_audience": ["年轻人", "家庭", "情侣", "中老年"],
    "seasonal_preferences": ["春季", "夏季", "秋季", "冬季"],
    "duration_recommendation": {
      "min_days": 最少建议天数,
      "max_days": 最多建议天数,
      "optimal_days": 最佳天数
    },
    "transportation_needs": ["飞机", "高铁", "自驾", "公共交通"],
    "accommodation_style": ["酒店", "民宿", "青旅", "度假村"]
  },
  "content_quality": {
    "information_completeness": 0-100,
    "visual_appeal": 0-100,
    "practical_value": 0-100,
    "authenticity": 0-100,
    "engagement_level": 0-100
  },
  "optimization_suggestions": [
    {
      "area": "改进领域",
      "suggestion": "具体建议",
      "priority": "HIGH|MEDIUM|LOW"
    }
  ]
}
\`\`\`

## 分析维度
1. **地理分析**: 识别热门地点，评估地理分布和可达性
2. **活动分析**: 分类活动类型，评估受欢迎程度和适用性
3. **情感分析**: 分析内容的情感倾向和推荐强度
4. **质量评估**: 评估内容的完整性、实用性和可信度
5. **受众分析**: 识别目标受众和适用场景
6. **季节性分析**: 分析最佳旅行时间和季节偏好
7. **预算分析**: 评估消费水平和预算要求

**重要**: 只返回JSON格式的分析结果，不要包含其他文字说明。`
  }

  /**
   * 内容质量评估提示模板
   */
  static buildQualityAssessmentPrompt(content: ExtractedContent): string {
    return `请评估以下旅行内容的质量和实用性：

## 内容信息
- **标题**: ${content.title}
- **描述**: ${content.description}
- **来源平台**: ${content.platform}
- **地点数量**: ${content.locations.length}个
- **活动数量**: ${content.activities.length}个
- **媒体数量**: ${content.media.length}个
- **标签数量**: ${content.tags.length}个
- **互动数据**: 点赞${content.stats.likes} | 评论${content.stats.comments} | 分享${content.stats.shares}

## 评估要求
请返回JSON格式的详细评估结果：

\`\`\`json
{
  "overall_quality": 0-100,
  "detailed_scores": {
    "information_completeness": 0-100,
    "content_accuracy": 0-100,
    "practical_value": 0-100,
    "visual_quality": 0-100,
    "engagement_level": 0-100,
    "uniqueness": 0-100,
    "timeliness": 0-100
  },
  "strengths": [
    "优势点1",
    "优势点2",
    "优势点3"
  ],
  "weaknesses": [
    "不足点1",
    "不足点2"
  ],
  "missing_information": [
    "缺失信息1",
    "缺失信息2"
  ],
  "improvement_suggestions": [
    {
      "area": "改进领域",
      "suggestion": "具体建议",
      "priority": "HIGH|MEDIUM|LOW",
      "impact": "预期改进效果"
    }
  ],
  "reliability_assessment": {
    "credibility_score": 0-100,
    "source_authority": "HIGH|MEDIUM|LOW",
    "information_freshness": "CURRENT|RECENT|OUTDATED",
    "verification_status": "VERIFIED|PARTIAL|UNVERIFIED"
  },
  "usage_recommendations": {
    "best_use_cases": ["使用场景1", "使用场景2"],
    "target_travelers": ["目标用户1", "目标用户2"],
    "complementary_content": ["建议补充的内容类型1", "建议补充的内容类型2"]
  }
}
\`\`\`

## 评估标准
1. **信息完整性**: 是否包含足够的旅行规划信息
2. **内容准确性**: 信息的准确性和可靠性
3. **实用价值**: 对实际旅行规划的帮助程度
4. **视觉质量**: 图片和视频的质量和相关性
5. **参与度**: 用户互动数据反映的受欢迎程度
6. **独特性**: 内容的原创性和独特视角
7. **时效性**: 信息的新鲜度和当前相关性

**重要**: 只返回JSON格式的评估结果，不要包含其他文字说明。`
  }

  /**
   * 多模态内容分析提示模板（包含图像）
   */
  static buildMultimodalAnalysisPrompt(
    textContent: string,
    imageDescriptions: string[]
  ): string {
    return `你是一个专业的多模态旅行内容分析师。请综合分析以下文本和图像内容，提供深度洞察。

## 文本内容
${textContent}

## 图像描述
${imageDescriptions.map((desc, index) => `图像${index + 1}: ${desc}`).join('\n')}

## 分析要求
请进行多模态综合分析，返回JSON格式结果：

\`\`\`json
{
  "content_coherence": {
    "text_image_alignment": 0-100,
    "narrative_consistency": 0-100,
    "visual_storytelling": 0-100
  },
  "extracted_insights": {
    "locations": [
      {
        "name": "地点名称",
        "confidence": 0-100,
        "source": "TEXT|IMAGE|BOTH",
        "visual_features": ["特征1", "特征2"]
      }
    ],
    "activities": [
      {
        "name": "活动名称",
        "confidence": 0-100,
        "source": "TEXT|IMAGE|BOTH",
        "visual_evidence": "视觉证据描述"
      }
    ],
    "atmosphere": {
      "mood": "RELAXED|EXCITING|CULTURAL|ADVENTUROUS|ROMANTIC",
      "crowd_level": "CROWDED|MODERATE|QUIET",
      "time_of_day": "MORNING|AFTERNOON|EVENING|NIGHT",
      "season": "SPRING|SUMMER|AUTUMN|WINTER"
    }
  },
  "visual_quality_assessment": {
    "composition": 0-100,
    "lighting": 0-100,
    "clarity": 0-100,
    "appeal": 0-100,
    "informativeness": 0-100
  },
  "travel_appeal": {
    "inspiration_level": 0-100,
    "practical_value": 0-100,
    "authenticity": 0-100,
    "accessibility": 0-100
  },
  "recommendations": [
    {
      "type": "CONTENT_IMPROVEMENT|ADDITIONAL_INFO|VISUAL_ENHANCEMENT",
      "description": "建议描述",
      "priority": "HIGH|MEDIUM|LOW"
    }
  ]
}
\`\`\`

## 分析重点
1. **内容一致性**: 文本和图像是否相互支持和补充
2. **信息提取**: 从多个模态中提取旅行相关信息
3. **视觉质量**: 评估图像的质量和吸引力
4. **旅行价值**: 评估内容对旅行规划的价值

**重要**: 只返回JSON格式的分析结果，不要包含其他文字说明。`
  }
}

export default PromptTemplates
