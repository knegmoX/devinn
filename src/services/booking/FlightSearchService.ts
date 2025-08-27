import { 
  FlightSearchService, 
  FlightSearchParams, 
  FlightSearchResult, 
  FlightOption, 
  FlightRoute, 
  PriceHistory, 
  PriceAlert, 
  DeepLink 
} from '@/types';
import { logger } from '@/lib/logger';

/**
 * 航班搜索服务
 * 集成多个航班查询API，提供统一的搜索接口
 */
export class FlightSearchServiceImpl implements FlightSearchService {
  private readonly providers = [
    'amadeus',
    'skyscanner', 
    'ctrip',
    'qunar'
  ];

  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * 搜索航班
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    logger.info('Searching flights', { params });

    try {
      if (this.isDevelopment) {
        // 开发环境返回模拟数据
        return this.getMockFlightResults(params);
      }

      // 生产环境并行查询多个API
      const searchPromises = this.providers.map(provider => 
        this.searchFlightsFromProvider(provider, params)
      );

      const results = await Promise.allSettled(searchPromises);
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<FlightOption[]> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .flat();

      // 去重和排序
      const uniqueFlights = this.deduplicateFlights(successfulResults);
      const sortedFlights = this.sortFlightsByRelevance(uniqueFlights, params);

      return {
        flights: sortedFlights,
        searchId: this.generateSearchId(),
        totalResults: sortedFlights.length,
        searchParams: params,
        providers: this.providers,
        lastUpdated: new Date()
      };

    } catch (error) {
      logger.error('Flight search failed', { error, params });
      throw new Error('航班搜索失败，请稍后重试');
    }
  }

  /**
   * 获取航班详情
   */
  async getFlightDetails(flightId: string): Promise<FlightOption> {
    logger.info('Getting flight details', { flightId });

    if (this.isDevelopment) {
      return this.getMockFlightDetails(flightId);
    }

    // 实际实现中会调用具体的API
    throw new Error('Flight details not implemented yet');
  }

  /**
   * 获取价格历史
   */
  async getPriceHistory(route: FlightRoute): Promise<PriceHistory> {
    logger.info('Getting price history', { route });

    if (this.isDevelopment) {
      return this.getMockPriceHistory(route);
    }

    // 实际实现
    throw new Error('Price history not implemented yet');
  }

  /**
   * 创建价格提醒
   */
  async createPriceAlert(flightId: string, targetPrice: number): Promise<PriceAlert> {
    logger.info('Creating price alert', { flightId, targetPrice });

    // 实际实现中会保存到数据库
    const alert: PriceAlert = {
      id: this.generateId(),
      type: 'FLIGHT',
      itemId: flightId,
      userId: 'current-user', // 从认证上下文获取
      targetPrice,
      currentPrice: targetPrice * 1.1, // 模拟当前价格
      threshold: 10, // 10% 降价触发
      isActive: true,
      createdAt: new Date(),
      lastChecked: new Date(),
      notifications: []
    };

    return alert;
  }

  /**
   * 生成预订深度链接
   */
  async generateDeepLink(flightId: string, provider: string): Promise<DeepLink> {
    logger.info('Generating deep link', { flightId, provider });

    const baseUrls: Record<string, string> = {
      'ctrip': 'https://flights.ctrip.com',
      'qunar': 'https://flight.qunar.com',
      'amadeus': 'https://amadeus.com',
      'skyscanner': 'https://skyscanner.com'
    };

    const deepLink: DeepLink = {
      provider,
      url: `${baseUrls[provider] || baseUrls.ctrip}/booking/${flightId}`,
      parameters: {
        flightId,
        source: 'devinn',
        utm_campaign: 'flight_booking'
      },
      trackingId: this.generateTrackingId(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
    };

    return deepLink;
  }

  /**
   * 从特定提供商搜索航班
   */
  private async searchFlightsFromProvider(
    provider: string, 
    params: FlightSearchParams
  ): Promise<FlightOption[]> {
    // 这里会调用具体的API
    // 目前返回模拟数据
    return this.getMockFlightsFromProvider(provider, params);
  }

  /**
   * 航班去重
   */
  private deduplicateFlights(flights: FlightOption[]): FlightOption[] {
    const seen = new Set<string>();
    return flights.filter(flight => {
      const key = `${flight.flightNumber}-${flight.departure.date}-${flight.departure.time}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * 按相关性排序航班
   */
  private sortFlightsByRelevance(
    flights: FlightOption[], 
    params: FlightSearchParams
  ): FlightOption[] {
    return flights.sort((a, b) => {
      // 综合评分：价格 + 时长 + 评分
      const scoreA = this.calculateFlightScore(a);
      const scoreB = this.calculateFlightScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * 计算航班评分
   */
  private calculateFlightScore(flight: FlightOption): number {
    const priceScore = Math.max(0, 100 - (flight.price.amount / 100));
    const durationScore = Math.max(0, 100 - (flight.duration.total / 60));
    const ratingScore = flight.rating.score * 10;
    
    return (priceScore * 0.4) + (durationScore * 0.3) + (ratingScore * 0.3);
  }

  /**
   * 生成搜索ID
   */
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成通用ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * 生成跟踪ID
   */
  private generateTrackingId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取模拟航班搜索结果
   */
  private getMockFlightResults(params: FlightSearchParams): FlightSearchResult {
    const mockFlights: FlightOption[] = [
      {
        id: 'flight_1',
        type: 'OUTBOUND',
        airline: {
          code: 'CA',
          name: '中国国际航空',
          logo: '/images/airlines/ca.png'
        },
        flightNumber: 'CA1234',
        aircraft: 'Boeing 737-800',
        departure: {
          airport: {
            code: params.origin,
            name: '上海浦东国际机场',
            terminal: 'T2'
          },
          time: '08:30',
          date: params.departureDate
        },
        arrival: {
          airport: {
            code: params.destination,
            name: '北京首都国际机场',
            terminal: 'T3'
          },
          time: '11:00',
          date: params.departureDate
        },
        duration: {
          total: 150,
          formatted: '2小时30分钟'
        },
        stops: [],
        price: {
          amount: 1280,
          currency: 'CNY',
          pricePerPerson: 1280,
          totalPrice: 1280 * params.passengers.adults,
          taxes: 120
        },
        cabin: {
          class: params.cabinClass,
          name: '经济舱',
          baggage: {
            checkedBags: '23kg',
            carryOn: '7kg'
          }
        },
        booking: {
          url: 'https://www.airchina.com.cn',
          provider: 'ctrip',
          availability: 9,
          refundable: true,
          changeable: true
        },
        rating: {
          score: 8.2,
          punctuality: 8.5,
          comfort: 7.8,
          service: 8.0
        }
      },
      {
        id: 'flight_2',
        type: 'OUTBOUND',
        airline: {
          code: 'MU',
          name: '中国东方航空',
          logo: '/images/airlines/mu.png'
        },
        flightNumber: 'MU5678',
        aircraft: 'Airbus A320',
        departure: {
          airport: {
            code: params.origin,
            name: '上海浦东国际机场',
            terminal: 'T1'
          },
          time: '14:20',
          date: params.departureDate
        },
        arrival: {
          airport: {
            code: params.destination,
            name: '北京首都国际机场',
            terminal: 'T2'
          },
          time: '16:55',
          date: params.departureDate
        },
        duration: {
          total: 155,
          formatted: '2小时35分钟'
        },
        stops: [],
        price: {
          amount: 1150,
          currency: 'CNY',
          pricePerPerson: 1150,
          totalPrice: 1150 * params.passengers.adults,
          taxes: 110
        },
        cabin: {
          class: params.cabinClass,
          name: '经济舱',
          baggage: {
            checkedBags: '23kg',
            carryOn: '7kg'
          }
        },
        booking: {
          url: 'https://www.ceair.com',
          provider: 'qunar',
          availability: 15,
          refundable: false,
          changeable: true
        },
        rating: {
          score: 7.9,
          punctuality: 8.1,
          comfort: 7.5,
          service: 8.2
        }
      }
    ];

    return {
      flights: mockFlights,
      searchId: this.generateSearchId(),
      totalResults: mockFlights.length,
      searchParams: params,
      providers: this.providers,
      lastUpdated: new Date()
    };
  }

  /**
   * 获取模拟航班详情
   */
  private getMockFlightDetails(flightId: string): FlightOption {
    // 返回第一个模拟航班的详情
    const mockParams: FlightSearchParams = {
      origin: 'SHA',
      destination: 'BJS',
      departureDate: '2025-09-01',
      passengers: { adults: 1, children: 0, infants: 0 },
      cabinClass: 'ECONOMY',
      tripType: 'ONE_WAY'
    };
    
    return this.getMockFlightResults(mockParams).flights[0];
  }

  /**
   * 获取模拟价格历史
   */
  private getMockPriceHistory(route: FlightRoute): PriceHistory {
    const pricePoints = [];
    const basePrice = 1200;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 200;
      const price = Math.max(800, basePrice + variation);
      
      pricePoints.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        provider: 'ctrip'
      });
    }

    return {
      itemId: `${route.origin}-${route.destination}`,
      itemType: 'FLIGHT',
      pricePoints,
      trend: 'STABLE',
      recommendation: 'MONITOR',
      confidence: 0.75
    };
  }

  /**
   * 从特定提供商获取模拟航班
   */
  private getMockFlightsFromProvider(
    provider: string, 
    params: FlightSearchParams
  ): FlightOption[] {
    // 根据提供商返回不同的模拟数据
    const baseFlights = this.getMockFlightResults(params).flights;
    
    return baseFlights.map(flight => ({
      ...flight,
      booking: {
        ...flight.booking,
        provider
      }
    }));
  }
}

// 导出单例实例
export const flightSearchService = new FlightSearchServiceImpl();
