'use client';

import React from 'react';
import { MapPin, Star, Wifi, Car, Coffee, ExternalLink, AlertCircle, Users } from 'lucide-react';
import { HotelOption } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface HotelCardProps {
  hotel: HotelOption;
  isSelected?: boolean;
  onSelect?: (hotel: HotelOption) => void;
  onBookingClick?: (deepLink: string) => void;
  showPriceAlert?: boolean;
  onPriceAlert?: (hotelId: string) => void;
  showMap?: boolean;
  className?: string;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  isSelected = false,
  onSelect,
  onBookingClick,
  showPriceAlert = false,
  onPriceAlert,
  showMap = false,
  className = ''
}) => {
  const handleSelect = () => {
    onSelect?.(hotel);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hotel.booking?.url) {
      onBookingClick?.(hotel.booking.url);
    }
  };

  const handlePriceAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPriceAlert?.(hotel.id);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'wifi': <Wifi className="w-4 h-4" />,
      '停车': <Car className="w-4 h-4" />,
      '早餐': <Coffee className="w-4 h-4" />,
      '健身房': <Users className="w-4 h-4" />,
    };
    return iconMap[amenity] || <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  };

  const mainImage = hotel.images.find(img => img.type === 'EXTERIOR') || hotel.images[0];
  const bestRoom = hotel.rooms[0];

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
      {/* Hotel Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {mainImage && (
          <img
            src={mainImage.url}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg';
            }}
          />
        )}
        
        {/* Hotel Category Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
          {hotel.category}
        </div>
        
        {/* Star Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
          {renderStars(hotel.starRating)}
        </div>
      </div>

      {/* Hotel Info */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{hotel.name}</h3>
            {hotel.brand && (
              <p className="text-sm text-gray-600 mb-2">{hotel.brand}</p>
            )}
            
            {/* Location */}
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{hotel.location.district}</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(bestRoom?.pricing.basePrice || 0, bestRoom?.pricing.currency || 'CNY')}
            </div>
            <div className="text-sm text-gray-500">每晚</div>
          </div>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{hotel.reviews.overall.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({hotel.reviews.totalReviews.toLocaleString()}条评价)
            </span>
          </div>
          
          {/* Availability Status */}
          <div className={`text-xs px-2 py-1 rounded-full ${
            hotel.booking.availability === 'AVAILABLE' 
              ? 'bg-green-100 text-green-800' 
              : hotel.booking.availability === 'LIMITED'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {hotel.booking.availability === 'AVAILABLE' && '有房'}
            {hotel.booking.availability === 'LIMITED' && '房源紧张'}
            {hotel.booking.availability === 'UNAVAILABLE' && '已满房'}
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center space-x-3 mb-4">
          {hotel.amenities.general.slice(0, 4).map((amenity, index) => (
            <div key={index} className="flex items-center space-x-1 text-xs text-gray-600">
              {getAmenityIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
          {hotel.amenities.general.length > 4 && (
            <span className="text-xs text-gray-500">
              +{hotel.amenities.general.length - 4}项设施
            </span>
          )}
        </div>

        {/* Room Info */}
        {bestRoom && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{bestRoom.type}</div>
                <div className="text-xs text-gray-600">
                  {bestRoom.size}㎡ · {bestRoom.bedType} · 最多{bestRoom.maxOccupancy}人
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(bestRoom.pricing.totalPrice, bestRoom.pricing.currency)}
                </div>
                <div className="text-xs text-gray-500">含税费</div>
              </div>
            </div>
          </div>
        )}

        {/* Nearby Landmarks */}
        {hotel.location.nearbyLandmarks.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 mb-2">附近地标</div>
            <div className="space-y-1">
              {hotel.location.nearbyLandmarks.slice(0, 2).map((landmark, index) => (
                <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                  <span>{landmark.name}</span>
                  <span>{landmark.distance}km · 步行{landmark.walkingTime}分钟</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          {hotel.booking && (
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

export default HotelCard;
