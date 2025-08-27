import { NextRequest, NextResponse } from 'next/server';
import { HotelSearchServiceImpl } from '@/services/booking/HotelSearchService';
import { HotelSearchParams } from '@/types';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const hotelService = new HotelSearchServiceImpl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { destination, checkIn, checkOut, guests } = body as HotelSearchParams;
    
    if (!destination || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: destination, checkIn, checkOut, guests' 
        },
        { status: 400 }
      );
    }

    // Validate guest counts
    if (guests.adults < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one adult guest is required' 
        },
        { status: 400 }
      );
    }

    if (guests.rooms < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one room is required' 
        },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Check-in date cannot be in the past' 
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Check-out date must be after check-in date' 
        },
        { status: 400 }
      );
    }

    // Calculate nights
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights > 30) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Maximum stay duration is 30 nights' 
        },
        { status: 400 }
      );
    }

    // Validate price range if provided
    if (body.priceRange) {
      const { min, max } = body.priceRange;
      if (min && max && min > max) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Minimum price cannot be greater than maximum price' 
          },
          { status: 400 }
        );
      }
    }

    // Validate star rating if provided
    if (body.starRating && body.starRating.length > 0) {
      const invalidRatings = body.starRating.filter((rating: number) => rating < 1 || rating > 5);
      if (invalidRatings.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Star ratings must be between 1 and 5' 
          },
          { status: 400 }
        );
      }
    }

    logger.info('Hotel search request received', {
      destination,
      checkIn,
      checkOut,
      nights,
      guests,
      starRating: body.starRating,
      priceRange: body.priceRange,
      amenities: body.amenities
    });

    // Perform hotel search
    const searchResult = await hotelService.searchHotels(body);

    logger.info('Hotel search completed', {
      searchId: searchResult.searchId,
      totalResults: searchResult.totalResults,
      providers: searchResult.providers
    });

    return NextResponse.json({
      success: true,
      data: searchResult
    });

  } catch (error) {
    logger.error('Hotel search failed', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during hotel search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to search hotels.' 
    },
    { status: 405 }
  );
}
