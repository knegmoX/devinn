import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RecommendationEngine } from '@/services/ai/RecommendationEngine'
import { contentAnalyzer } from '@/services/ai/ContentAnalyzer'
import { logger } from '@/lib/logger'

// Configure for dynamic API routes
export const dynamic = 'force-dynamic'

// Request validation schema
const RecommendRequestSchema = z.object({
  extractedContent: z.array(z.object({
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
  userRequirements: z.object({
    duration: z.number().min(1).max(30),
    travelers: z.number().min(1).max(20),
    budget: z.number().optional(),
    travelStyle: z.array(z.string()),
    interests: z.array(z.string()),
    dietaryRestrictions: z.array(z.string()).optional(),
    accessibility: z.array(z.string()).optional(),
    freeText: z.string().optional(),
  }),
  userPreferences: z.object({
    budget_range: z.enum(['low', 'medium', 'high']).optional(),
    activity_types: z.array(z.string()).optional(),
    travel_style: z.enum(['relaxed', 'adventure', 'cultural', 'luxury']).optional(),
    group_type: z.enum(['solo', 'couple', 'family', 'friends']).optional(),
    interests: z.array(z.string()).optional(),
    avoid_list: z.array(z.string()).optional(),
  }).optional(),
  options: z.object({
    maxRecommendations: z.number().min(1).max(50).optional().default(10),
    includeAlternatives: z.boolean().optional().default(true),
    diversityLevel: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    recommendationType: z.enum(['similar', 'complementary', 'diverse']).optional().default('similar'),
  }).optional().default(() => ({
    maxRecommendations: 10,
    includeAlternatives: true,
    diversityLevel: 'medium' as const,
    recommendationType: 'similar' as const,
  })),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = RecommendRequestSchema.parse(body)
    
    const { extractedContent, userRequirements, userPreferences, options } = validatedData
    
    logger.info('Starting AI recommendation generation', {
      contentCount: extractedContent.length,
      userInterests: userRequirements.interests.length,
      maxRecommendations: options.maxRecommendations,
      recommendationType: options.recommendationType,
    })

    // Initialize recommendation engine
    const engine = new RecommendationEngine()
    
    try {
      // First analyze the content to get analysis results
      const analysisResults = []
      for (const content of extractedContent) {
        const analysis = await contentAnalyzer.analyzeContents([content])
        analysisResults.push(analysis)
      }
      
      // Generate recommendations with proper type handling
      const processedPreferences = userPreferences ? {
        budget_range: userPreferences.budget_range || 'medium' as const,
        activity_types: userPreferences.activity_types || [],
        travel_style: userPreferences.travel_style || 'relaxed' as const,
        group_type: userPreferences.group_type || 'couple' as const,
        interests: userPreferences.interests || [],
        avoid_list: userPreferences.avoid_list
      } : undefined
      
      const recommendations = await engine.generateRecommendations(
        extractedContent,
        userRequirements,
        analysisResults,
        processedPreferences
      )
      
      logger.info('AI recommendations generated successfully', {
        recommendationsCount: recommendations.recommendations.length,
        alternativesCount: recommendations.alternatives?.length || 0,
        confidenceScore: recommendations.confidence_score,
      })
      
      const response = {
        success: true,
        data: {
          recommendations: recommendations.recommendations,
          alternatives: recommendations.alternatives || [],
          metadata: {
            confidenceScore: recommendations.confidence_score,
            reasoning: recommendations.reasoning,
            generatedAt: new Date().toISOString(),
            contentAnalyzed: extractedContent.length,
            userPreferencesApplied: Object.keys(userPreferences || {}).length,
            recommendationStrategy: options.recommendationType,
          },
        },
        summary: {
          totalRecommendations: recommendations.recommendations.length,
          highConfidenceCount: recommendations.recommendations.filter(r => r.score > 0.8).length,
          mediumConfidenceCount: recommendations.recommendations.filter(r => r.score > 0.6 && r.score <= 0.8).length,
          lowConfidenceCount: recommendations.recommendations.filter(r => r.score <= 0.6).length,
          averageConfidence: recommendations.recommendations.length > 0 
            ? Math.round((recommendations.recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.recommendations.length) * 100) / 100
            : 0,
          categoriesRepresented: [...new Set(recommendations.recommendations.map(r => r.type))],
        },
        timestamp: new Date().toISOString(),
      }
      
      return NextResponse.json(response)
      
    } catch (recommendationError) {
      logger.error('AI recommendation generation failed', {
        error: recommendationError instanceof Error ? recommendationError.message : 'Unknown error',
        stack: recommendationError instanceof Error ? recommendationError.stack : undefined,
        userPreferences,
        contentCount: extractedContent.length,
      })
      
      return NextResponse.json(
        {
          success: false,
          error: 'Recommendation generation failed',
          message: recommendationError instanceof Error ? recommendationError.message : 'Failed to generate recommendations',
          details: {
            contentAnalyzed: extractedContent.length,
            userRequirements: userRequirements,
            userPreferences: userPreferences,
            options: options,
          },
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    logger.error('AI recommendation request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
          message: 'Please check your request format and required fields',
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
      message: 'Use POST to get AI recommendations',
      usage: {
        method: 'POST',
        endpoint: '/api/ai/recommend',
        description: 'Generate personalized recommendations based on extracted content and user preferences',
        requiredFields: ['extractedContent', 'userRequirements'],
        optionalFields: ['options'],
        examples: {
          recommendationType: ['similar', 'complementary', 'diverse'],
          diversityLevel: ['low', 'medium', 'high'],
          maxRecommendations: 'Number between 1-50',
        },
      },
    },
    { status: 405 }
  )
}
