import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ContentAnalyzer } from '@/services/ai/ContentAnalyzer'
import { logger } from '@/lib/logger'

// Configure for dynamic API routes
export const dynamic = 'force-dynamic'

// Request validation schema
const AnalyzeRequestSchema = z.object({
  content: z.array(z.object({
    title: z.string(),
    description: z.string(),
    platform: z.enum(['XIAOHONGSHU', 'BILIBILI', 'DOUYIN', 'MAFENGWO']),
    locations: z.array(z.object({
      name: z.string(),
      address: z.string().optional(),
      coordinates: z.tuple([z.number(), z.number()]).optional(),
      type: z.enum(['ATTRACTION', 'RESTAURANT', 'HOTEL', 'TRANSPORT', 'ACTIVITY']),
    })),
    activities: z.array(z.object({
      name: z.string(),
      description: z.string(),
      category: z.string(),
      estimatedCost: z.number().optional(),
      duration: z.number().optional(),
      tips: z.array(z.string()).optional(),
    })),
    media: z.array(z.object({
      type: z.enum(['IMAGE', 'VIDEO']),
      url: z.string(),
      caption: z.string().optional(),
      timestamp: z.number().optional(),
    })),
    tags: z.array(z.string()),
    author: z.object({
      name: z.string(),
      avatar: z.string().optional(),
    }),
    stats: z.object({
      likes: z.number(),
      comments: z.number(),
      shares: z.number(),
    }),
  })),
  options: z.object({
    includeImages: z.boolean().optional().default(true),
    analysisDepth: z.enum(['basic', 'detailed', 'comprehensive']).optional().default('detailed'),
    extractInsights: z.boolean().optional().default(true),
  }).optional().default(() => ({
    includeImages: true,
    analysisDepth: 'detailed' as const,
    extractInsights: true,
  })),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = AnalyzeRequestSchema.parse(body)
    
    const { content, options } = validatedData
    
    logger.info('Starting AI content analysis', {
      contentCount: content.length,
      platforms: [...new Set(content.map(c => c.platform))],
      options,
    })

    // Initialize content analyzer
    const analyzer = new ContentAnalyzer()
    
    // Analyze each piece of content
    const analysisResults = []
    
    for (const item of content) {
      try {
        logger.info(`Analyzing content: ${item.title}`, { 
          platform: item.platform,
          locationsCount: item.locations.length,
          activitiesCount: item.activities.length
        })
        
        const result = await analyzer.analyzeContents([item])
        analysisResults.push({
          contentId: item.title, // Use title as ID since we don't have separate ID field
          title: item.title,
          platform: item.platform,
          analysis: result,
        })
        
        logger.info(`Analysis completed for: ${item.title}`, {
          locationsFound: result.locations.length,
          activitiesFound: result.activities.length,
          qualityScore: result.quality_score,
        })
        
      } catch (error) {
        logger.error(`Failed to analyze content: ${item.title}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          platform: item.platform,
        })
        
        // Add error result but continue processing other content
        analysisResults.push({
          contentId: item.title,
          title: item.title,
          platform: item.platform,
          analysis: null,
          error: error instanceof Error ? error.message : 'Analysis failed',
        })
      }
    }
    
    // Calculate overall statistics
    const successfulAnalyses = analysisResults.filter(r => r.analysis !== null)
    const totalLocations = successfulAnalyses.reduce((sum, r) => sum + (r.analysis?.locations.length || 0), 0)
    const totalActivities = successfulAnalyses.reduce((sum, r) => sum + (r.analysis?.activities.length || 0), 0)
    const averageQuality = successfulAnalyses.length > 0 
      ? successfulAnalyses.reduce((sum, r) => sum + (r.analysis?.quality_score || 0), 0) / successfulAnalyses.length
      : 0
    
    const response = {
      success: true,
      results: analysisResults,
      summary: {
        totalContent: content.length,
        successfulAnalyses: successfulAnalyses.length,
        failedAnalyses: analysisResults.length - successfulAnalyses.length,
        totalLocations,
        totalActivities,
        averageQualityScore: Math.round(averageQuality * 100) / 100,
      },
      timestamp: new Date().toISOString(),
    }
    
    logger.info('AI content analysis completed', response.summary)
    
    return NextResponse.json(response)
    
  } catch (error) {
    logger.error('AI content analysis failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'Use POST to analyze content',
    },
    { status: 405 }
  )
}
