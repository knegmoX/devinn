import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TravelPlanGenerator } from '@/services/ai/TravelPlanGenerator'
import { logger } from '@/lib/logger'

// Configure for dynamic API routes
export const dynamic = 'force-dynamic'

// Request validation schema
const GeneratePlanRequestSchema = z.object({
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
  options: z.object({
    includeFlights: z.boolean().optional().default(true),
    includeHotels: z.boolean().optional().default(true),
    optimizeRoute: z.boolean().optional().default(true),
    detailLevel: z.enum(['basic', 'detailed', 'comprehensive']).optional().default('detailed'),
  }).optional().default(() => ({
    includeFlights: true,
    includeHotels: true,
    optimizeRoute: true,
    detailLevel: 'detailed' as const,
  })),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = GeneratePlanRequestSchema.parse(body)
    
    const { extractedContent, userRequirements, options } = validatedData
    
    logger.info('Starting travel plan generation', {
      contentCount: extractedContent.length,
      duration: userRequirements.duration,
      travelers: userRequirements.travelers,
      budget: userRequirements.budget,
      options,
    })

    // Initialize travel plan generator
    const generator = new TravelPlanGenerator()
    
    try {
      // Generate the travel plan
      const travelPlan = await generator.generateTravelPlan(
        extractedContent,
        userRequirements
      )
      
      logger.info('Travel plan generation completed', {
        planTitle: travelPlan.title,
        totalDays: travelPlan.totalDays,
        estimatedBudget: travelPlan.estimatedBudget,
        activitiesCount: travelPlan.days.reduce((sum: number, day: any) => sum + day.activities.length, 0),
        flightsCount: travelPlan.flights?.length || 0,
        hotelsCount: travelPlan.hotels?.length || 0,
      })
      
      const response = {
        success: true,
        data: {
          travelPlan,
          metadata: {
            generatedAt: new Date().toISOString(),
            contentSources: extractedContent.length,
            planComplexity: travelPlan.days.length > 7 ? 'complex' : 
                           travelPlan.days.length > 3 ? 'moderate' : 'simple',
            estimatedPlanningTime: `${Math.ceil(travelPlan.days.length * 2)} hours`,
          },
        },
        timestamp: new Date().toISOString(),
      }
      
      return NextResponse.json(response)
      
    } catch (generationError) {
      logger.error('Travel plan generation failed', {
        error: generationError instanceof Error ? generationError.message : 'Unknown error',
        stack: generationError instanceof Error ? generationError.stack : undefined,
        userRequirements,
        contentCount: extractedContent.length,
      })
      
      return NextResponse.json(
        {
          success: false,
          error: 'Plan generation failed',
          message: generationError instanceof Error ? generationError.message : 'Failed to generate travel plan',
          details: {
            contentAnalyzed: extractedContent.length,
            requirements: userRequirements,
          },
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    logger.error('Travel plan generation request failed', {
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
      message: 'Use POST to generate travel plans',
      usage: {
        method: 'POST',
        endpoint: '/api/ai/generate-plan',
        description: 'Generate personalized travel plans based on extracted content and user requirements',
        requiredFields: ['extractedContent', 'userRequirements'],
        optionalFields: ['options'],
      },
    },
    { status: 405 }
  )
}
