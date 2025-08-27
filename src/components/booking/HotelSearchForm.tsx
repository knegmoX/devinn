'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Users, Building, Star } from 'lucide-react';
import { HotelSearchParams } from '@/types';

interface HotelSearchFormProps {
  onSearch: (params: HotelSearchParams) => void;
  initialParams?: Partial<HotelSearchParams>;
  isLoading?: boolean;
}

export const HotelSearchForm: React.FC<HotelSearchFormProps> = ({
  onSearch,
  initialParams,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<HotelSearchParams>({
    destination: initialParams?.destination || '',
    checkIn: initialParams?.checkIn || '',
    checkOut: initialParams?.checkOut || '',
    guests: initialParams?.guests || {
      adults: 2,
      children: 0,
      rooms: 1
    },
    starRating: initialParams?.starRating || [],
    priceRange: initialParams?.priceRange || undefined,
    amenities: initialParams?.amenities || []
  });

  const handleInputChange = (field: keyof HotelSearchParams, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuestChange = (type: keyof HotelSearchParams['guests'], value: number) => {
    setFormData(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: Math.max(type === 'rooms' ? 1 : 0, value)
      }
    }));
  };

  const handleStarRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      starRating: prev.starRating?.includes(rating)
        ? prev.starRating.filter(r => r !== rating)
        : [...(prev.starRating || []), rating]
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    setFormData(prev => ({
      ...prev,
      priceRange: {
        min: field === 'min' ? numValue || 0 : prev.priceRange?.min || 0,
        max: field === 'max' ? numValue || 9999 : prev.priceRange?.max || 9999
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.destination || !formData.checkIn || !formData.checkOut) {
      alert('请填写目的地、入住日期和退房日期');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      alert('退房日期必须晚于入住日期');
      return;
    }

    if (formData.guests.adults === 0) {
      alert('至少需要一位成人客人');
      return;
    }

    onSearch(formData);
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const totalGuests = formData.guests.adults + formData.guests.children;
  const nights = calculateNights();

  const commonAmenities = [
    'WiFi',
    '停车场',
    '早餐',
    '健身房',
    '游泳池',
    '空调',
    '餐厅',
    '商务中心'
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Destination */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          目的地
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            placeholder="请输入城市、地区或酒店名称"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Check-in and Check-out Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            入住日期
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            退房日期
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              min={formData.checkIn || new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Show nights if dates are selected */}
      {nights > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          共 {nights} 晚住宿
        </div>
      )}

      {/* Guests and Rooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          客人和房间
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">成人</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleGuestChange('adults', formData.guests.adults - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.guests.adults <= 1}
                >
                  -
                </button>
                <span className="w-8 text-center">{formData.guests.adults}</span>
                <button
                  type="button"
                  onClick={() => handleGuestChange('adults', formData.guests.adults + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={totalGuests >= 16}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">儿童</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleGuestChange('children', formData.guests.children - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.guests.children <= 0}
                >
                  -
                </button>
                <span className="w-8 text-center">{formData.guests.children}</span>
                <button
                  type="button"
                  onClick={() => handleGuestChange('children', formData.guests.children + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={totalGuests >= 16}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">房间</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleGuestChange('rooms', formData.guests.rooms - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.guests.rooms <= 1}
                >
                  -
                </button>
                <span className="w-8 text-center">{formData.guests.rooms}</span>
                <button
                  type="button"
                  onClick={() => handleGuestChange('rooms', formData.guests.rooms + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.guests.rooms >= 8}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">筛选条件</h3>
        
        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            酒店星级
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleStarRatingChange(rating)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md border transition-colors ${
                  formData.starRating?.includes(rating)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{rating}</span>
                <Star className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            价格范围 (每晚)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder="最低价格"
                value={formData.priceRange?.min || ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="最高价格"
                value={formData.priceRange?.max || ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            设施服务
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {commonAmenities.map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.amenities?.includes(amenity) || false}
                  onChange={() => handleAmenityChange(amenity)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <Building className="w-5 h-5" />
        <span>{isLoading ? '搜索中...' : '搜索酒店'}</span>
      </button>
    </form>
  );
};

export default HotelSearchForm;
