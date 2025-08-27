import type { ExtractedContent, Platform } from '@/types'

export interface IExtractor {
  platform: Platform
  extract(url: string): Promise<ExtractedContent>
  checkStatus?(): Promise<boolean>
}

export abstract class BaseExtractor implements IExtractor {
  abstract platform: Platform

  abstract extract(url: string): Promise<ExtractedContent>

  async checkStatus(): Promise<boolean> {
    // Default implementation - can be overridden
    return true
  }

  protected validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  protected createBaseContent(
    title: string,
    description: string,
    platform: Platform
  ): Partial<ExtractedContent> {
    return {
      title,
      description,
      platform,
      locations: [],
      activities: [],
      media: [],
      tags: [],
      author: {
        name: '',
        avatar: undefined
      },
      stats: {
        likes: 0,
        comments: 0,
        shares: 0
      }
    }
  }
}
