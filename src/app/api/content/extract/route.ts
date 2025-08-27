import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ContentExtractionService } from '@/services/content/ContentExtractionService'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic';

// Request validation schema
const extractRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  platform: z.enum(['XIAOHONGSHU', 'BILIBILI', 'DOUYIN', 'MAFENGWO']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { url } = extractRequestSchema.parse(body)

    logger.info(`Content extraction request received for: ${url}`)

    // Initialize extraction service
    const extractionService = new ContentExtractionService()

    // Extract content
    const extractionResult = await extractionService.extractContent(url)
    
    if (!extractionResult.success) {
      return NextResponse.json({
        success: false,
        error: extractionResult.error
      }, { status: 400 })
    }

    logger.info(`Content extraction completed successfully for: ${url}`)

    return NextResponse.json({
      success: true,
      data: extractionResult.data,
      message: 'Content extracted successfully'
    })

  } catch (error) {
    logger.error('Content extraction failed:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 })
    }

    // Handle extraction errors
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const platform = searchParams.get('platform')

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL parameter is required'
      }, { status: 400 })
    }

    // Validate parameters
    const { url: validatedUrl } = extractRequestSchema.parse({
      url,
      platform: platform || undefined
    })

    logger.info(`Content extraction request received via GET for: ${validatedUrl}`)

    // Initialize extraction service
    const extractionService = new ContentExtractionService()

    // Extract content
    const extractionResult = await extractionService.extractContent(validatedUrl)
    
    if (!extractionResult.success) {
      return NextResponse.json({
        success: false,
        error: extractionResult.error
      }, { status: 400 })
    }

    logger.info(`Content extraction completed successfully for: ${validatedUrl}`)

    return NextResponse.json({
      success: true,
      data: extractionResult.data,
      message: 'Content extracted successfully'
    })

  } catch (error) {
    logger.error('Content extraction failed:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 })
    }

    // Handle extraction errors
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
