'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plane } from 'lucide-react';
import { FlightSearchParams } from '@/types';

interface FlightSearchFormProps {
  onSearch: (params: FlightSearchParams) => void;
  initialParams?: Partial<FlightSearchParams>;
  isLoading?: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  initialParams,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FlightSearchParams>({
    origin: initialParams?.origin || '',
    destination: initialParams?.destination || '',
    departureDate: initialParams?.departureDate || '',
    returnDate: initialParams?.returnDate || '',
    passengers: initialParams?.passengers || {
      adults: 1,
      children: 0,
      infants: 0
    },
    cabinClass: initialParams?.cabinClass || 'ECONOMY',
    tripType: initialParams?.tripType || 'ROUND_TRIP'
  });

  const handleInputChange = (field: keyof FlightSearchParams, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePassengerChange = (type: keyof FlightSearchParams['passengers'], value: number) => {
    setFormData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, value)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      alert('请填写出发地、目的地和出发日期');
      return;
    }

    if (formData.tripType === 'ROUND_TRIP' && !formData.returnDate) {
      alert('往返行程请选择返程日期');
      return;
    }

    if (formData.passengers.adults === 0) {
      alert('至少需要一位成人乘客');
      return;
    }

    onSearch(formData);
  };

  const totalPassengers = formData.passengers.adults + formData.passengers.children + formData.passengers.infants;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Trip Type */}
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="tripType"
            value="ROUND_TRIP"
            checked={formData.tripType === 'ROUND_TRIP'}
            onChange={(e) => handleInputChange('tripType', e.target.value as FlightSearchParams['tripType'])}
            className="text-blue-600"
          />
          <span>往返</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="tripType"
            value="ONE_WAY"
            checked={formData.tripType === 'ONE_WAY'}
            onChange={(e) => handleInputChange('tripType', e.target.value as FlightSearchParams['tripType'])}
            className="text-blue-600"
          />
          <span>单程</span>
        </label>
      </div>

      {/* Origin and Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            出发地
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              placeholder="请输入出发城市或机场代码"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目的地
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              placeholder="请输入目的地城市或机场代码"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            出发日期
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => handleInputChange('departureDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {formData.tripType === 'ROUND_TRIP' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              返程日期
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.returnDate || ''}
                onChange={(e) => handleInputChange('returnDate', e.target.value)}
                min={formData.departureDate || new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* Passengers and Cabin Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            乘客信息
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">成人</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handlePassengerChange('adults', formData.passengers.adults - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.passengers.adults <= 1}
                >
                  -
                </button>
                <span className="w-8 text-center">{formData.passengers.adults}</span>
                <button
                  type="button"
                  onClick={() => handlePassengerChange('adults', formData.passengers.adults + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={totalPassengers >= 9}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">儿童 (2-11岁)</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handlePassengerChange('children', formData.passengers.children - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.passengers.children <= 0}
                >
                  -
                </button>
                <span className="w-8 text-center">{formData.passengers.children}</span>
                <button
                  type="button"
                  onClick={() => handlePassengerChange('children', formData.passengers.children + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={totalPassengers >= 9}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">婴儿 (0-2岁)</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handlePassengerChange('infants', formData.passengers.infants - 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.passengers.infants <= 0}
                >
                  -
                </button>
                <span className="w-8 text-center">{formData.passengers.infants}</span>
                <button
                  type="button"
                  onClick={() => handlePassengerChange('infants', formData.passengers.infants + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={formData.passengers.infants >= formData.passengers.adults || totalPassengers >= 9}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            舱位等级
          </label>
          <select
            value={formData.cabinClass}
            onChange={(e) => handleInputChange('cabinClass', e.target.value as FlightSearchParams['cabinClass'])}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ECONOMY">经济舱</option>
            <option value="BUSINESS">商务舱</option>
            <option value="FIRST">头等舱</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <Plane className="w-5 h-5" />
        <span>{isLoading ? '搜索中...' : '搜索航班'}</span>
      </button>
    </form>
  );
};

export default FlightSearchForm;
