import { BaseExtractor } from './BaseExtractor'
import { PuppeteerService } from '../PuppeteerService'
import { logger } from '@/lib/logger'
import type { ExtractedContent, Platform, ActivityType } from '@/types'

// 定义本地类型
type Location = {
  name: string;
  address?: string;
  coordinates?: [number, number];
  type: ActivityType;
}

type Activity = {
  name: string;
  description: string;
  category: string;
  estimatedCost?: number;
  duration?: number;
  tips?: string[];
}

type MediaItem = {
  type: 'IMAGE' | 'VIDEO';
  url: string;
  caption?: string;
  timestamp?: number;
}

export class MafengwoExtractor extends BaseExtractor {
  platform: Platform = 'MAFENGWO'
  private puppeteerService: PuppeteerService

  constructor() {
    super()
    this.puppeteerService = new PuppeteerService()
  }

  async extract(url: string): Promise<ExtractedContent> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid Mafengwo URL provided')
    }

    logger.info('开始提取马蜂窝内容', { url })

    try {
      // 在开发环境使用模拟数据，生产环境使用真实提取
      if (process.env.NODE_ENV === 'development') {
        logger.info('开发环境：使用模拟数据')
        return this.getMockContent()
      }

      const content = await this.extractFromMafengwo(url)
      logger.info('马蜂窝内容提取成功', { title: content.title })
      return content
    } catch (error) {
      logger.error('马蜂窝内容提取失败', { error, url })
      throw new Error(`马蜂窝内容提取失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private async extractFromMafengwo(url: string): Promise<ExtractedContent> {
    const page = await this.puppeteerService.createPage()
    
    try {
      // 导航到马蜂窝页面
      await this.puppeteerService.navigateToPage(page, url)
      
      // 等待页面加载
      await page.waitForSelector('.title, .article-title, h1', { timeout: 10000 })
      
      // 提取基本信息
      const title = await this.extractTitle(page)
      const description = await this.extractDescription(page)
      const author = await this.extractAuthor(page)
      const stats = await this.extractStats(page)
      
      // 提取媒体信息
      const media = await this.extractMedia(page)
      
      // 提取地理位置信息
      const locations = await this.extractLocations(page, title, description)
      
      // 提取活动信息
      const activities = await this.extractActivities(page, title, description)
      
      // 提取标签
      const tags = await this.extractTags(page, title, description)

      return {
        title,
        description,
        platform: 'MAFENGWO',
        locations,
        activities,
        media,
        tags,
        author,
        stats
      }
    } finally {
      await page.close()
    }
  }

  private async extractTitle(page: any): Promise<string> {
    try {
      const titleSelectors = [
        '.title',
        '.article-title',
        '.post-title',
        'h1',
        '.travel-title'
      ]

      for (const selector of titleSelectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            const title = await page.evaluate((el: any) => el.textContent?.trim(), element)
            if (title && title.length > 0) {
              return title
            }
          }
        } catch (error) {
          continue
        }
      }

      return '马蜂窝游记'
    } catch (error) {
      logger.warn('提取标题失败', { error })
      return '马蜂窝游记'
    }
  }

  private async extractDescription(page: any): Promise<string> {
    try {
      const descSelectors = [
        '.summary',
        '.article-summary',
        '.post-summary',
        '.description',
        '.content p:first-of-type'
      ]

      for (const selector of descSelectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            const desc = await page.evaluate((el: any) => el.textContent?.trim(), element)
            if (desc && desc.length > 0) {
              return desc
            }
          }
        } catch (error) {
          continue
        }
      }

      // 如果没有找到摘要，尝试提取正文前几句
      try {
        const contentText = await page.evaluate(() => {
          const contentSelectors = ['.content', '.article-content', '.post-content']
          for (const selector of contentSelectors) {
            const element = document.querySelector(selector)
            if (element) {
              const text = element.textContent?.trim()
              if (text && text.length > 50) {
                return text.substring(0, 200) + '...'
              }
            }
          }
          return ''
        })
        
        if (contentText) {
          return contentText
        }
      } catch (error) {
        // 忽略错误
      }

      return ''
    } catch (error) {
      logger.warn('提取描述失败', { error })
      return ''
    }
  }

  private async extractAuthor(page: any): Promise<{ name: string; avatar?: string }> {
    try {
      const authorName = await page.evaluate(() => {
        const selectors = [
          '.author-name',
          '.user-name',
          '.nickname',
          '.author .name',
          '.post-author'
        ]
        
        for (const selector of selectors) {
          const element = document.querySelector(selector)
          if (element?.textContent?.trim()) {
            return element.textContent.trim()
          }
        }
        return '马蜂窝用户'
      })

      const authorAvatar = await page.evaluate(() => {
        const selectors = [
          '.author-avatar img',
          '.user-avatar img',
          '.author img',
          '.post-author img'
        ]
        
        for (const selector of selectors) {
          const element = document.querySelector(selector)
          if (element && element.tagName === 'IMG') {
            return (element as HTMLImageElement).src
          }
        }
        return undefined
      })

      return {
        name: authorName,
        avatar: authorAvatar
      }
    } catch (error) {
      logger.warn('提取作者信息失败', { error })
      return { name: '马蜂窝用户' }
    }
  }

  private async extractStats(page: any): Promise<{ likes: number; comments: number; shares: number }> {
    try {
      const stats = await page.evaluate(() => {
        const extractNumber = (text: string): number => {
          if (!text) return 0
          const match = text.match(/[\d.]+/)
          if (!match) return 0
          const num = parseFloat(match[0])
          if (text.includes('万')) return Math.floor(num * 10000)
          if (text.includes('k') || text.includes('K')) return Math.floor(num * 1000)
          return Math.floor(num)
        }

        const likeElement = document.querySelector('.like-count, .praise-count, .zan-count')
        const commentElement = document.querySelector('.comment-count, .reply-count')
        const shareElement = document.querySelector('.share-count, .forward-count')

        return {
          likes: likeElement ? extractNumber(likeElement.textContent || '') : 0,
          comments: commentElement ? extractNumber(commentElement.textContent || '') : 0,
          shares: shareElement ? extractNumber(shareElement.textContent || '') : 0
        }
      })

      return {
        likes: stats.likes || 0,
        comments: stats.comments || 0,
        shares: stats.shares || 0
      }
    } catch (error) {
      logger.warn('提取统计数据失败', { error })
      return {
        likes: 0,
        comments: 0,
        shares: 0
      }
    }
  }

  private async extractMedia(page: any): Promise<MediaItem[]> {
    try {
      const media: MediaItem[] = []

      // 提取图片
      const images = await page.evaluate(() => {
        const imageSelectors = [
          '.content img',
          '.article-content img',
          '.post-content img',
          '.photo-list img'
        ]
        
        const imageUrls: string[] = []
        imageSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach(element => {
            if (element.tagName === 'IMG') {
              const src = (element as HTMLImageElement).src
              if (src && !imageUrls.includes(src)) {
                imageUrls.push(src)
              }
            }
          })
        })
        
        return imageUrls.slice(0, 10) // 限制图片数量
      })

      images.forEach((url: string, index: number) => {
        media.push({
          type: 'IMAGE',
          url,
          caption: `马蜂窝游记图片 ${index + 1}`
        })
      })

      return media
    } catch (error) {
      logger.warn('提取媒体信息失败', { error })
      return []
    }
  }

  private async extractLocations(_page: any, title: string, description: string): Promise<Location[]> {
    try {
      const locations: Location[] = []
      const text = title + ' ' + description

      // 从标题和描述中提取地理位置关键词
      const locationKeywords = this.extractLocationKeywords(text)
      
      locationKeywords.forEach((keyword) => {
        locations.push({
          name: keyword,
          address: '',
          coordinates: [0, 0], // 实际应用中需要调用地理编码API
          type: 'ATTRACTION'
        })
      })

      return locations
    } catch (error) {
      logger.warn('提取位置信息失败', { error })
      return []
    }
  }

  private async extractActivities(_page: any, title: string, description: string): Promise<Activity[]> {
    try {
      const activities: Activity[] = []
      const text = title + ' ' + description

      // 从标题和描述中提取活动关键词
      const activityKeywords = this.extractActivityKeywords(text)
      
      activityKeywords.forEach(keyword => {
        activities.push({
          name: keyword,
          description: `马蜂窝游记中推荐的${keyword}体验`,
          category: '旅行体验',
          estimatedCost: 0,
          duration: 60,
          tips: ['参考马蜂窝游记详情']
        })
      })

      return activities
    } catch (error) {
      logger.warn('提取活动信息失败', { error })
      return []
    }
  }

  private async extractTags(page: any, title: string, description: string): Promise<string[]> {
    try {
      const tags: string[] = []

      // 从页面提取标签
      const pageTags = await page.evaluate(() => {
        const tagSelectors = [
          '.tag',
          '.tags .item',
          '.label',
          '.keyword'
        ]
        
        const tagTexts: string[] = []
        tagSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach(element => {
            const text = element.textContent?.trim()
            if (text && !tagTexts.includes(text)) {
              tagTexts.push(text)
            }
          })
        })
        
        return tagTexts
      })

      tags.push(...pageTags)

      // 从标题和描述中提取关键词
      const textKeywords = this.extractKeywords(title + ' ' + description)
      textKeywords.forEach(keyword => {
        if (!tags.includes(keyword)) {
          tags.push(keyword)
        }
      })

      return tags.slice(0, 10) // 限制标签数量
    } catch (error) {
      logger.warn('提取标签失败', { error })
      return []
    }
  }

  private extractLocationKeywords(text: string): string[] {
    const locationPatterns = [
      /([北上广深]\w*|[京沪津渝]\w*)/g,
      /(\w*[市县区]\w*)/g,
      /(\w*[山湖海岛]\w*)/g,
      /(东京|大阪|京都|首尔|曼谷|新加坡|巴黎|伦敦|纽约|台北|香港|澳门)/g,
      /(\w*[寺庙神社教堂]\w*)/g,
      /(\w*[公园广场]\w*)/g
    ]

    const locations: string[] = []
    locationPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        locations.push(...matches)
      }
    })

    return [...new Set(locations)].slice(0, 8)
  }

  private extractActivityKeywords(text: string): string[] {
    const activityPatterns = [
      /(打卡|拍照|游览|体验|品尝|购物|观光|参观|漫步)/g,
      /(美食|景点|博物馆|公园|寺庙|神社|教堂|古迹)/g,
      /(温泉|滑雪|登山|海滩|潜水|徒步|骑行)/g,
      /(购物|美食|文化|历史|自然|艺术)/g
    ]

    const activities: string[] = []
    activityPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        activities.push(...matches)
      }
    })

    return [...new Set(activities)].slice(0, 5)
  }

  private extractKeywords(text: string): string[] {
    const keywords = text.match(/[\u4e00-\u9fa5]{2,}/g) || []
    return [...new Set(keywords)].slice(0, 8)
  }

  private getMockContent(): ExtractedContent {
    return {
      title: '东京5日深度游攻略：从传统到现代的完美体验',
      description: '详细的东京5日游攻略，包含交通、住宿、美食、景点推荐，适合第一次去东京的朋友。',
      platform: 'MAFENGWO',
      
      locations: [
        {
          name: '明治神宫',
          address: '东京都涩谷区代代木神园町1-1',
          coordinates: [35.6762, 139.6993],
          type: 'ATTRACTION'
        },
        {
          name: '上野公园',
          address: '东京都台东区上野公园',
          coordinates: [35.7141, 139.7744],
          type: 'ATTRACTION'
        },
        {
          name: '新宿御苑',
          address: '东京都新宿区内藤町11',
          coordinates: [35.6851, 139.7101],
          type: 'ATTRACTION'
        }
      ],
      
      activities: [
        {
          name: '明治神宫参拜',
          description: '体验日本神道文化，在都市中心感受宁静',
          category: '文化体验',
          estimatedCost: 0,
          duration: 90,
          tips: ['免费参观', '早上人较少', '可以写绘马许愿']
        },
        {
          name: '上野公园樱花季',
          description: '春季赏樱的绝佳地点，也有多个博物馆',
          category: '自然风光',
          estimatedCost: 1000,
          duration: 180,
          tips: ['春季樱花盛开', '有东京国立博物馆', '可以野餐']
        },
        {
          name: '新宿御苑漫步',
          description: '日式、英式、法式庭园的完美结合',
          category: '自然风光',
          estimatedCost: 500,
          duration: 120,
          tips: ['门票500日元', '四季都有不同美景', '禁止饮酒']
        }
      ],
      
      media: [
        {
          type: 'IMAGE',
          url: 'https://example.com/mafengwo-image-1.jpg',
          caption: '明治神宫鸟居'
        },
        {
          type: 'IMAGE',
          url: 'https://example.com/mafengwo-image-2.jpg',
          caption: '上野公园樱花'
        },
        {
          type: 'IMAGE',
          url: 'https://example.com/mafengwo-image-3.jpg',
          caption: '新宿御苑日式庭园'
        }
      ],
      
      tags: ['东京攻略', '深度游', '文化体验', '自然风光', '神社', '公园'],
      
      author: {
        name: '资深旅行家老张',
        avatar: 'https://example.com/mafengwo-avatar.jpg'
      },
      
      stats: {
        likes: 3420,
        comments: 156,
        shares: 289
      }
    }
  }

  async checkStatus(): Promise<boolean> {
    try {
      // 简单的健康检查：尝试创建和关闭一个页面
      const page = await this.puppeteerService.createPage()
      await page.close()
      return true
    } catch (error) {
      logger.error('马蜂窝提取器健康检查失败', { error })
      return false
    }
  }
}
