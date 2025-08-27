'use client';

import React from 'react';
import { Clock, Plane, MapPin, ExternalLink, Star, AlertCircle } from 'lucide-react';
import { FlightOption } from '@/types';
import { formatCurrency, formatDuration, formatTime } from '@/lib/utils';

interface FlightCardProps {
  flight: FlightOption;
  isSelected?: boolean;
  onSelect?: (flight: FlightOption) => void;
  onBookingClick?: (deepLink: string) => void;
  showPriceAlert?: boolean;
  onPriceAlert?: (flightId: string) => void;
  className?: string;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  isSelected = false,
  onSelect,
  onBookingClick,
  showPriceAlert = false,
  onPriceAlert,
  className = ''
}) => {
  const handleSelect = () => {
    onSelect?.(flight);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (flight.booking?.url) {
      onBookingClick?.(flight.booking.url);
    }
  };

  const handlePriceAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPriceAlert?.(flight.id);
  };

  const formatStops = (stops: Array<{airport: string; duration: number}>) => {
    if (stops.length === 0) return '直飞';
    return `${stops.length}次中转`;
  };

  const getAirlineLogoUrl = (code: string) => {
    // In production, this would be actual airline logo URLs
    return `https://images.kiwi.com/airlines/64x64/${code}.png`;
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-blue-300
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        ${className}
      `}
      onClick={handleSelect}
    >
      {/* Header with Airline Info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src={getAirlineLogoUrl(flight.airline.code)}
            alt={flight.airline.name}
            className="w-8 h-8 rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/airline-placeholder.png';
            }}
          />
          <div>
            <div className="font-medium text-gray-900">{flight.airline.name}</div>
            <div className="text-sm text-gray-500">{flight.flightNumber}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(flight.price.amount, flight.price.currency)}
          </div>
          <div className="text-sm text-gray-500">每人</div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Departure */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(flight.departure.time)}
            </div>
            <div className="text-sm text-gray-600">{flight.departure.airport.code}</div>
            <div className="text-xs text-gray-500">{flight.departure.airport.name}</div>
          </div>

          {/* Flight Path */}
          <div className="flex-1 mx-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300 relative">
                <Plane className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 w-4 h-4 text-blue-500" />
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="text-center mt-2">
              <div className="text-sm text-gray-600">{flight.duration.formatted}</div>
              <div className="text-xs text-gray-500">{formatStops(flight.stops)}</div>
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(flight.arrival.time)}
            </div>
            <div className="text-sm text-gray-600">{flight.arrival.airport.code}</div>
            <div className="text-xs text-gray-500">{flight.arrival.airport.name}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{flight.aircraft}</span>
            </span>
            {flight.cabin?.baggage && (
              <span>行李: {flight.cabin.baggage.checkedBags}</span>
            )}
          </div>
          {flight.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{flight.rating.score.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          {showPriceAlert && (
            <button
              onClick={handlePriceAlert}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              <span>价格提醒</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {flight.booking && (
            <button
              onClick={handleBookingClick}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>预订</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default FlightCard;
