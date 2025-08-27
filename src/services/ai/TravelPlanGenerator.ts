import { geminiService } from './GeminiService'
import { contentAnalyzer, type AnalysisResult } from './ContentAnalyzer'
import PromptTemplates from './PromptTemplates'
import { logger } from '@/lib/logger'
import { retry, getErrorMessage } from '@/lib/utils'
import type { 
  ExtractedContent, 
  UserRequirements, 
  TravelPlan, 
  TravelDay,
  TravelActivity,
  FlightOption,
  HotelOption
} from '@/types'

/**
 * 旅行计划生成器
 * 基于提取的内容和用户需求，生成个性化的旅行计划
 */
export class TravelPlanGenerator {
  /**
   * 生成完整的旅行计划
   */
  async generateTravelPlan(
    extractedContents: ExtractedContent[],
    requirements: UserRequirements
  ): Promise<TravelPlan> {
    if (!extractedContents || extractedContents.length === 0) {
      throw new Error('需要至少一个内容来源来生成旅行计划')
    }

    logger.info('开始生成旅行计划', {
      contentCount: extractedContents.length,
      duration: requirements.duration,
      travelers: requirements.travelers
    })

    try {
      // 1. 分析内容获取洞察
      const analysisResult = await contentAnalyzer.analyzeContents(extractedContents)
      
      // 2. 增强用户需求
      const enhancedRequirements = this.enhanceRequirements(requirements, analysisResult)
      
      // 3. 生成基础旅行计划
      const basePlan = await this.generateBasePlan(extractedContents, enhancedRequirements)
      
      // 4. 优化和完善计划
      const optimizedPlan = await this.optimizePlan(basePlan, analysisResult)
      
      // 5. 添加航班和酒店建议
      const finalPlan = await this.addFlightAndHotelSuggestions(optimizedPlan, enhancedRequirements)
      
      logger.info('旅行计划生成完成', {
        planTitle: finalPlan.title,
        totalDays: finalPlan.totalDays,
        totalActivities: finalPlan.days.reduce((sum, day) => sum + day.activities.length, 0)
      })
      
      return finalPlan
    } catch (error) {
      logger.error('旅行计划生成失败', { error })
      throw new Error(`旅行计划生成失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * 调整现有旅行计划
   */
  async adjustTravelPlan(
    currentPlan: TravelPlan,
    instruction: string
  ): Promise<TravelPlan> {
    logger.info('开始调整旅行计划', { 
      planId: currentPlan.id,
      instruction: instruction.substring(0, 100) + '...'
    })

    try {
      const prompt = PromptTemplates.buildAdjustmentPrompt(currentPlan, instruction)
      
      const result = await retry(async () => {
        const response = await geminiService['model'].generateContent(prompt)
        const text = response.response.text()
        return this.parseAndValidatePlan(text, {
          duration: currentPlan.totalDays,
          travelers: 2, // 从现有计划中推断
          travelStyle: [],
          interests: [],
          freeText: instruction
        })
      }, 3, 2000)

      // 保持原有的ID和时间戳
      result.id = currentPlan.id
      result.noteId = currentPlan.noteId
      result.createdAt = currentPlan.createdAt
      result.updatedAt = new Date()

      logger.info('旅行计划调整完成', { planId: result.id })
      return result
    } catch (error) {
      logger.error('旅行计划调整失败', { error, planId: currentPlan.id })
      throw new Error(`旅行计划调整失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * 生成每日计划详情
   */
  async generateDayPlan(
    dayNumber: number,
    theme: string,
    availableLocations: string[],
    availableActivities: string[],
    requirements: UserRequirements
  ): Promise<TravelDay> {
    const prompt = this.buildDayPlanPrompt(
      dayNumber, 
      theme, 
      availableLocations, 
      availableActivities, 
      requirements
    )

    try {
      const response = await geminiService['model'].generateContent(prompt)
      const dayPlan = JSON.parse(response.response.text())
      
      return this.validateDayPlan(dayPlan)
    } catch (error) {
      logger.error('每日计划生成失败', { error, dayNumber })
      throw new Error(`第${dayNumber}天计划生成失败: ${getErrorMessage(error)}`)
    }
  }

  /**
   * 优化行程路线
   */
  async optimizeRoute(
    activities: TravelActivity[],
    startLocation?: [number, number]
  ): Promise<TravelActivity[]> {
    if (activities.length <= 1) return activities

    try {
      // 基于地理位置优化活动顺序
      const optimizedActivities = this.optimizeActivitiesByLocation(activities, startLocation)
      
      // 调整时间安排
      const timeOptimizedActivities = this.optimizeTimeSchedule(optimizedActivities)
      
      return timeOptimizedActivities
    } catch (error) {
      logger.error('路线优化失败', { error })
      return activities // 返回原始活动列表
    }
  }

  /**
   * 估算旅行预算
   */
  estimateBudget(
    plan: TravelPlan,
    _requirements: UserRequirements
  ): TravelPlan['estimatedBudget'] {
    const travelers = _requirements.travelers
    let totalAccommodation = 0
    let totalFood = 0
    let totalActivities = 0
    let totalTransport = 0

    plan.days.forEach(day => {
      day.activities.forEach(activity => {
        const cost = activity.estimatedCost * travelers
        
        switch (activity.type) {
          case 'HOTEL':
            totalAccommodation += cost
            break
          case 'RESTAURANT':
            totalFood += cost
            break
          case 'TRANSPORT':
            totalTransport += cost
            break
          default:
            totalActivities += cost
        }
      })
    })

    // 添加额外费用估算
    const miscellaneousMultiplier = 1.2 // 20% 额外费用
    
    return {
      min: Math.round((totalAccommodation + totalFood + totalActivities + totalTransport) * 0.8),
      max: Math.round((totalAccommodation + totalFood + totalActivities + totalTransport) * miscellaneousMultiplier),
      breakdown: {
        accommodation: totalAccommodation,
        food: totalFood,
        activities: totalActivities,
        transport: totalTransport
      }
    }
  }

  /**
   * 增强用户需求
   */
  private enhanceRequirements(
    requirements: UserRequirements,
    analysisResult: AnalysisResult
  ): UserRequirements {
    const enhanced = { ...requirements }

    // 基于分析结果补充旅行风格
    if (enhanced.travelStyle.length === 0) {
      enhanced.travelStyle = analysisResult.travel_insights.travel_style.slice(0, 2)
    }

    // 基于分析结果补充兴趣偏好
    if (enhanced.interests.length === 0) {
      enhanced.interests = analysisResult.themes.slice(0, 3)
    }

    return enhanced
  }

  /**
   * 生成基础旅行计划
   */
  private async generateBasePlan(
    extractedContents: ExtractedContent[],
    requirements: UserRequirements
  ): Promise<TravelPlan> {
    const prompt = PromptTemplates.buildTravelPlanPrompt(extractedContents, requirements)
    
    const result = await retry(async () => {
      const response = await geminiService['model'].generateContent(prompt)
      const text = response.response.text()
      return this.parseAndValidatePlan(text, requirements)
    }, 3, 2000)

    return result
  }

  /**
   * 优化旅行计划
   */
  private async optimizePlan(
    basePlan: TravelPlan,
    _analysisResult: AnalysisResult
  ): Promise<TravelPlan> {
    const optimizedPlan = { ...basePlan }

    // 优化每日活动安排
    optimizedPlan.days = await Promise.all(
      basePlan.days.map(async (day) => {
        const optimizedActivities = await this.optimizeRoute(day.activities)
        return {
          ...day,
          activities: optimizedActivities,
          dailySummary: {
            ...day.dailySummary,
            totalCost: optimizedActivities.reduce((sum, act) => sum + act.estimatedCost, 0)
          }
        }
      })
    )

    // 重新计算预算
    optimizedPlan.estimatedBudget = this.estimateBudget(optimizedPlan, {
      duration: basePlan.totalDays,
      travelers: 2, // 默认值，应该从需求中获取
      travelStyle: [],
      interests: []
    })

    return optimizedPlan
  }

  /**
   * 添加航班和酒店建议
   */
  private async addFlightAndHotelSuggestions(
    plan: TravelPlan,
    requirements: UserRequirements
  ): Promise<TravelPlan> {
    const enhancedPlan = { ...plan }

    try {
      // 生成航班建议
      enhancedPlan.flights = await this.generateFlightSuggestions(plan, requirements)
      
      // 生成酒店建议
      enhancedPlan.hotels = await this.generateHotelSuggestions(plan, requirements)
    } catch (error) {
      logger.warn('添加航班酒店建议失败', { error })
      // 继续返回计划，即使没有航班酒店建议
    }

    return enhancedPlan
  }

  /**
   * 生成航班建议
   */
  private async generateFlightSuggestions(
    plan: TravelPlan,
    requirements: UserRequirements
  ): Promise<FlightOption[]> {
    // 这里应该调用真实的航班搜索API
    // 目前返回模拟数据
    return [
      {
        id: 'flight-1',
        type: 'OUTBOUND',
        airline: {
          code: 'CA',
          name: '中国国际航空',
          logo: 'https://example.com/ca-logo.png'
        },
        flightNumber: 'CA123',
        aircraft: 'A320',
        departure: {
          airport: { code: 'PEK', name: '北京首都国际机场', terminal: 'T3' },
          time: '08:00',
          date: plan.days[0]?.date || '2024-01-01'
        },
        arrival: {
          airport: { code: 'NRT', name: '东京成田国际机场', terminal: 'T1' },
          time: '12:00',
          date: plan.days[0]?.date || '2024-01-01'
        },
        duration: { total: 240, formatted: '4小时' },
        stops: [],
        price: {
          amount: 2500,
          currency: 'CNY',
          pricePerPerson: 2500,
          totalPrice: 2500 * requirements.travelers,
          taxes: 300
        },
        cabin: {
          class: 'ECONOMY',
          name: '经济舱',
          baggage: { checkedBags: '23kg', carryOn: '7kg' }
        },
        booking: {
          url: 'https://example.com/book-flight',
          provider: '携程',
          availability: 20,
          refundable: true,
          changeable: true
        },
        rating: {
          score: 4.2,
          punctuality: 85,
          comfort: 80,
          service: 82
        }
      }
    ]
  }

  /**
   * 生成酒店建议
   */
  private async generateHotelSuggestions(
    plan: TravelPlan,
    _requirements: UserRequirements
  ): Promise<HotelOption[]> {
    // 这里应该调用真实的酒店搜索API
    // 目前返回模拟数据
    return [
      {
        id: 'hotel-1',
        name: '东京皇宫酒店',
        brand: '皇宫酒店集团',
        category: '豪华酒店',
        starRating: 5,
        location: {
          address: '东京都千代田区丸之内1-1-1',
          district: '丸之内',
          coordinates: [35.6762, 139.7653],
          nearbyLandmarks: [
            { name: '东京站', distance: 500, walkingTime: 6 },
            { name: '皇居', distance: 800, walkingTime: 10 }
          ],
          transportation: [
            { type: 'SUBWAY', station: '东京站', distance: 500, lines: ['JR山手线', 'JR中央线'] }
          ]
        },
        rooms: [
          {
            type: '豪华双人房',
            size: 35,
            bedType: '大床',
            maxOccupancy: 2,
            amenities: ['免费WiFi', '空调', '迷你吧', '保险箱'],
            pricing: {
              basePrice: 1200,
              totalPrice: 1200 * plan.totalDays,
              currency: 'CNY',
              taxes: 120,
              fees: 50,
              priceHistory: [
                { date: '2024-01-01', price: 1200 },
                { date: '2024-01-02', price: 1180 }
              ]
            }
          }
        ],
        amenities: {
          general: ['免费WiFi', '24小时前台', '行李寄存'],
          dining: ['餐厅', '酒吧', '客房服务'],
          recreation: ['健身房', 'SPA', '游泳池'],
          business: ['商务中心', '会议室']
        },
        reviews: {
          overall: 4.5,
          breakdown: {
            cleanliness: 4.6,
            comfort: 4.4,
            location: 4.8,
            service: 4.3,
            value: 4.1
          },
          totalReviews: 1250,
          recentReviews: [
            {
              rating: 5,
              comment: '位置绝佳，服务一流',
              date: '2024-01-15',
              travelerType: '商务出行'
            },
            {
              rating: 4,
              comment: '房间舒适，早餐丰富',
              date: '2024-01-10',
              travelerType: '家庭出游'
            }
          ]
        },
        policies: {
          checkIn: '15:00',
          checkOut: '11:00',
          cancellation: {
            type: 'FREE',
            deadline: '入住前24小时',
            fee: 0
          },
          children: '12岁以下儿童免费',
          pets: false
        },
        booking: {
          url: 'https://example.com/book-hotel',
          provider: 'Booking.com',
          availability: 'AVAILABLE',
          lastBooked: '2小时前'
        },
        images: [
          {
            url: 'https://example.com/hotel-exterior.jpg',
            caption: '酒店外观',
            type: 'EXTERIOR'
          }
        ]
      }
    ]
  }

  /**
   * 解析和验证计划
   */
  private parseAndValidatePlan(planText: string, requirements: UserRequirements): TravelPlan {
    try {
      // 清理可能的markdown格式
      const cleanText = planText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const rawPlan = JSON.parse(cleanText)
      
      // 验证必要字段
      if (!rawPlan.title || !rawPlan.destination || !rawPlan.days) {
        throw new Error('生成的旅行计划格式不正确')
      }

      // 构建标准化的计划对象
      const plan: TravelPlan = {
        id: '', // 将由调用者设置
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
            id: `activity-${index}-${actIndex}`,
            order: actIndex + 1
          }))
        })),
        flights: rawPlan.flights || [],
        hotels: rawPlan.hotels || [],
        noteId: '', // 将由调用者设置
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return plan
    } catch (error) {
      logger.error('解析旅行计划失败', { error, planText: planText.substring(0, 500) })
      throw new Error('AI生成的旅行计划格式错误')
    }
  }

  /**
   * 构建每日计划提示
   */
  private buildDayPlanPrompt(
    dayNumber: number,
    theme: string,
    availableLocations: string[],
    availableActivities: string[],
    _requirements: UserRequirements
  ): string {
    return `请为第${dayNumber}天生成详细的旅行计划：

主题：${theme}
可用地点：${availableLocations.join(', ')}
可用活动：${availableActivities.join(', ')}
旅行人数：${_requirements.travelers}人
预算考虑：${_requirements.budget ? `${_requirements.budget}元` : '灵活'}

请返回JSON格式的每日计划，包含时间安排、活动详情、预算估算等。`
  }

  /**
   * 验证每日计划
   */
  private validateDayPlan(dayPlan: any): TravelDay {
    return {
      dayNumber: dayPlan.dayNumber || 1,
      date: dayPlan.date || new Date().toISOString().split('T')[0],
      title: dayPlan.title || '旅行日',
      theme: dayPlan.theme || '探索',
      weather: dayPlan.weather,
      activities: dayPlan.activities || [],
      dailySummary: dayPlan.dailySummary || {
        totalCost: 0,
        walkingDistance: 0,
        highlights: []
      }
    }
  }

  /**
   * 基于地理位置优化活动顺序
   */
  private optimizeActivitiesByLocation(
    activities: TravelActivity[],
    startLocation?: [number, number]
  ): TravelActivity[] {
    if (activities.length <= 1) return activities

    // 简单的最近邻算法优化路线
    const optimized: TravelActivity[] = []
    const remaining = [...activities]
    
    // 选择起始点
    let currentLocation = startLocation || activities[0].location.coordinates
    
    while (remaining.length > 0) {
      let nearestIndex = 0
      let nearestDistance = this.calculateDistance(
        currentLocation,
        remaining[0].location.coordinates
      )
      
      // 找到最近的活动
      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(
          currentLocation,
          remaining[i].location.coordinates
        )
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }
      
      // 添加最近的活动到优化列表
      const nearestActivity = remaining.splice(nearestIndex, 1)[0]
      optimized.push(nearestActivity)
      currentLocation = nearestActivity.location.coordinates
    }
    
    return optimized
  }

  /**
   * 优化时间安排
   */
  private optimizeTimeSchedule(activities: TravelActivity[]): TravelActivity[] {
    let currentTime = 9 * 60 // 9:00 AM in minutes
    
    return activities.map((activity, index) => {
      const startTime = this.minutesToTimeString(currentTime)
      const duration = this.estimateActivityDuration(activity.type)
      const endTime = this.minutesToTimeString(currentTime + duration)
      
      currentTime += duration + 30 // 加30分钟缓冲时间
      
      return {
        ...activity,
        order: index + 1,
        startTime,
        endTime
      }
    })
  }

  /**
   * 计算两点间距离（简化版）
   */
  private calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const [lat1, lon1] = point1
    const [lat2, lon2] = point2
    
    // 简化的距离计算（实际应使用Haversine公式）
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2))
  }

  /**
   * 估算活动持续时间
   */
  private estimateActivityDuration(type: string): number {
    switch (type) {
      case 'ATTRACTION': return 180 // 3小时
      case 'RESTAURANT': return 90  // 1.5小时
      case 'HOTEL': return 60       // 1小时
      case 'TRANSPORT': return 30   // 30分钟
      case 'ACTIVITY': return 120   // 2小时
      default: return 120           // 默认2小时
    }
  }

  /**
   * 分钟转时间字符串
   */
  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }
}

// 单例实例
export const travelPlanGenerator = new TravelPlanGenerator()
