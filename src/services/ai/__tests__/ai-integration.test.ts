/**
 * AI Integration Tests
 * 
 * 测试 AI 服务的集成功能，包括：
 * - ContentAnalyzer 内容分析
 * - TravelPlanGenerator 旅行计划生成
 * - RecommendationEngine 推荐引擎
 * - API 路由集成测试
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ContentAnalyzer } from '../ContentAnalyzer'
import { TravelPlanGenerator } from '../TravelPlanGenerator'
import { RecommendationEngine } from '../RecommendationEngine'
import PromptTemplates from '../PromptTemplates'
import type { ExtractedContent, UserRequirements } from '@/types'

// Mock Gemini service
jest.mock('../GeminiService', () => ({
  geminiService: {
    model: {
      generateContent: jest.fn()
    },
    generateChatResponse: jest.fn()
  }
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}))

describe('AI Integration Tests', () => {
  let contentAnalyzer: ContentAnalyzer
  let travelPlanGenerator: TravelPlanGenerator
  let recommendationEngine: RecommendationEngine

  // Sample test data
  const mockExtractedContent: ExtractedContent[] = [
    {
      title: '东京浅草寺一日游',
      description: '探索东京最古老的寺庙，体验传统日本文化',
      platform: 'XIAOHONGSHU',
      locations: [
        {
          name: '浅草寺',
          address: '东京都台东区浅草2-3-1',
          coordinates: [35.7148, 139.7967],
          type: 'ATTRACTION'
        }
      ],
      activities: [
        {
          name: '参观浅草寺',
          description: '参观东京最古老的佛教寺庙',
          category: '文化体验',
          estimatedCost: 0,
          duration: 120,
          tips: ['早上人少', '可以求签']
        }
      ],
      media: [
        {
          type: 'IMAGE',
          url: 'https://example.com/sensoji.jpg',
          caption: '浅草寺雷门'
        }
      ],
      tags: ['文化', '历史', '寺庙', '东京'],
      author: {
        name: '旅行达人小王',
        avatar: 'https://example.com/avatar.jpg'
      },
      stats: {
        likes: 1250,
        comments: 89,
        shares: 45
      }
    },
    {
      title: '银座购物美食攻略',
      description: '银座高端购物和米其林美食体验',
      platform: 'BILIBILI',
      locations: [
        {
          name: '银座',
          address: '东京都中央区银座',
          coordinates: [35.6762, 139.7653],
          type: 'ATTRACTION'
        }
      ],
      activities: [
        {
          name: '银座购物',
          description: '在银座的高端百货商店购物',
          category: '购物',
          estimatedCost: 5000,
          duration: 180
        },
        {
          name: '米其林餐厅用餐',
          description: '体验银座的米其林星级餐厅',
          category: '美食',
          estimatedCost: 2000,
          duration: 120
        }
      ],
      media: [
        {
          type: 'VIDEO',
          url: 'https://example.com/ginza.mp4',
          caption: '银座购物街'
        }
      ],
      tags: ['购物', '美食', '奢华', '银座'],
      author: {
        name: '美食博主',
        avatar: 'https://example.com/foodie.jpg'
      },
      stats: {
        likes: 2100,
        comments: 156,
        shares: 78
      }
    }
  ]

  const mockUserRequirements: UserRequirements = {
    duration: 5,
    travelers: 2,
    budget: 15000,
    travelStyle: ['文化', '美食'],
    interests: ['历史', '购物', '美食'],
    dietaryRestrictions: [],
    accessibility: [],
    freeText: '希望体验传统日本文化，同时享受现代东京的便利'
  }

  beforeEach(() => {
    contentAnalyzer = new ContentAnalyzer()
    travelPlanGenerator = new TravelPlanGenerator()
    recommendationEngine = new RecommendationEngine()

    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('ContentAnalyzer', () => {
    it('should analyze content and return structured insights', async () => {
      // Mock Gemini response
      const mockAnalysisResponse = {
        response: {
          text: () => JSON.stringify({
            locations: [
              {
                name: '浅草寺',
                type: 'ATTRACTION',
                coordinates: [35.7148, 139.7967],
                popularity_score: 95,
                mentioned_count: 1,
                related_activities: ['参观浅草寺'],
                best_time_to_visit: '早上',
                estimated_duration: 120
              }
            ],
            activities: [
              {
                name: '参观浅草寺',
                category: 'CULTURE',
                popularity_score: 90,
                mentioned_count: 1,
                estimated_cost: 0,
                duration: 120,
                difficulty_level: 'EASY',
                tips: ['早上人少', '可以求签']
              }
            ],
            themes: ['文化', '历史', '传统'],
            quality_score: 88,
            recommendations: ['适合文化爱好者', '建议早上前往'],
            sentiment: {
              overall_sentiment: 'POSITIVE',
              enthusiasm_level: 85,
              recommendation_strength: 90,
              concerns: [],
              highlights: ['历史悠久', '文化体验丰富']
            },
            travel_insights: {
              destination_type: 'CULTURAL',
              travel_style: ['文化', '历史'],
              budget_level: 'BUDGET',
              target_audience: ['文化爱好者', '历史爱好者'],
              seasonal_preferences: ['春季', '秋季'],
              duration_recommendation: {
                min_days: 1,
                max_days: 2,
                optimal_days: 1
              }
            }
          })
        }
      }

      const { geminiService } = require('../GeminiService')
      geminiService.model.generateContent.mockResolvedValue(mockAnalysisResponse)

      const result = await contentAnalyzer.analyzeContents([mockExtractedContent[0]])

      expect(result).toBeDefined()
      expect(result.locations).toHaveLength(1)
      expect(result.locations[0].name).toBe('浅草寺')
      expect(result.activities).toHaveLength(1)
      expect(result.quality_score).toBe(88)
      expect(result.themes).toContain('文化')
      expect(result.sentiment.overall_sentiment).toBe('POSITIVE')
      expect(result.travel_insights.destination_type).toBe('CULTURAL')
    })

    it('should handle analysis errors gracefully', async () => {
      const { geminiService } = require('../GeminiService')
      geminiService.model.generateContent.mockRejectedValue(new Error('API Error'))

      await expect(contentAnalyzer.analyzeContents([mockExtractedContent[0]]))
        .rejects.toThrow('内容分析失败')
    })

    it('should analyze content quality correctly', async () => {
      const mockQualityResponse = {
        response: {
          text: () => JSON.stringify({
            quality_score: 85,
            relevance_score: 90,
            completeness_score: 80,
            issues: [],
            suggestions: ['添加更多实用信息']
          })
        }
      }

      const { geminiService } = require('../GeminiService')
      geminiService.model.generateContent.mockResolvedValue(mockQualityResponse)

      const result = await contentAnalyzer.analyzeContentQuality(mockExtractedContent[0])

      expect(result.quality_score).toBe(85)
      expect(result.relevance_score).toBe(90)
      expect(result.completeness_score).toBe(80)
    })
  })

  describe('TravelPlanGenerator', () => {
    it('should generate a complete travel plan', async () => {
      // Mock analysis result
      const mockAnalysisResponse = {
        response: {
          text: () => JSON.stringify({
            locations: mockExtractedContent[0].locations,
            activities: mockExtractedContent[0].activities,
            themes: ['文化', '历史'],
            quality_score: 88,
            recommendations: ['适合文化爱好者'],
            sentiment: {
              overall_sentiment: 'POSITIVE',
              enthusiasm_level: 85,
              recommendation_strength: 90,
              concerns: [],
              highlights: ['历史悠久']
            },
            travel_insights: {
              destination_type: 'CULTURAL',
              travel_style: ['文化'],
              budget_level: 'BUDGET',
              target_audience: ['文化爱好者'],
              seasonal_preferences: ['春季'],
              duration_recommendation: {
                min_days: 3,
                max_days: 7,
                optimal_days: 5
              }
            }
          })
        }
      }

      // Mock travel plan response
      const mockPlanResponse = {
        response: {
          text: () => JSON.stringify({
            title: '东京文化美食5日游',
            destination: '东京',
            days: [
              {
                dayNumber: 1,
                date: '2024-04-01',
                title: '传统文化探索',
                theme: '文化体验',
                activities: [
                  {
                    id: 'activity-1-1',
                    order: 1,
                    startTime: '09:00',
                    endTime: '11:00',
                    type: 'ATTRACTION',
                    title: '浅草寺参观',
                    description: '参观东京最古老的佛教寺庙',
                    location: {
                      name: '浅草寺',
                      address: '东京都台东区浅草2-3-1',
                      coordinates: [35.7148, 139.7967]
                    },
                    estimatedCost: 0,
                    tips: ['早上人少', '可以求签']
                  }
                ],
                dailySummary: {
                  totalCost: 3000,
                  walkingDistance: 2.5,
                  highlights: ['浅草寺', '传统文化体验']
                }
              }
            ],
            estimatedBudget: {
              min: 12000,
              max: 18000,
              breakdown: {
                accommodation: 6000,
                food: 5000,
                activities: 3000,
                transport: 2000
              }
            }
          })
        }
      }

      const { geminiService } = require('../GeminiService')
      geminiService.model.generateContent
        .mockResolvedValueOnce(mockAnalysisResponse)
        .mockResolvedValueOnce(mockPlanResponse)

      const result = await travelPlanGenerator.generateTravelPlan(
        mockExtractedContent,
        mockUserRequirements
      )

      expect(result).toBeDefined()
      expect(result.title).toBe('东京文化美食5日游')
      expect(result.destination).toBe('东京')
      expect(result.totalDays).toBe(5)
      expect(result.days).toHaveLength(1)
      expect(result.days[0].activities).toHaveLength(1)
      expect(result.estimatedBudget.min).toBe(12000)
    })

    it('should optimize route correctly', async () => {
      const activities = [
        {
          id: 'act1',
          order: 1,
          startTime: '09:00',
          endTime: '11:00',
          type: 'ATTRACTION' as const,
          title: '浅草寺',
          description: '参观寺庙',
          location: {
            name: '浅草寺',
            address: '东京都台东区浅草2-3-1',
            coordinates: [35.7148, 139.7967] as [number, number]
          },
          estimatedCost: 0,
          tips: []
        },
        {
          id: 'act2',
          order: 2,
          startTime: '14:00',
          endTime: '16:00',
          type: 'ATTRACTION' as const,
          title: '银座',
          description: '购物区域',
          location: {
            name: '银座',
            address: '东京都中央区银座',
            coordinates: [35.6762, 139.7653] as [number, number]
          },
          estimatedCost: 2000,
          tips: []
        }
      ]

      const optimizedActivities = await travelPlanGenerator.optimizeRoute(activities)

      expect(optimizedActivities).toHaveLength(2)
      expect(optimizedActivities[0].order).toBe(1)
      expect(optimizedActivities[1].order).toBe(2)
    })

    it('should estimate budget accurately', () => {
      const mockPlan = {
        id: 'plan1',
        title: '测试计划',
        destination: '东京',
        totalDays: 3,
        days: [
          {
            dayNumber: 1,
            date: '2024-04-01',
            title: '第一天',
            theme: '文化',
            activities: [
              {
                id: 'act1',
                order: 1,
                startTime: '09:00',
                endTime: '11:00',
                type: 'HOTEL' as const,
                title: '酒店',
                description: '住宿',
                location: { name: '酒店', address: '', coordinates: [0, 0] as [number, number] },
                estimatedCost: 500,
                tips: []
              },
              {
                id: 'act2',
                order: 2,
                startTime: '12:00',
                endTime: '14:00',
                type: 'RESTAURANT' as const,
                title: '餐厅',
                description: '用餐',
                location: { name: '餐厅', address: '', coordinates: [0, 0] as [number, number] },
                estimatedCost: 200,
                tips: []
              }
            ],
            dailySummary: {
              totalCost: 700,
              walkingDistance: 1,
              highlights: []
            }
          }
        ],
        estimatedBudget: {
          min: 0,
          max: 0,
          breakdown: { accommodation: 0, food: 0, activities: 0, transport: 0 }
        },
        noteId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const budget = travelPlanGenerator.estimateBudget(mockPlan, mockUserRequirements)

      expect(budget.breakdown.accommodation).toBe(1000) // 500 * 2 travelers
      expect(budget.breakdown.food).toBe(400) // 200 * 2 travelers
      expect(budget.min).toBeGreaterThan(0)
      expect(budget.max).toBeGreaterThan(budget.min)
    })
  })

  describe('RecommendationEngine', () => {
    it('should generate personalized recommendations', async () => {
      // Mock analysis results
      const mockAnalysisResults = [
        {
          locations: mockExtractedContent[0].locations.map(loc => ({
            name: loc.name,
            type: 'ATTRACTION' as const,
            coordinates: loc.coordinates,
            popularity_score: 90,
            mentioned_count: 1,
            related_activities: ['参观'],
            best_time_to_visit: '早上',
            estimated_duration: 120
          })),
          activities: mockExtractedContent[0].activities.map(act => ({
            name: act.name,
            category: 'CULTURE' as const,
            popularity_score: 85,
            mentioned_count: 1,
            estimated_cost: act.estimatedCost,
            duration: act.duration,
            difficulty_level: 'EASY' as const,
            tips: act.tips || []
          })),
          themes: ['文化', '历史'],
          quality_score: 88,
          recommendations: ['适合文化爱好者'],
          sentiment: {
            overall_sentiment: 'POSITIVE' as const,
            enthusiasm_level: 85,
            recommendation_strength: 90,
            concerns: [],
            highlights: ['历史悠久']
          },
          travel_insights: {
            destination_type: 'CULTURAL' as const,
            travel_style: ['文化'],
            budget_level: 'BUDGET' as const,
            target_audience: ['文化爱好者'],
            seasonal_preferences: ['春季'],
            duration_recommendation: {
              min_days: 3,
              max_days: 7,
              optimal_days: 5
            }
          }
        }
      ]

      // Mock Gemini responses for user preference analysis and recommendation description
      const { geminiService } = require('../GeminiService')
      geminiService.generateChatResponse
        .mockResolvedValueOnce('{"budget_range": "medium", "activity_types": ["sightseeing"], "travel_style": "cultural", "group_type": "couple", "interests": ["culture"]}')
        .mockResolvedValueOnce('这是一个精彩的文化体验推荐，非常适合喜欢历史和传统文化的游客。')
        .mockResolvedValueOnce('基于您对文化和历史的兴趣，我们推荐这些精选的体验项目。')

      const userPreferences = {
        budget_range: 'medium' as const,
        activity_types: ['culture'],
        travel_style: 'cultural' as const,
        group_type: 'couple' as const,
        interests: ['culture', 'history']
      }

      const result = await recommendationEngine.generateRecommendations(
        mockExtractedContent,
        mockUserRequirements,
        mockAnalysisResults,
        userPreferences
      )

      expect(result).toBeDefined()
      expect(result.recommendations).toBeDefined()
      expect(result.confidence_score).toBeGreaterThan(0)
      expect(result.reasoning).toBeDefined()
      expect(result.alternatives).toBeDefined()
    })

    it('should handle recommendation generation errors', async () => {
      const { geminiService } = require('../GeminiService')
      geminiService.generateChatResponse.mockRejectedValue(new Error('API Error'))

      await expect(recommendationEngine.generateRecommendations(
        mockExtractedContent,
        mockUserRequirements,
        [],
        undefined
      )).rejects.toThrow('推荐生成失败')
    })
  })

  describe('PromptTemplates', () => {
    it('should build travel plan prompt correctly', () => {
      const prompt = PromptTemplates.buildTravelPlanPrompt(
        mockExtractedContent,
        mockUserRequirements
      )

      expect(prompt).toContain('旅行计划')
      expect(prompt).toContain('5天')
      expect(prompt).toContain('2人')
      expect(prompt).toContain('浅草寺')
      expect(prompt).toContain('JSON')
    })

    it('should build content analysis prompt correctly', () => {
      const prompt = PromptTemplates.buildContentAnalysisPrompt(mockExtractedContent)

      expect(prompt).toContain('分析')
      expect(prompt).toContain('浅草寺')
      expect(prompt).toContain('JSON')
    })

    it('should build command parsing prompt correctly', () => {
      const mockPlan = {
        id: 'plan1',
        title: '东京5日游',
        destination: '东京',
        totalDays: 5,
        days: [],
        estimatedBudget: {
          min: 10000,
          max: 15000,
          breakdown: { accommodation: 5000, food: 3000, activities: 2000, transport: 1000 }
        },
        noteId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const prompt = PromptTemplates.buildCommandParsingPrompt(
        '把第三天的浅草寺移到第二天',
        mockPlan
      )

      expect(prompt).toContain('解析')
      expect(prompt).toContain('浅草寺')
      expect(prompt).toContain('东京')
      expect(prompt).toContain('JSON')
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete AI workflow', async () => {
      // Mock all Gemini responses for the complete workflow
      const mockAnalysisResponse = {
        response: {
          text: () => JSON.stringify({
            locations: [{ name: '浅草寺', type: 'ATTRACTION', popularity_score: 90, mentioned_count: 1, related_activities: [], estimated_duration: 120 }],
            activities: [{ name: '参观浅草寺', category: 'CULTURE', popularity_score: 85, mentioned_count: 1, tips: [] }],
            themes: ['文化'],
            quality_score: 88,
            recommendations: ['推荐'],
            sentiment: { overall_sentiment: 'POSITIVE', enthusiasm_level: 85, recommendation_strength: 90, concerns: [], highlights: [] },
            travel_insights: { destination_type: 'CULTURAL', travel_style: ['文化'], budget_level: 'BUDGET', target_audience: [], seasonal_preferences: [], duration_recommendation: { min_days: 3, max_days: 7, optimal_days: 5 } }
          })
        }
      }

      const mockPlanResponse = {
        response: {
          text: () => JSON.stringify({
            title: '东京5日游',
            destination: '东京',
            days: [{ dayNumber: 1, date: '2024-04-01', title: '第一天', theme: '文化', activities: [], dailySummary: { totalCost: 0, walkingDistance: 0, highlights: [] } }],
            estimatedBudget: { min: 10000, max: 15000, breakdown: { accommodation: 5000, food: 3000, activities: 2000, transport: 1000 } }
          })
        }
      }

      const { geminiService } = require('../GeminiService')
      geminiService.model.generateContent
        .mockResolvedValue(mockAnalysisResponse)
        .mockResolvedValue(mockPlanResponse)
      
      geminiService.generateChatResponse
        .mockResolvedValue('{"budget_range": "medium", "activity_types": ["culture"], "travel_style": "cultural", "group_type": "couple", "interests": ["culture"]}')
        .mockResolvedValue('精彩的推荐描述')
        .mockResolvedValue('推荐理由说明')

      // 1. Analyze content
      const analysisResult = await contentAnalyzer.analyzeContents(mockExtractedContent)
      expect(analysisResult.quality_score).toBe(88)

      // 2. Generate travel plan
      const travelPlan = await travelPlanGenerator.generateTravelPlan(
        mockExtractedContent,
        mockUserRequirements
      )
      expect(travelPlan.title).toBe('东京5日游')

      // 3. Generate recommendations
      const recommendations = await recommendationEngine.generateRecommendations(
        mockExtractedContent,
        mockUserRequirements,
        [analysisResult]
      )
      expect(recommendations.recommendations).toBeDefined()
    })

    it('should handle empty content gracefully', async () => {
      await expect(contentAnalyzer.analyzeContents([]))
        .rejects.toThrow('没有内容可供分析')

      await expect(travelPlanGenerator.generateTravelPlan([], mockUserRequirements))
        .rejects.toThrow('需要至少一个内容来源来生成旅行计划')
    })

    it('should validate user requirements', () => {
      const invalidRequirements = {
        duration: 0, // Invalid: should be >= 1
        travelers: 0, // Invalid: should be >= 1
        travelStyle: [],
        interests: []
      }

      // These validations would be handled by the API route schemas
      expect(invalidRequirements.duration).toBeLessThan(1)
      expect(invalidRequirements.travelers).toBeLessThan(1)
    })
  })
})
