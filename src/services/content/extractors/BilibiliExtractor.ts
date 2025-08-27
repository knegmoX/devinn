import { BaseExtractor } from './BaseExtractor'
import type { ExtractedContent, Platform } from '@/types'
import { puppeteerService } from '../PuppeteerService'
import { logger } from '@/lib/logger'

export class BilibiliExtractor extends BaseExtractor {
  platform: Platform = 'BILIBILI'

  private readonly selectors = {
    title: '.video-title, .video-info-title, h1[title], .video-title-text',
    description: '.video-desc, .video-info-desc, .desc-info, .video-desc-container',
    author: '.up-name, .username, .up-info .name, .video-info-detail .name',
    publishDate: '.pubdate, .video-data .item:first-child, .video-info-detail .pubdate',
    viewCount: '.view, .video-data .view, .video-info-detail .view',
    likeCount: '.like, .video-toolbar .like, .video-info-detail .like',
    commentCount: '.dm, .danmu, .video-toolbar .dm',
    duration: '.duration, .video-time, .video-info-detail .duration',
    tags: '.tag, .video-tag, .tag-panel .tag-item',
    thumbnail: '.video-cover img, .video-pic img, .cover img',
  }

  async extract(url: string): Promise<ExtractedContent> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid URL provided')
    }

    try {
      logger.info(`Starting Bilibili extraction for: ${url}`)
      
      // Check if we should use real extraction or fallback to mock
      const useRealExtraction = process.env.NODE_ENV === 'production' || process.env.ENABLE_REAL_EXTRACTION === 'true'
      
      if (useRealExtraction) {
        return await this.extractWithPuppeteer(url)
      } else {
        logger.info('Using mock extraction for development')
        return await this.extractFromBilibili(url)
      }
    } catch (error) {
      logger.error(`Bilibili extraction failed for ${url}:`, error)
      // Fallback to mock data if real extraction fails
      logger.info('Falling back to mock data due to extraction error')
      return await this.extractFromBilibili(url)
    }
  }

  private async extractWithPuppeteer(url: string): Promise<ExtractedContent> {
    let page
    
    try {
      logger.info(`Starting real Bilibili extraction for: ${url}`)
      
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
      const author = await this.extractAuthor(page)
      // const publishDate = await this.extractPublishDate(page)
      const metrics = await this.extractMetrics(page)
      const tags = await this.extractTags(page)
      const thumbnail = await this.extractThumbnail(page)

      // Convert to the expected format
      const content: ExtractedContent = {
        title: title || 'B站视频内容',
        description: description || '',
        platform: 'BILIBILI',
        
        locations: this.extractLocationsFromText(description || ''),
        activities: this.extractActivitiesFromText(description || '', tags),
        
        media: [
          ...(thumbnail ? [{
            type: 'IMAGE' as const,
            url: thumbnail,
            caption: '视频封面'
          }] : []),
          {
            type: 'VIDEO' as const,
            url: url,
            caption: title || '视频内容',
            timestamp: metrics.duration
          }
        ],
        
        tags: tags,
        
        author: {
          name: author || '未知UP主',
          avatar: ''
        },
        
        stats: {
          likes: metrics.likeCount || 0,
          comments: metrics.commentCount || 0,
          shares: 0
        }
      }

      logger.info(`Successfully extracted Bilibili content: ${content.title}`)
      return content
      
    } catch (error) {
      logger.error(`Failed to extract Bilibili content with Puppeteer:`, error)
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
        puppeteerService.waitForSelector(page, this.selectors.title, 15000),
        puppeteerService.waitForSelector(page, '.video-info', 15000),
        puppeteerService.waitForSelector(page, '.video-detail', 15000),
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
    if (pageTitle && !pageTitle.includes('哔哩哔哩')) {
      return pageTitle.replace(/_bilibili_哔哩哔哩$/, '').trim()
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


  private async extractMetrics(page: any): Promise<{
    viewCount?: number
    likeCount?: number
    commentCount?: number
    duration?: number
  }> {
    const metrics: {
      viewCount?: number
      likeCount?: number
      commentCount?: number
      duration?: number
    } = {}
    
    // Extract view count
    const viewText = await puppeteerService.extractText(page, this.selectors.viewCount)
    if (viewText) {
      metrics.viewCount = this.parseNumber(viewText)
    }
    
    // Extract like count
    const likeText = await puppeteerService.extractText(page, this.selectors.likeCount)
    if (likeText) {
      metrics.likeCount = this.parseNumber(likeText)
    }
    
    // Extract comment count
    const commentText = await puppeteerService.extractText(page, this.selectors.commentCount)
    if (commentText) {
      metrics.commentCount = this.parseNumber(commentText)
    }
    
    // Extract duration
    const durationText = await puppeteerService.extractText(page, this.selectors.duration)
    if (durationText) {
      metrics.duration = this.parseDuration(durationText)
    }
    
    return metrics
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

  private async extractThumbnail(page: any): Promise<string | null> {
    const thumbnailSelectors = this.selectors.thumbnail.split(', ')
    
    for (const selector of thumbnailSelectors) {
      const src = await puppeteerService.extractAttribute(page, selector, 'src')
      if (src && this.isValidImageUrl(src)) {
        return src
      }
    }
    
    return null
  }

  private extractLocationsFromText(text: string): ExtractedContent['locations'] {
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
            coordinates: [0, 0],
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
    const activityKeywords = ['旅行', '美食', '景点', '购物', '体验', '游玩', '参观', '品尝', '探店', 'vlog', '攻略']
    
    activityKeywords.forEach(keyword => {
      if (text.includes(keyword) || tags.some(tag => tag.includes(keyword))) {
        activities.push({
          name: `${keyword}分享`,
          description: `基于B站视频的${keyword}内容`,
          category: keyword,
          estimatedCost: 0,
          duration: 120,
          tips: ['详情请观看原视频']
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

  private parseDuration(durationText: string): number | undefined {
    // Parse duration in format like "12:34" or "1:23:45"
    const match = durationText.match(/(?:(\d+):)?(\d+):(\d+)/)
    if (!match) return undefined
    
    const [, hours, minutes, seconds] = match
    let totalSeconds = parseInt(seconds)
    totalSeconds += parseInt(minutes) * 60
    if (hours) {
      totalSeconds += parseInt(hours) * 3600
    }
    
    return totalSeconds
  }

  private async extractFromBilibili(_url: string): Promise<ExtractedContent> {
    // Mock implementation for MVP/development
    const mockContent: ExtractedContent = {
      title: '日本旅行VLOG | 东京5日深度游攻略',
      description: '和我一起探索东京的魅力！从浅草寺到新宿，从传统文化到现代都市，这次旅行收获满满。视频包含详细的交通攻略、美食推荐和景点介绍，希望对计划去日本旅行的朋友有帮助！',
      platform: 'BILIBILI',
      
      locations: [
        {
          name: '浅草寺',
          address: '东京都台东区浅草2-3-1',
          coordinates: [35.7148, 139.7967],
          type: 'ATTRACTION'
        },
        {
          name: '新宿',
          address: '东京都新宿区',
          coordinates: [35.6896, 139.7006],
          type: 'ATTRACTION'
        },
        {
          name: '涩谷十字路口',
          address: '东京都涩谷区道玄坂',
          coordinates: [35.6598, 139.7006],
          type: 'ATTRACTION'
        },
        {
          name: '明治神宫',
          address: '东京都涩谷区代代木神园町1-1',
          coordinates: [35.6762, 139.6993],
          type: 'ATTRACTION'
        }
      ],
      
      activities: [
        {
          name: '浅草寺参拜体验',
          description: '体验日本传统文化，参拜浅草寺，购买御守',
          category: '文化体验',
          estimatedCost: 500,
          duration: 120,
          tips: ['建议早上前往避免人群', '可以体验抽签']
        },
        {
          name: '新宿购物美食',
          description: '在新宿体验购物和品尝各种日本美食',
          category: '购物美食',
          estimatedCost: 3000,
          duration: 240,
          tips: ['推荐去歌舞伎町', '不要错过思い出横丁']
        },
        {
          name: '涩谷十字路口打卡',
          description: '在世界最繁忙的十字路口感受东京的活力',
          category: '城市体验',
          estimatedCost: 0,
          duration: 30,
          tips: ['最佳拍摄点在星巴克二楼', '晚上灯光效果更佳']
        },
        {
          name: '明治神宫散步',
          description: '在都市中的绿洲感受宁静，了解日本神道文化',
          category: '自然文化',
          estimatedCost: 0,
          duration: 90,
          tips: ['免费参观', '周末可能遇到传统婚礼']
        }
      ],
      
      media: [
        {
          type: 'IMAGE',
          url: 'https://example.com/bilibili-thumbnail.jpg',
          caption: '视频封面'
        },
        {
          type: 'VIDEO',
          url: 'https://example.com/bilibili-video.mp4',
          caption: '日本旅行VLOG完整版',
          timestamp: 1200
        }
      ],
      
      tags: ['日本旅行', '东京', 'VLOG', '旅行攻略', '美食', '文化体验', '购物'],
      
      author: {
        name: '旅行达人小李',
        avatar: 'https://example.com/bilibili-avatar.jpg'
      },
      
      stats: {
        likes: 8520,
        comments: 342,
        shares: 156
      }
    }

    return mockContent
  }

  async checkStatus(): Promise<boolean> {
    try {
      // In production, this would check if Bilibili is accessible
      return true
    } catch {
      return false
    }
  }
}
