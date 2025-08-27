/**
 * RecommendationEngine - AI驱动的个性化推荐系统
 * 
 * 功能：
 * - 基于内容的相似度匹配
 * - 个性化推荐算法
 * - 用户偏好学习
 * - 动态调整建议
 */

import { geminiService } from './GeminiService'
import { logger } from '@/lib/logger'
import type { 
  ExtractedContent, 
  UserRequirements
} from '@/types'
import type { 
  AnalysisResult,
  LocationInsight,
  ActivityInsight 
} from './ContentAnalyzer'

// 推荐结果接口
export interface RecommendationResult {
  recommendations: Recommendation[]
  confidence_score: number
  reasoning: string
  alternatives: Alternative[]
}

// 单个推荐项
export interface Recommendation {
  id: string
  type: 'location' | 'activity' | 'restaurant' | 'hotel' | 'route'
  title: string
  description: string
  score: number
  reasons: string[]
  metadata: RecommendationMetadata
}

// 推荐元数据
export interface RecommendationMetadata {
  location?: {
    name: string
    coordinates: [number, number]
    address?: string
  }
  timing?: {
    best_time: string
    duration: string
    season?: string
  }
  cost?: {
    estimated_price: number
    price_range: string
    currency: string
  }
  tags: string[]
  difficulty_level?: 'easy' | 'moderate' | 'challenging'
  popularity_score?: number
}

// 替代选项
export interface Alternative {
  title: string
  description: string
  score: number
  why_alternative: string
}

// 用户偏好配置
export interface UserPreferences {
  budget_range: 'low' | 'medium' | 'high'
  activity_types: string[]
  travel_style: 'relaxed' | 'adventure' | 'cultural' | 'luxury'
  group_type: 'solo' | 'couple' | 'family' | 'friends'
  interests: string[]
  avoid_list?: string[]
}

// 相似度计算结果
interface SimilarityScore {
  content_id: string
  score: number
  matching_factors: string[]
}

export class RecommendationEngine {
  constructor() {
    // Initialize any needed properties here
  }

  /**
   * 生成个性化推荐
   */
  async generateRecommendations(
    extractedContent: ExtractedContent[],
    userRequirements: UserRequirements,
    analysisResults: AnalysisResult[],
    userPreferences?: UserPreferences
  ): Promise<RecommendationResult> {
    try {
      logger.info('开始生成个性化推荐', {
        contentCount: extractedContent.length,
        duration: userRequirements.duration
      })

      // 1. 分析用户偏好
      const preferences = await this.analyzeUserPreferences(
        userRequirements,
        userPreferences
      )

      // 2. 计算内容相似度
      const similarityScores = await this.calculateContentSimilarity(
        extractedContent,
        analysisResults,
        preferences
      )

      // 3. 生成推荐列表
      const recommendations = await this.generateRecommendationList(
        similarityScores,
        extractedContent,
        analysisResults,
        preferences
      )

      // 4. 计算置信度分数
      const confidenceScore = this.calculateConfidenceScore(
        recommendations,
        similarityScores
      )

      // 5. 生成推荐理由
      const reasoning = await this.generateRecommendationReasoning(
        recommendations,
        preferences,
        userRequirements
      )

      // 6. 生成替代选项
      const alternatives = await this.generateAlternatives(
        recommendations,
        extractedContent,
        preferences
      )

      const result: RecommendationResult = {
        recommendations,
        confidence_score: confidenceScore,
        reasoning,
        alternatives
      }

      logger.info('推荐生成完成', {
        recommendationCount: recommendations.length,
        confidenceScore,
        alternativeCount: alternatives.length
      })

      return result

    } catch (error) {
      logger.error('推荐生成失败', { error })
      throw new Error(`推荐生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 分析用户偏好
   */
  private async analyzeUserPreferences(
    userRequirements: UserRequirements,
    explicitPreferences?: UserPreferences
  ): Promise<UserPreferences> {
    try {
      // 如果有明确的偏好设置，直接使用
      if (explicitPreferences) {
        return explicitPreferences
      }

      // 从用户需求中推断偏好 - 使用简化的分析方法
      const prompt = `分析用户需求并返回偏好设置JSON: ${JSON.stringify(userRequirements)}`

      const response = await geminiService.generateChatResponse(prompt, [])
      const preferences = this.parseUserPreferences(response)

      logger.info('用户偏好分析完成', { preferences })
      return preferences

    } catch (error) {
      logger.error('用户偏好分析失败', { error })
      
      // 返回默认偏好
      return {
        budget_range: 'medium',
        activity_types: ['sightseeing', 'dining'],
        travel_style: 'relaxed',
        group_type: 'couple',
        interests: ['culture', 'food']
      }
    }
  }

  /**
   * 计算内容相似度
   */
  private async calculateContentSimilarity(
    extractedContent: ExtractedContent[],
    analysisResults: AnalysisResult[],
    preferences: UserPreferences
  ): Promise<SimilarityScore[]> {
    const similarityScores: SimilarityScore[] = []

    for (let i = 0; i < extractedContent.length; i++) {
      const content = extractedContent[i]
      const analysis = analysisResults[i]

      if (!analysis) continue

      try {
        const score = await this.calculateSingleContentSimilarity(
          content,
          analysis,
          preferences
        )

        similarityScores.push({
          content_id: content.title || `content_${i}`,
          score: score.score,
          matching_factors: score.factors
        })

      } catch (error) {
        logger.error('内容相似度计算失败', { 
          contentTitle: content.title,
          error 
        })
      }
    }

    // 按分数排序
    return similarityScores.sort((a, b) => b.score - a.score)
  }

  /**
   * 计算单个内容的相似度
   */
  private async calculateSingleContentSimilarity(
    _content: ExtractedContent,
    analysis: AnalysisResult,
    preferences: UserPreferences
  ): Promise<{ score: number; factors: string[] }> {
    let score = 0
    const factors: string[] = []

    // 1. 活动类型匹配 (30%)
    const activityMatch = this.calculateActivityMatch(
      analysis.activities,
      preferences.activity_types
    )
    score += activityMatch.score * 0.3
    factors.push(...activityMatch.factors)

    // 2. 兴趣匹配 (25%)
    const interestMatch = this.calculateInterestMatch(
      analysis.themes,
      preferences.interests
    )
    score += interestMatch.score * 0.25
    factors.push(...interestMatch.factors)

    // 3. 旅行风格匹配 (20%)
    const styleMatch = this.calculateStyleMatch(
      analysis,
      preferences.travel_style
    )
    score += styleMatch.score * 0.2
    factors.push(...styleMatch.factors)

    // 4. 内容质量 (15%)
    score += (analysis.quality_score / 100) * 0.15
    if (analysis.quality_score > 80) {
      factors.push('高质量内容')
    }

    // 5. 地理位置相关性 (10%)
    const locationMatch = this.calculateLocationRelevance(
      analysis.locations,
      preferences
    )
    score += locationMatch.score * 0.1
    factors.push(...locationMatch.factors)

    return {
      score: Math.min(score, 1), // 确保分数不超过1
      factors
    }
  }

  /**
   * 计算活动类型匹配度
   */
  private calculateActivityMatch(
    activities: ActivityInsight[],
    preferredTypes: string[]
  ): { score: number; factors: string[] } {
    if (!activities.length || !preferredTypes.length) {
      return { score: 0, factors: [] }
    }

    const factors: string[] = []
    let matchCount = 0

    for (const activity of activities) {
      for (const preferredType of preferredTypes) {
        if (activity.category.toLowerCase().includes(preferredType.toLowerCase()) ||
            activity.name.toLowerCase().includes(preferredType.toLowerCase())) {
          matchCount++
          factors.push(`匹配活动: ${activity.name}`)
          break
        }
      }
    }

    const score = matchCount / Math.max(activities.length, preferredTypes.length)
    return { score, factors }
  }

  /**
   * 计算兴趣匹配度
   */
  private calculateInterestMatch(
    themes: string[],
    interests: string[]
  ): { score: number; factors: string[] } {
    if (!themes.length || !interests.length) {
      return { score: 0, factors: [] }
    }

    const factors: string[] = []
    let matchCount = 0

    for (const theme of themes) {
      for (const interest of interests) {
        if (theme.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(theme.toLowerCase())) {
          matchCount++
          factors.push(`匹配兴趣: ${theme}`)
          break
        }
      }
    }

    const score = matchCount / Math.max(themes.length, interests.length)
    return { score, factors }
  }

  /**
   * 计算旅行风格匹配度
   */
  private calculateStyleMatch(
    analysis: AnalysisResult,
    travelStyle: string
  ): { score: number; factors: string[] } {
    const factors: string[] = []
    let score = 0

    // 根据旅行风格评估内容
    switch (travelStyle) {
      case 'relaxed':
        if (analysis.themes.some(theme => 
          ['休闲', '放松', '度假', '慢节奏'].some(keyword => 
            theme.includes(keyword)))) {
          score = 0.8
          factors.push('适合休闲旅行')
        }
        break

      case 'adventure':
        if (analysis.themes.some(theme => 
          ['冒险', '探险', '户外', '刺激'].some(keyword => 
            theme.includes(keyword)))) {
          score = 0.8
          factors.push('适合冒险旅行')
        }
        break

      case 'cultural':
        if (analysis.themes.some(theme => 
          ['文化', '历史', '艺术', '传统'].some(keyword => 
            theme.includes(keyword)))) {
          score = 0.8
          factors.push('适合文化旅行')
        }
        break

      case 'luxury':
        if (analysis.themes.some(theme => 
          ['奢华', '高端', '精品', '豪华'].some(keyword => 
            theme.includes(keyword)))) {
          score = 0.8
          factors.push('适合奢华旅行')
        }
        break

      default:
        score = 0.5
    }

    return { score, factors }
  }

  /**
   * 计算地理位置相关性
   */
  private calculateLocationRelevance(
    locations: LocationInsight[],
    _preferences: UserPreferences
  ): { score: number; factors: string[] } {
    const factors: string[] = []
    
    if (!locations.length) {
      return { score: 0, factors: [] }
    }

    // 基于位置数量和质量评分
    const score = Math.min(locations.length / 5, 1) // 最多5个位置得满分
    
    if (locations.length > 0) {
      factors.push(`包含${locations.length}个地理位置`)
    }

    return { score, factors }
  }

  /**
   * 生成推荐列表
   */
  private async generateRecommendationList(
    similarityScores: SimilarityScore[],
    extractedContent: ExtractedContent[],
    analysisResults: AnalysisResult[],
    preferences: UserPreferences
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 取前10个最相似的内容
    const topContent = similarityScores.slice(0, 10)

    for (const similarity of topContent) {
      const content = extractedContent.find(c => (c.title || `content_${extractedContent.indexOf(c)}`) === similarity.content_id)
      const analysis = analysisResults.find((_, index) => 
        (extractedContent[index]?.title || `content_${index}`) === similarity.content_id
      )

      if (!content || !analysis) continue

      try {
        const recommendation = await this.createRecommendationFromContent(
          content,
          analysis,
          similarity,
          preferences
        )

        if (recommendation) {
          recommendations.push(recommendation)
        }

      } catch (error) {
        logger.error('创建推荐项失败', { 
          contentTitle: content.title,
          error 
        })
      }
    }

    return recommendations
  }

  /**
   * 从内容创建推荐项
   */
  private async createRecommendationFromContent(
    content: ExtractedContent,
    analysis: AnalysisResult,
    similarity: SimilarityScore,
    _preferences: UserPreferences
  ): Promise<Recommendation | null> {
    try {
      // 确定推荐类型
      const type = this.determineRecommendationType(analysis)
      
      // 生成推荐描述
      const description = await this.generateRecommendationDescription(
        content,
        analysis
      )

      const recommendation: Recommendation = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: content.title || '精彩推荐',
        description,
        score: similarity.score,
        reasons: similarity.matching_factors,
        metadata: {
          location: analysis.locations[0] ? {
            name: analysis.locations[0].name,
            coordinates: analysis.locations[0].coordinates || [0, 0],
            address: '地址信息'
          } : undefined,
          timing: {
            best_time: '全天',
            duration: this.estimateDuration(analysis),
            season: '四季皆宜'
          },
          cost: {
            estimated_price: this.estimatePrice(analysis),
            price_range: this.getPriceRange(analysis),
            currency: 'CNY'
          },
          tags: analysis.themes,
          popularity_score: analysis.quality_score
        }
      }

      return recommendation

    } catch (error) {
      logger.error('创建推荐项失败', { error })
      return null
    }
  }

  /**
   * 确定推荐类型
   */
  private determineRecommendationType(analysis: AnalysisResult): Recommendation['type'] {
    // 基于分析结果确定类型
    if (analysis.locations.length > 0) {
      const location = analysis.locations[0]
      if (location.type?.includes('景点') || location.type?.includes('景区')) {
        return 'location'
      }
      if (location.type?.includes('餐厅') || location.type?.includes('美食')) {
        return 'restaurant'
      }
      if (location.type?.includes('酒店') || location.type?.includes('住宿')) {
        return 'hotel'
      }
    }

    if (analysis.activities.length > 0) {
      return 'activity'
    }

    return 'location' // 默认类型
  }

  /**
   * 生成推荐描述
   */
  private async generateRecommendationDescription(
    content: ExtractedContent,
    analysis: AnalysisResult
  ): Promise<string> {
    try {
      // 使用简化的描述生成方法
      const prompt = `基于以下内容生成推荐描述：标题：${content.title}，描述：${content.description}，主题：${analysis.themes.join(', ')}`

      const response = await geminiService.generateChatResponse(prompt, [])
      return response.trim()

    } catch (error) {
      logger.error('生成推荐描述失败', { error })
      return content.description || '这是一个精彩的旅行推荐，值得体验。'
    }
  }

  /**
   * 估算持续时间
   */
  private estimateDuration(analysis: AnalysisResult): string {
    if (analysis.activities.length === 0) {
      return '1-2小时'
    }

    const totalActivities = analysis.activities.length
    if (totalActivities <= 2) {
      return '1-3小时'
    } else if (totalActivities <= 4) {
      return '半天'
    } else {
      return '全天'
    }
  }

  /**
   * 估算价格
   */
  private estimatePrice(analysis: AnalysisResult): number {
    // 基于内容质量和活动数量估算价格
    const basePrice = 100
    const qualityMultiplier = analysis.quality_score / 100
    const activityMultiplier = Math.min(analysis.activities.length * 0.5, 2)
    
    return Math.round(basePrice * qualityMultiplier * activityMultiplier)
  }

  /**
   * 获取价格范围
   */
  private getPriceRange(analysis: AnalysisResult): string {
    const price = this.estimatePrice(analysis)
    
    if (price < 100) {
      return '经济实惠'
    } else if (price < 300) {
      return '中等价位'
    } else {
      return '高端消费'
    }
  }

  /**
   * 计算置信度分数
   */
  private calculateConfidenceScore(
    recommendations: Recommendation[],
    similarityScores: SimilarityScore[]
  ): number {
    if (!recommendations.length) {
      return 0
    }

    // 基于推荐数量和平均相似度分数计算置信度
    const avgSimilarity = similarityScores
      .slice(0, recommendations.length)
      .reduce((sum, score) => sum + score.score, 0) / recommendations.length

    const countFactor = Math.min(recommendations.length / 5, 1) // 5个推荐得满分
    
    return Math.round((avgSimilarity * 0.7 + countFactor * 0.3) * 100)
  }

  /**
   * 生成推荐理由
   */
  private async generateRecommendationReasoning(
    recommendations: Recommendation[],
    preferences: UserPreferences,
    userRequirements: UserRequirements
  ): Promise<string> {
    try {
      // 使用简化的推荐理由生成
      const prompt = `基于用户偏好${JSON.stringify(preferences)}和需求${JSON.stringify(userRequirements)}，为以下推荐生成理由：${recommendations.map(r => r.title).join(', ')}`

      const response = await geminiService.generateChatResponse(prompt, [])
      return response.trim()

    } catch (error) {
      logger.error('生成推荐理由失败', { error })
      return '基于您的需求和偏好，我们为您精选了这些推荐，希望能为您的旅行增添精彩体验。'
    }
  }

  /**
   * 生成替代选项
   */
  private async generateAlternatives(
    recommendations: Recommendation[],
    extractedContent: ExtractedContent[],
    preferences: UserPreferences
  ): Promise<Alternative[]> {
    try {
      // 从未被推荐的内容中选择替代选项
      const recommendedUrls = new Set(
        recommendations.map(r => r.id)
      )

      const alternativeContent = extractedContent
        .filter(content => !recommendedUrls.has(content.title || 'unknown'))
        .slice(0, 3) // 最多3个替代选项

      const alternatives: Alternative[] = []

      for (const content of alternativeContent) {
        const alternative: Alternative = {
          title: content.title || '替代选择',
          description: content.description || '另一个不错的选择',
          score: 0.6, // 默认分数
          why_alternative: this.generateAlternativeReason(content, preferences)
        }

        alternatives.push(alternative)
      }

      return alternatives

    } catch (error) {
      logger.error('生成替代选项失败', { error })
      return []
    }
  }

  /**
   * 生成替代选择理由
   */
  private generateAlternativeReason(
    _content: ExtractedContent,
    _preferences: UserPreferences
  ): string {
    const reasons = [
      '如果您想要不同的体验',
      '作为备选方案考虑',
      '适合时间充裕的情况',
      '预算允许的话可以考虑',
      '如果主要推荐不合适'
    ]

    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  /**
   * 解析用户偏好
   */
  private parseUserPreferences(response: string): UserPreferences {
    try {
      // 尝试解析JSON响应
      const parsed = JSON.parse(response)
      return {
        budget_range: parsed.budget_range || 'medium',
        activity_types: parsed.activity_types || ['sightseeing'],
        travel_style: parsed.travel_style || 'relaxed',
        group_type: parsed.group_type || 'couple',
        interests: parsed.interests || ['culture'],
        avoid_list: parsed.avoid_list
      }
    } catch (error) {
      logger.error('解析用户偏好失败', { error, response })
      
      // 返回默认偏好
      return {
        budget_range: 'medium',
        activity_types: ['sightseeing', 'dining'],
        travel_style: 'relaxed',
        group_type: 'couple',
        interests: ['culture', 'food']
      }
    }
  }
}
