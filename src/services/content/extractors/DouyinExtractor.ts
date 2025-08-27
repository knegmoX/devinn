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

export class DouyinExtractor extends BaseExtractor {
  platform: Platform = 'DOUYIN'
  private puppeteerService: PuppeteerService

  constructor() {
    super()
    this.puppeteerService = new PuppeteerService()
  }

  async extract(url: string): Promise<ExtractedContent> {
    if (!this.validateUrl(url)) {
      throw new Error('Invalid Douyin URL provided')
    }

    logger.info('开始提取抖音内容', { url })

    try {
      // 在开发环境使用模拟数据，生产环境使用真实提取
      if (process.env.NODE_ENV === 'development') {
        logger.info('开发环境：使用模拟数据')
        return this.getMockContent()
      }

      const content = await this.extractFromDouyin(url)
      logger.info('抖音内容提取成功', { title: content.title })
      return content
    } catch (error) {
      logger.error('抖音内容提取失败', { error, url })
      throw new Error(`抖音内容提取失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private async extractFromDouyin(url: string): Promise<ExtractedContent> {
    const page = await this.puppeteerService.createPage()
    
    try {
      // 导航到抖音页面
      await this.puppeteerService.navigateToPage(page, url)
      
      // 等待页面加载
      await page.waitForSelector('[data-e2e="video-title"]', { timeout: 10000 })
      
      // 提取基本信息
      const title = await this.extractTitle(page)
      const description = await this.extractDescription(page)
      const author = await this.extractAuthor(page)
      const stats = await this.extractStats(page)
      
      // 提取媒体信息
      const media = await this.extractMedia(page)
      
      // 提取地理位置信息
      const locations = await this.extractLocations(page, description)
      
      // 提取活动信息
      const activities = await this.extractActivities(page, description)
      
      // 提取标签
      const tags = await this.extractTags(page, title, description)

      return {
        title,
        description,
        platform: 'DOUYIN',
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
        '[data-e2e="video-title"]',
        '.video-info-detail .title',
        '.video-title',
        'h1'
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

      return '抖音视频内容'
    } catch (error) {
      logger.warn('提取标题失败', { error })
      return '抖音视频内容'
    }
  }

  private async extractDescription(page: any): Promise<string> {
    try {
      const descSelectors = [
        '[data-e2e="video-desc"]',
        '.video-info-detail .desc',
        '.video-description',
        '.content'
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
          '[data-e2e="video-author-name"]',
          '.author-name',
          '.user-name',
          '.nickname'
        ]
        
        for (const selector of selectors) {
          const element = document.querySelector(selector)
          if (element?.textContent?.trim()) {
            return element.textContent.trim()
          }
        }
        return '抖音用户'
      })

      const authorAvatar = await page.evaluate(() => {
        const selectors = [
          '[data-e2e="video-author-avatar"] img',
          '.author-avatar img',
          '.user-avatar img'
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
      return { name: '抖音用户' }
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

        const likeElement = document.querySelector('[data-e2e="like-count"], .like-count, .digg-count')
        const commentElement = document.querySelector('[data-e2e="comment-count"], .comment-count')
        const shareElement = document.querySelector('[data-e2e="share-count"], .share-count')

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

      // 提取视频信息
      const videoUrl = await page.evaluate(() => {
        const videoElement = document.querySelector('video')
        return videoElement?.src || videoElement?.poster
      })

      if (videoUrl) {
        media.push({
          type: 'VIDEO',
          url: videoUrl,
          caption: '抖音短视频'
        })
      }

      // 提取封面图片
      const coverUrl = await page.evaluate(() => {
        const coverSelectors = [
          'video[poster]',
          '.video-cover img',
          '.video-poster img'
        ]
        
        for (const selector of coverSelectors) {
          const element = document.querySelector(selector)
          if (element) {
            if (element.tagName === 'VIDEO') {
              return (element as HTMLVideoElement).poster
            } else if (element.tagName === 'IMG') {
              return (element as HTMLImageElement).src
            }
          }
        }
        return null
      })

      if (coverUrl && coverUrl !== videoUrl) {
        media.push({
          type: 'IMAGE',
          url: coverUrl,
          caption: '视频封面'
        })
      }

      return media
    } catch (error) {
      logger.warn('提取媒体信息失败', { error })
      return []
    }
  }

  private async extractLocations(page: any, description: string): Promise<Location[]> {
    try {
      const locations: Location[] = []

      // 从页面提取位置信息
      const locationInfo = await page.evaluate(() => {
        const locationElement = document.querySelector('[data-e2e="video-location"], .location-info, .poi-info')
        return locationElement?.textContent?.trim()
      })

      // 从描述中提取地理位置关键词
      const locationKeywords = this.extractLocationKeywords(description + ' ' + (locationInfo || ''))
      
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

  private async extractActivities(_page: any, description: string): Promise<Activity[]> {
    try {
      const activities: Activity[] = []

      // 从描述中提取活动关键词
      const activityKeywords = this.extractActivityKeywords(description)
      
      activityKeywords.forEach(keyword => {
        activities.push({
          name: keyword,
          description: `在抖音视频中展示的${keyword}活动`,
          category: '娱乐体验',
          estimatedCost: 0,
          duration: 30,
          tips: ['参考抖音视频内容']
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

      // 从页面提取话题标签
      const hashtagElements = await page.$$('[data-e2e="video-tag"], .hashtag, .topic-tag')
      for (const element of hashtagElements) {
        const tag = await page.evaluate((el: any) => el.textContent?.trim(), element)
        if (tag && !tags.includes(tag)) {
          tags.push(tag.replace('#', ''))
        }
      }

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
      /(东京|大阪|京都|首尔|曼谷|新加坡|巴黎|伦敦|纽约)/g
    ]

    const locations: string[] = []
    locationPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        locations.push(...matches)
      }
    })

    return [...new Set(locations)].slice(0, 5)
  }

  private extractActivityKeywords(text: string): string[] {
    const activityPatterns = [
      /(打卡|拍照|游览|体验|品尝|购物|观光)/g,
      /(美食|景点|博物馆|公园|寺庙|神社)/g,
      /(温泉|滑雪|登山|海滩|潜水)/g
    ]

    const activities: string[] = []
    activityPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        activities.push(...matches)
      }
    })

    return [...new Set(activities)].slice(0, 3)
  }

  private extractKeywords(text: string): string[] {
    const keywords = text.match(/[\u4e00-\u9fa5]{2,}/g) || []
    return [...new Set(keywords)].slice(0, 5)
  }

  private getMockContent(): ExtractedContent {
    return {
      title: '东京网红打卡地合集！这些地方必须去！',
      description: '整理了东京最火的网红打卡地，每一个都超出片！快来收藏吧～',
      platform: 'DOUYIN',
      
      locations: [
        {
          name: '涩谷天空',
          address: '东京都涩谷区涩谷2-24-12',
          coordinates: [35.6580, 139.7016],
          type: 'ATTRACTION'
        },
        {
          name: '六本木Hills',
          address: '东京都港区六本木6-10-1',
          coordinates: [35.6606, 139.7298],
          type: 'ATTRACTION'
        }
      ],
      
      activities: [
        {
          name: '涩谷天空观景',
          description: '360度俯瞰涩谷十字路口的绝佳位置',
          category: '观光游览',
          estimatedCost: 2000,
          duration: 60,
          tips: ['建议傍晚时分前往', '需要提前预约']
        }
      ],
      
      media: [
        {
          type: 'VIDEO',
          url: 'https://example.com/douyin-video.mp4',
          caption: '东京网红打卡地'
        }
      ],
      
      tags: ['东京', '网红打卡', '涩谷', '六本木'],
      
      author: {
        name: '旅行博主小李',
        avatar: 'https://example.com/douyin-avatar.jpg'
      },
      
      stats: {
        likes: 15600,
        comments: 234,
        shares: 892
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
      logger.error('抖音提取器健康检查失败', { error })
      return false
    }
  }
}
