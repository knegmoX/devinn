import { NextRequest, NextResponse } from 'next/server';
import { FlightSearchServiceImpl } from '@/services/booking/FlightSearchService';
import { FlightSearchParams } from '@/types';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const flightService = new FlightSearchServiceImpl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { origin, destination, departureDate, passengers, cabinClass, tripType } = body as FlightSearchParams;
    
    if (!origin || !destination || !departureDate || !passengers || !cabinClass || !tripType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: origin, destination, departureDate, passengers, cabinClass, tripType' 
        },
        { status: 400 }
      );
    }

    // Validate passenger counts
    if (passengers.adults < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one adult passenger is required' 
        },
        { status: 400 }
      );
    }

    // Validate trip type and return date
    if (tripType === 'ROUND_TRIP' && !body.returnDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Return date is required for round trip flights' 
        },
        { status: 400 }
      );
    }

    // Validate dates
    const depDate = new Date(departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (depDate < today) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Departure date cannot be in the past' 
        },
        { status: 400 }
      );
    }

    if (body.returnDate) {
      const retDate = new Date(body.returnDate);
      if (retDate <= depDate) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Return date must be after departure date' 
          },
          { status: 400 }
        );
      }
    }

    logger.info('Flight search request received', {
      origin,
      destination,
      departureDate,
      returnDate: body.returnDate,
      passengers,
      cabinClass,
      tripType
    });

    // Perform flight search
    const searchResult = await flightService.searchFlights(body);

    logger.info('Flight search completed', {
      searchId: searchResult.searchId,
      totalResults: searchResult.totalResults,
      providers: searchResult.providers
    });

    return NextResponse.json({
      success: true,
      data: searchResult
    });

  } catch (error) {
    logger.error('Flight search failed', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during flight search',
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
      error: 'Method not allowed. Use POST to search flights.' 
    },
    { status: 405 }
  );
}
