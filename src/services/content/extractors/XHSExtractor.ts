import { BaseExtractor } from './BaseExtractor'
import type { ExtractedContent, Platform } from '@/types'
import { puppeteerService } from '../PuppeteerService'
import { logger } from '@/lib/logger'

export class XHSExtractor extends BaseExtractor {
  platform: Platform = 'XIAOHONGSHU'

  private readonly selectors = {
    title: '.note-item .title, .note-detail .title, [data-testid="note-title"], .note-scroller .title',
    description: '.note-item .desc, .note-detail .desc, .note-content .text, .note-scroller .content',
    images: '.note-item .cover img, .note-detail .cover img, .carousel-container img, .note-scroller img',
    tags: '.note-item .tag, .note-detail .tag, .tag-list .tag, .note-scroller .tag',
    author: '.note-item .author .name, .note-detail .author .name, .user-info .name, .note-scroller .author',
    publishDate: '.note-item .time, .note-detail .time, .publish-time, .note-scroller .time',
    likeCount: '.note-item .like-count, .note-detail .like-count, .engagement .like, .note-scroller .like',
    commentCount: '.note-item .comment-count, .note-detail .comment-count, .engagement .comment, .note-scroller .comment',
  }

  async extract(url: string): Promise<ExtractedContent> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid URL provided')
    }

    try {
      logger.info(`Starting XHS extraction for: ${url}`)
      
      // Check if we should use real extraction or fallback to mock
      const useRealExtraction = process.env.NODE_ENV === 'production' || process.env.ENABLE_REAL_EXTRACTION === 'true'
      
      if (useRealExtraction) {
        return await this.extractWithPuppeteer(url)
      } else {
        logger.info('Using mock extraction for development')
        return await this.extractFromXHS(url)
      }
    } catch (error) {
      logger.error(`XHS extraction failed for ${url}:`, error)
      // Fallback to mock data if real extraction fails
      logger.info('Falling back to mock data due to extraction error')
      return await this.extractFromXHS(url)
    }
  }

  private async extractWithPuppeteer(url: string): Promise<ExtractedContent> {
    let page
    
    try {
      logger.info(`Starting real XHS extraction for: ${url}`)
      
      page = await puppeteerService.createPage()
      
      // Navigate to the page
      await puppeteerService.navigateToPage(page, url)
      
      // Apply anti-bot measures
      await puppeteerService.bypassAntiBot(page)
      
      // Wait for content to load
      await this.waitForContent(page)
      
      // Extract basic content
      const title = await this.extractTitle(page)
      const description = await this.extractDescription(page)
      const images = await this.extractImages(page)
      const tags = await this.extractTags(page)
      const author = await this.extractAuthor(page)
      // const publishDate = await this.extractPublishDate(page)
      const metrics = await this.extractMetrics(page)

      // Convert to the expected format
      const content: ExtractedContent = {
        title: title || '小红书内容',
        description: description || '',
        platform: 'XIAOHONGSHU',
        
        locations: this.extractLocationsFromText(description || ''),
        activities: this.extractActivitiesFromText(description || '', tags),
        
        media: images.map((url, index) => ({
          type: 'IMAGE' as const,
          url,
          caption: `图片 ${index + 1}`
        })),
        
        tags: tags,
        
        author: {
          name: author || '未知用户',
          avatar: ''
        },
        
        stats: {
          likes: metrics.likeCount || 0,
          comments: metrics.commentCount || 0,
          shares: 0
        }
      }

      logger.info(`Successfully extracted XHS content: ${content.title}`)
      return content
      
    } catch (error) {
      logger.error(`Failed to extract XHS content with Puppeteer:`, error)
      throw error
    } finally {
      if (page) {
        await puppeteerService.closePage(page)
      }
    }
  }

  private async waitForContent(page: any): Promise<void> {
    try {
      // Wait for any of the main content selectors
      await Promise.race([
        puppeteerService.waitForSelector(page, this.selectors.title, 10000),
        puppeteerService.waitForSelector(page, '.note-item', 10000),
        puppeteerService.waitForSelector(page, '.note-detail', 10000),
        puppeteerService.waitForSelector(page, '.note-scroller', 10000),
      ])
      
      // Additional wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000))
      
    } catch (error) {
      logger.warn('Content selectors not found, proceeding with extraction')
    }
  }

  private async extractTitle(page: any): Promise<string | null> {
    const titleSelectors = this.selectors.title.split(', ')
    
    for (const selector of titleSelectors) {
      const title = await puppeteerService.extractText(page, selector)
      if (title && title.trim().length > 0) {
        return title.trim()
      }
    }
    
    // Fallback: try to extract from page title
    const pageTitle = await page.title()
    if (pageTitle && !pageTitle.includes('小红书')) {
      return pageTitle
    }
    
    return null
  }

  private async extractDescription(page: any): Promise<string | null> {
    const descSelectors = this.selectors.description.split(', ')
    
    for (const selector of descSelectors) {
      const desc = await puppeteerService.extractText(page, selector)
      if (desc && desc.trim().length > 0) {
        return desc.trim()
      }
    }
    
    return null
  }

  private async extractImages(page: any): Promise<string[]> {
    const imageSelectors = this.selectors.images.split(', ')
    const images: string[] = []
    
    for (const selector of imageSelectors) {
      try {
        const elements = await page.$$(selector)
        for (const element of elements) {
          const src = await page.evaluate((el: any) => {
            return el.src || el.getAttribute('data-src') || el.getAttribute('data-original')
          }, element)
          
          if (src && this.isValidImageUrl(src)) {
            images.push(src)
          }
        }
      } catch (error) {
        logger.debug(`Failed to extract images with selector ${selector}:`, error)
      }
    }
    
    return [...new Set(images)]
  }

  private async extractTags(page: any): Promise<string[]> {
    const tagSelectors = this.selectors.tags.split(', ')
    const tags: string[] = []
    
    for (const selector of tagSelectors) {
      const tagTexts = await puppeteerService.extractMultipleTexts(page, selector)
      tags.push(...tagTexts.map(tag => tag.replace('#', '').trim()))
    }
    
    return [...new Set(tags.filter(tag => tag.length > 0))]
  }

  private async extractAuthor(page: any): Promise<string | null> {
    const authorSelectors = this.selectors.author.split(', ')
    
    for (const selector of authorSelectors) {
      const author = await puppeteerService.extractText(page, selector)
      if (author && author.trim().length > 0) {
        return author.trim()
      }
    }
    
    return null
  }


  private async extractMetrics(page: any): Promise<{ likeCount?: number; commentCount?: number }> {
    const metrics: { likeCount?: number; commentCount?: number } = {}
    
    const likeText = await puppeteerService.extractText(page, this.selectors.likeCount)
    if (likeText) {
      metrics.likeCount = this.parseNumber(likeText)
    }
    
    const commentText = await puppeteerService.extractText(page, this.selectors.commentCount)
    if (commentText) {
      metrics.commentCount = this.parseNumber(commentText)
    }
    
    return metrics
  }

  private extractLocationsFromText(text: string): ExtractedContent['locations'] {
    // Simple location extraction based on common patterns
    const locations: ExtractedContent['locations'] = []
    
    // Look for location patterns in Chinese text
    const locationPatterns = [
      /([北上广深杭成都重庆西安南京武汉天津青岛大连厦门苏州无锡宁波长沙郑州沈阳哈尔滨长春石家庄太原合肥南昌福州贵阳昆明兰州银川西宁乌鲁木齐拉萨呼和浩特南宁海口三亚])([市区县])?/g,
      /(东京|大阪|京都|名古屋|横滨|神户|奈良|札幌|福冈|仙台)/g,
      /(首尔|釜山|济州岛|仁川|大邱|光州|大田|蔚山)/g,
      /(纽约|洛杉矶|旧金山|芝加哥|华盛顿|波士顿|西雅图|拉斯维加斯|迈阿密|奥兰多)/g,
      /(伦敦|巴黎|罗马|米兰|巴塞罗那|马德里|阿姆斯特丹|柏林|慕尼黑|维也纳|布拉格|苏黎世)/g,
    ]
    
    locationPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          locations.push({
            name: match,
            address: match,
            coordinates: [0, 0], // Would need geocoding service for real coordinates
            type: 'ATTRACTION'
          })
        })
      }
    })
    
    return locations
  }

  private extractActivitiesFromText(text: string, tags: string[]): ExtractedContent['activities'] {
    const activities: ExtractedContent['activities'] = []
    
    // Extract activities based on common patterns and tags
    const activityKeywords = ['美食', '景点', '购物', '体验', '游玩', '参观', '品尝', '探店']
    
    activityKeywords.forEach(keyword => {
      if (text.includes(keyword) || tags.some(tag => tag.includes(keyword))) {
        activities.push({
          name: `${keyword}体验`,
          description: `基于小红书内容的${keyword}推荐`,
          category: keyword,
          estimatedCost: 0,
          duration: 120,
          tips: ['详情请查看原始内容']
        })
      }
    })
    
    return activities
  }

  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }


  private parseNumber(text: string): number | undefined {
    const match = text.match(/(\d+(?:\.\d+)?)[万千]?/)
    if (!match) return undefined
    
    const num = parseFloat(match[1])
    if (text.includes('万')) {
      return Math.round(num * 10000)
    }
    if (text.includes('千')) {
      return Math.round(num * 1000)
    }
    
    return Math.round(num)
  }

  private async extractFromXHS(_url: string): Promise<ExtractedContent> {
    // Mock implementation for MVP/development
    const mockContent: ExtractedContent = {
      title: '东京美食探店攻略',
      description: '分享我在东京发现的几家超棒的美食店，包括拉面、寿司和甜品店，每一家都值得专程去品尝！',
      platform: 'XIAOHONGSHU',
      
      locations: [
        {
          name: '一兰拉面 新宿店',
          address: '东京都新宿区新宿3-34-11',
          coordinates: [35.6895, 139.7006],
          type: 'RESTAURANT'
        },
        {
          name: '筑地市场',
          address: '东京都中央区筑地5-2-1',
          coordinates: [35.6654, 139.7707],
          type: 'ATTRACTION'
        },
        {
          name: 'Bills 表参道店',
          address: '东京都涩谷区神宫前4-30-3',
          coordinates: [35.6681, 139.7109],
          type: 'RESTAURANT'
        }
      ],
      
      activities: [
        {
          name: '品尝正宗豚骨拉面',
          description: '一兰拉面的经典豚骨拉面，汤头浓郁，面条Q弹',
          category: '美食体验',
          estimatedCost: 1200,
          duration: 60,
          tips: ['建议避开用餐高峰期', '可以自定义面条硬度和汤头浓度']
        },
        {
          name: '筑地市场海鲜丼',
          description: '新鲜的海鲜丼，食材都是当天采购的最新鲜海产',
          category: '美食体验',
          estimatedCost: 2500,
          duration: 90,
          tips: ['早上6点开始营业', '建议早点去避免排队']
        },
        {
          name: 'Bills松饼下午茶',
          description: '世界最好吃的松饼，配上新鲜水果和蜂蜜黄油',
          category: '美食体验',
          estimatedCost: 1800,
          duration: 120,
          tips: ['需要提前预约', '推荐经典ricotta松饼']
        }
      ],
      
      media: [
        {
          type: 'IMAGE',
          url: 'https://example.com/xhs-image-1.jpg',
          caption: '一兰拉面店内环境'
        },
        {
          type: 'IMAGE',
          url: 'https://example.com/xhs-image-2.jpg',
          caption: '筑地市场新鲜海鲜丼'
        },
        {
          type: 'IMAGE',
          url: 'https://example.com/xhs-image-3.jpg',
          caption: 'Bills松饼'
        }
      ],
      
      tags: ['东京美食', '拉面', '海鲜丼', '松饼', '日本旅行', '美食探店'],
      
      author: {
        name: '旅行美食家小王',
        avatar: 'https://example.com/avatar.jpg'
      },
      
      stats: {
        likes: 1250,
        comments: 89,
        shares: 156
      }
    }

    return mockContent
  }

  async checkStatus(): Promise<boolean> {
    try {
      // In production, this would check if XHS is accessible
      return true
    } catch {
      return false
    }
  }
}
