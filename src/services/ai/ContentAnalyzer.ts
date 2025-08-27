import { geminiService } from './GeminiService'
import { logger } from '@/lib/logger'
import type { ExtractedContent } from '@/types'

// 分析结果类型定义
export interface AnalysisResult {
  locations: LocationInsight[]
  activities: ActivityInsight[]
  themes: string[]
  quality_score: number
  recommendations: string[]
  sentiment: SentimentAnalysis
  travel_insights: TravelInsights
}

export interface LocationInsight {
  name: string
  type: 'CITY' | 'ATTRACTION' | 'DISTRICT' | 'LANDMARK'
  coordinates?: [number, number]
  popularity_score: number
  mentioned_count: number
  related_activities: string[]
  best_time_to_visit?: string
  estimated_duration?: number
}

export interface ActivityInsight {
  name: string
  category: 'SIGHTSEEING' | 'DINING' | 'SHOPPING' | 'ENTERTAINMENT' | 'CULTURE' | 'NATURE' | 'ADVENTURE'
  popularity_score: number
  mentioned_count: number
  estimated_cost?: number
  duration?: number
  difficulty_level?: 'EASY' | 'MODERATE' | 'HARD'
  best_season?: string[]
  tips: string[]
}

export interface SentimentAnalysis {
  overall_sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  enthusiasm_level: number // 0-100
  recommendation_strength: number // 0-100
  concerns: string[]
  highlights: string[]
}

export interface TravelInsights {
  destination_type: 'URBAN' | 'NATURE' | 'CULTURAL' | 'BEACH' | 'ADVENTURE' | 'MIXED'
  travel_style: string[]
  budget_level: 'BUDGET' | 'MID_RANGE' | 'LUXURY' | 'MIXED'
  target_audience: string[]
  seasonal_preferences: string[]
  duration_recommendation: {
    min_days: number
    max_days: number
    optimal_days: number
  }
}

export class ContentAnalyzer {
  /**
   * 分析多个提取的内容，生成综合洞察
   */
  async analyzeContents(contents: ExtractedContent[]): Promise<AnalysisResult> {
    if (!contents || contents.length === 0) {
      throw new Error('没有内容可供分析')
    }

    logger.info('开始分析内容', { contentCount: contents.length })

    try {
      // 构建分析提示
      const prompt = this.buildAnalysisPrompt(contents)
      
      // 调用 Gemini 进行分析
      const response = await geminiService['model'].generateContent(prompt)
      const analysisText = response.response.text()
      
      // 解析分析结果
      const result = this.parseAnalysisResult(analysisText)
      
      // 后处理和验证
      const validatedResult = this.validateAndEnhanceResult(result, contents)
      
      logger.info('内容分析完成', { 
        locationsFound: validatedResult.locations.length,
        activitiesFound: validatedResult.activities.length,
        qualityScore: validatedResult.quality_score
      })
      
      return validatedResult
    } catch (error) {
      logger.error('内容分析失败', { error })
      throw new Error(`内容分析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 分析单个内容的质量和相关性
   */
  async analyzeContentQuality(content: ExtractedContent): Promise<{
    quality_score: number
    relevance_score: number
    completeness_score: number
    issues: string[]
    suggestions: string[]
  }> {
    const prompt = this.buildQualityAnalysisPrompt(content)
    
    try {
      const response = await geminiService['model'].generateContent(prompt)
      const resultText = response.response.text()
      return JSON.parse(resultText)
    } catch (error) {
      logger.error('内容质量分析失败', { error, contentTitle: content.title })
      return {
        quality_score: 50,
        relevance_score: 50,
        completeness_score: 50,
        issues: ['分析失败'],
        suggestions: ['请检查内容格式']
      }
    }
  }

  /**
   * 提取地理位置信息并进行地理编码
   */
  async extractLocationInsights(contents: ExtractedContent[]): Promise<LocationInsight[]> {
    const allLocations = contents.flatMap(content => content.locations)
    const locationMap = new Map<string, LocationInsight>()

    // 合并相同地点的信息
    allLocations.forEach(location => {
      const key = location.name.toLowerCase()
      if (locationMap.has(key)) {
        const existing = locationMap.get(key)!
        existing.mentioned_count += 1
      } else {
        locationMap.set(key, {
          name: location.name,
          type: this.classifyLocationType(location.name),
          coordinates: location.coordinates,
          popularity_score: this.calculatePopularityScore(location.name, contents),
          mentioned_count: 1,
          related_activities: this.findRelatedActivities(location.name, contents),
          estimated_duration: this.estimateVisitDuration(location.type)
        })
      }
    })

    return Array.from(locationMap.values())
      .sort((a, b) => b.popularity_score - a.popularity_score)
  }

  /**
   * 提取活动洞察
   */
  async extractActivityInsights(contents: ExtractedContent[]): Promise<ActivityInsight[]> {
    const allActivities = contents.flatMap(content => content.activities)
    const activityMap = new Map<string, ActivityInsight>()

    allActivities.forEach(activity => {
      const key = activity.name.toLowerCase()
      if (activityMap.has(key)) {
        const existing = activityMap.get(key)!
        existing.mentioned_count += 1
        if (activity.estimatedCost) {
          existing.estimated_cost = (existing.estimated_cost || 0 + activity.estimatedCost) / 2
        }
      } else {
        activityMap.set(key, {
          name: activity.name,
          category: this.classifyActivityCategory(activity.category),
          popularity_score: this.calculateActivityPopularity(activity.name, contents),
          mentioned_count: 1,
          estimated_cost: activity.estimatedCost,
          duration: activity.duration,
          difficulty_level: this.assessDifficulty(activity.description),
          tips: activity.tips || []
        })
      }
    })

    return Array.from(activityMap.values())
      .sort((a, b) => b.popularity_score - a.popularity_score)
  }

  /**
   * 构建内容分析提示
   */
  private buildAnalysisPrompt(contents: ExtractedContent[]): string {
    const contentSummary = contents.map(content => ({
      platform: content.platform,
      title: content.title,
      description: content.description,
      locations: content.locations.map(l => l.name),
      activities: content.activities.map(a => a.name),
      tags: content.tags,
      stats: content.stats
    }))

    return `请分析以下旅行内容，提供深度洞察和建议：

内容数据：
${JSON.stringify(contentSummary, null, 2)}

请按以下JSON格式返回分析结果：
{
  "locations": [
    {
      "name": "地点名称",
      "type": "CITY|ATTRACTION|DISTRICT|LANDMARK",
      "coordinates": [纬度, 经度],
      "popularity_score": 0-100,
      "mentioned_count": 提及次数,
      "related_activities": ["相关活动"],
      "best_time_to_visit": "最佳游览时间",
      "estimated_duration": 建议游览时长(分钟)
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
      "best_season": ["适合季节"],
      "tips": ["实用建议"]
    }
  ],
  "themes": ["主要主题1", "主要主题2"],
  "quality_score": 0-100,
  "recommendations": ["推荐建议1", "推荐建议2"],
  "sentiment": {
    "overall_sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
    "enthusiasm_level": 0-100,
    "recommendation_strength": 0-100,
    "concerns": ["关注点"],
    "highlights": ["亮点"]
  },
  "travel_insights": {
    "destination_type": "URBAN|NATURE|CULTURAL|BEACH|ADVENTURE|MIXED",
    "travel_style": ["旅行风格"],
    "budget_level": "BUDGET|MID_RANGE|LUXURY|MIXED",
    "target_audience": ["目标人群"],
    "seasonal_preferences": ["季节偏好"],
    "duration_recommendation": {
      "min_days": 最少天数,
      "max_days": 最多天数,
      "optimal_days": 最佳天数
    }
  }
}

分析要求：
1. 综合考虑所有内容的信息
2. 识别热门地点和活动
3. 评估内容质量和可信度
4. 提供实用的旅行建议
5. 分析旅行风格和预算水平
6. 只返回JSON，不要其他文字`
  }

  /**
   * 构建质量分析提示
   */
  private buildQualityAnalysisPrompt(content: ExtractedContent): string {
    return `请评估以下旅行内容的质量：

内容信息：
- 标题：${content.title}
- 描述：${content.description}
- 平台：${content.platform}
- 地点数量：${content.locations.length}
- 活动数量：${content.activities.length}
- 媒体数量：${content.media.length}
- 标签数量：${content.tags.length}
- 互动数据：${JSON.stringify(content.stats)}

请返回JSON格式的评估结果：
{
  "quality_score": 0-100,
  "relevance_score": 0-100,
  "completeness_score": 0-100,
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}

评估标准：
1. 信息完整性（地点、活动、描述等）
2. 内容相关性（是否与旅行相关）
3. 数据质量（准确性、实用性）
4. 用户参与度（点赞、评论等）
5. 只返回JSON，不要其他文字`
  }

  /**
   * 解析分析结果
   */
  private parseAnalysisResult(analysisText: string): AnalysisResult {
    try {
      // 清理可能的markdown格式
      const cleanText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(cleanText)
    } catch (error) {
      logger.error('解析分析结果失败', { error, analysisText })
      throw new Error('AI分析结果格式错误')
    }
  }

  /**
   * 验证和增强分析结果
   */
  private validateAndEnhanceResult(result: AnalysisResult, _contents: ExtractedContent[]): AnalysisResult {
    // 确保必要字段存在
    result.locations = result.locations || []
    result.activities = result.activities || []
    result.themes = result.themes || []
    result.quality_score = Math.max(0, Math.min(100, result.quality_score || 50))
    result.recommendations = result.recommendations || []

    // 增强地点信息
    result.locations = result.locations.map(location => ({
      ...location,
      popularity_score: Math.max(0, Math.min(100, location.popularity_score || 50)),
      mentioned_count: location.mentioned_count || 1
    }))

    // 增强活动信息
    result.activities = result.activities.map(activity => ({
      ...activity,
      popularity_score: Math.max(0, Math.min(100, activity.popularity_score || 50)),
      mentioned_count: activity.mentioned_count || 1,
      tips: activity.tips || []
    }))

    return result
  }

  /**
   * 分类地点类型
   */
  private classifyLocationType(locationName: string): LocationInsight['type'] {
    const name = locationName.toLowerCase()
    
    if (name.includes('市') || name.includes('城') || name.includes('区')) {
      return 'CITY'
    }
    if (name.includes('景区') || name.includes('公园') || name.includes('寺') || name.includes('宫')) {
      return 'ATTRACTION'
    }
    if (name.includes('街') || name.includes('路') || name.includes('广场')) {
      return 'DISTRICT'
    }
    
    return 'LANDMARK'
  }

  /**
   * 分类活动类别
   */
  private classifyActivityCategory(category: string): ActivityInsight['category'] {
    const cat = category.toLowerCase()
    
    if (cat.includes('美食') || cat.includes('餐') || cat.includes('吃')) return 'DINING'
    if (cat.includes('购物') || cat.includes('买')) return 'SHOPPING'
    if (cat.includes('文化') || cat.includes('历史') || cat.includes('博物馆')) return 'CULTURE'
    if (cat.includes('自然') || cat.includes('山') || cat.includes('海')) return 'NATURE'
    if (cat.includes('娱乐') || cat.includes('夜生活')) return 'ENTERTAINMENT'
    if (cat.includes('冒险') || cat.includes('极限')) return 'ADVENTURE'
    
    return 'SIGHTSEEING'
  }

  /**
   * 计算地点流行度
   */
  private calculatePopularityScore(locationName: string, contents: ExtractedContent[]): number {
    let score = 0
    let mentions = 0
    
    contents.forEach(content => {
      const isLocationMentioned = content.locations.some(loc => 
        loc.name.toLowerCase().includes(locationName.toLowerCase())
      )
      
      if (isLocationMentioned) {
        mentions++
        score += content.stats.likes * 0.3 + content.stats.comments * 0.5 + content.stats.shares * 0.2
      }
    })
    
    return Math.min(100, (score / Math.max(1, mentions)) / 100 + mentions * 10)
  }

  /**
   * 计算活动流行度
   */
  private calculateActivityPopularity(activityName: string, contents: ExtractedContent[]): number {
    let score = 0
    let mentions = 0
    
    contents.forEach(content => {
      const isActivityMentioned = content.activities.some(act => 
        act.name.toLowerCase().includes(activityName.toLowerCase())
      )
      
      if (isActivityMentioned) {
        mentions++
        score += content.stats.likes * 0.4 + content.stats.comments * 0.4 + content.stats.shares * 0.2
      }
    })
    
    return Math.min(100, (score / Math.max(1, mentions)) / 50 + mentions * 15)
  }

  /**
   * 查找相关活动
   */
  private findRelatedActivities(locationName: string, contents: ExtractedContent[]): string[] {
    const activities = new Set<string>()
    
    contents.forEach(content => {
      const hasLocation = content.locations.some(loc => 
        loc.name.toLowerCase().includes(locationName.toLowerCase())
      )
      
      if (hasLocation) {
        content.activities.forEach(activity => {
          activities.add(activity.name)
        })
      }
    })
    
    return Array.from(activities).slice(0, 5)
  }

  /**
   * 估算游览时长
   */
  private estimateVisitDuration(type: string): number {
    switch (type) {
      case 'ATTRACTION': return 180 // 3小时
      case 'RESTAURANT': return 90  // 1.5小时
      case 'HOTEL': return 60       // 1小时
      case 'TRANSPORT': return 30   // 30分钟
      default: return 120           // 2小时
    }
  }

  /**
   * 评估活动难度
   */
  private assessDifficulty(description: string): ActivityInsight['difficulty_level'] {
    const desc = description.toLowerCase()
    
    if (desc.includes('困难') || desc.includes('挑战') || desc.includes('极限')) {
      return 'HARD'
    }
    if (desc.includes('适中') || desc.includes('一般') || desc.includes('需要')) {
      return 'MODERATE'
    }
    
    return 'EASY'
  }
}

// 单例实例
export const contentAnalyzer = new ContentAnalyzer()
