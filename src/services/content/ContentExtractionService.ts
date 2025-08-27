import type { Platform, ExtractedContent } from '@/types'
import { BaseExtractor } from './extractors/BaseExtractor'
import { XHSExtractor } from './extractors/XHSExtractor'
import { BilibiliExtractor } from './extractors/BilibiliExtractor'
import { DouyinExtractor } from './extractors/DouyinExtractor'
import { MafengwoExtractor } from './extractors/MafengwoExtractor'
import { extractPlatform, retry, getErrorMessage } from '@/lib/utils'

export interface ExtractionResult {
  success: boolean
  data?: ExtractedContent
  error?: string
  platform?: Platform
}

export class ContentExtractionService {
  private extractors: Map<Platform, BaseExtractor>

  constructor() {
    this.extractors = new Map<Platform, BaseExtractor>()
    this.extractors.set('XIAOHONGSHU', new XHSExtractor())
    this.extractors.set('BILIBILI', new BilibiliExtractor())
    this.extractors.set('DOUYIN', new DouyinExtractor())
    this.extractors.set('MAFENGWO', new MafengwoExtractor())
  }

  /**
   * Extract content from URL
   */
  async extractContent(url: string): Promise<ExtractionResult> {
    try {
      // Detect platform
      const platform = extractPlatform(url) as Platform
      if (!platform) {
        return {
          success: false,
          error: '不支持的平台或无效的URL'
        }
      }

      // Get appropriate extractor
      const extractor = this.extractors.get(platform)
      if (!extractor) {
        return {
          success: false,
          error: `暂不支持 ${platform} 平台的内容提取`,
          platform
        }
      }

      // Extract content with retry
      const extractedData = await retry(
        () => extractor.extract(url),
        3,
        2000
      ) as ExtractedContent

      return {
        success: true,
        data: extractedData,
        platform
      }
    } catch (error) {
      return {
        success: false,
        error: `内容提取失败: ${getErrorMessage(error)}`,
        platform: extractPlatform(url) as Platform
      }
    }
  }

  /**
   * Extract content from multiple URLs
   */
  async extractMultipleContents(urls: string[]): Promise<ExtractionResult[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.extractContent(url))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          success: false,
          error: `URL ${urls[index]} 提取失败: ${getErrorMessage(result.reason)}`,
          platform: extractPlatform(urls[index]) as Platform
        }
      }
    })
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): Platform[] {
    return Array.from(this.extractors.keys())
  }

  /**
   * Check if platform is supported
   */
  isPlatformSupported(platform: Platform): boolean {
    return this.extractors.has(platform)
  }

  /**
   * Get platform status
   */
  async getPlatformStatus(): Promise<Record<Platform, boolean>> {
    const platforms = this.getSupportedPlatforms()
    const statusChecks = await Promise.allSettled(
      platforms.map(async platform => {
        const extractor = this.extractors.get(platform)
        try {
          // Try to check if extractor is working
          await extractor?.checkStatus?.()
          return { platform, status: true }
        } catch {
          return { platform, status: false }
        }
      })
    )

    const status: Record<Platform, boolean> = {} as any
    statusChecks.forEach((result, index) => {
      const platform = platforms[index]
      if (result.status === 'fulfilled') {
        status[platform] = result.value.status
      } else {
        status[platform] = false
      }
    })

    return status
  }
}

// Singleton instance
export const contentExtractionService = new ContentExtractionService()
