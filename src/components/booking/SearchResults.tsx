'use client';

import React, { useState } from 'react';
import { Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { FlightOption, HotelOption, FlightSearchResult, HotelSearchResult } from '@/types';
import { FlightCard } from './FlightCard';
import { HotelCard } from './HotelCard';

interface SearchResultsProps {
  type: 'flights' | 'hotels';
  results: FlightSearchResult | HotelSearchResult | null;
  isLoading: boolean;
  onFlightSelect?: (flight: FlightOption) => void;
  onHotelSelect?: (hotel: HotelOption) => void;
  onBookingClick?: (url: string) => void;
  onPriceAlert?: (itemId: string) => void;
  selectedItems?: string[];
}

type SortOption = 'price' | 'rating' | 'duration' | 'departure' | 'name';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export const SearchResults: React.FC<SearchResultsProps> = ({
  type,
  results,
  isLoading,
  onFlightSelect,
  onHotelSelect,
  onBookingClick,
  onPriceAlert,
  selectedItems = []
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Get items based on type
  const items = results ? (type === 'flights' ? (results as FlightSearchResult).flights : (results as HotelSearchResult).hotels) : [];

  // Calculate price range for filters
  React.useEffect(() => {
    if (items.length > 0) {
      const prices = items.map(item => {
        if (type === 'flights') {
          return (item as FlightOption).price.amount;
        } else {
          const hotel = item as HotelOption;
          return hotel.rooms[0]?.pricing.basePrice || 0;
        }
      });
      
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setPriceRange({ min, max });
    }
  }, [items, type]);

  // Sort items
  const sortedItems = React.useMemo(() => {
    if (!items.length) return [];

    const sorted = [...items].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'price':
          if (type === 'flights') {
            aValue = (a as FlightOption).price.amount;
            bValue = (b as FlightOption).price.amount;
          } else {
            aValue = (a as HotelOption).rooms[0]?.pricing.basePrice || 0;
            bValue = (b as HotelOption).rooms[0]?.pricing.basePrice || 0;
          }
          break;
        case 'rating':
          if (type === 'flights') {
            aValue = (a as FlightOption).rating?.score || 0;
            bValue = (b as FlightOption).rating?.score || 0;
          } else {
            aValue = (a as HotelOption).reviews.overall;
            bValue = (b as HotelOption).reviews.overall;
          }
          break;
        case 'duration':
          if (type === 'flights') {
            aValue = (a as FlightOption).duration.total;
            bValue = (b as FlightOption).duration.total;
          } else {
            // For hotels, sort by star rating as duration doesn't apply
            aValue = (a as HotelOption).starRating;
            bValue = (b as HotelOption).starRating;
          }
          break;
        case 'departure':
          if (type === 'flights') {
            aValue = new Date((a as FlightOption).departure.time).getTime();
            bValue = new Date((b as FlightOption).departure.time).getTime();
          } else {
            // For hotels, sort by name
            aValue = (a as HotelOption).name.toLowerCase();
            bValue = (b as HotelOption).name.toLowerCase();
          }
          break;
        case 'name':
          if (type === 'flights') {
            aValue = (a as FlightOption).airline.name.toLowerCase();
            bValue = (b as FlightOption).airline.name.toLowerCase();
          } else {
            aValue = (a as HotelOption).name.toLowerCase();
            bValue = (b as HotelOption).name.toLowerCase();
          }
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [items, sortBy, sortDirection, type]);

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const getSortOptions = () => {
    if (type === 'flights') {
      return [
        { value: 'price' as SortOption, label: '价格' },
        { value: 'duration' as SortOption, label: '飞行时长' },
        { value: 'departure' as SortOption, label: '出发时间' },
        { value: 'rating' as SortOption, label: '评分' },
        { value: 'name' as SortOption, label: '航空公司' }
      ];
    } else {
      return [
        { value: 'price' as SortOption, label: '价格' },
        { value: 'rating' as SortOption, label: '评分' },
        { value: 'duration' as SortOption, label: '星级' },
        { value: 'name' as SortOption, label: '酒店名称' }
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg text-gray-600">
            正在搜索{type === 'flights' ? '航班' : '酒店'}...
          </span>
        </div>
      </div>
    );
  }

  if (!results || !items.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">
          {!results ? `请搜索${type === 'flights' ? '航班' : '酒店'}` : '未找到符合条件的结果'}
        </div>
        {!results && (
          <p className="text-gray-400">
            使用上方的搜索表单来查找{type === 'flights' ? '航班' : '酒店'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {type === 'flights' ? '航班搜索结果' : '酒店搜索结果'}
            </h2>
            <p className="text-gray-600">
              找到 {results.totalResults} 个结果，来自 {results.providers.join(', ')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>筛选</span>
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">排序:</span>
          {getSortOptions().map(option => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                sortBy === option.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range Filter */}
              {priceRange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    价格范围
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600">
                      ¥{priceRange.min} - ¥{priceRange.max}
                    </span>
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最低评分
                </label>
                <select
                  value={ratingFilter || ''}
                  onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">不限</option>
                  <option value="3">3分以上</option>
                  <option value="4">4分以上</option>
                  <option value="4.5">4.5分以上</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Grid/List */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
          : 'space-y-4'
      }`}>
        {sortedItems.map((item) => {
          const itemId = item.id;
          const isSelected = selectedItems.includes(itemId);

          if (type === 'flights') {
            const flight = item as FlightOption;
            return (
              <FlightCard
                key={itemId}
                flight={flight}
                isSelected={isSelected}
                onSelect={onFlightSelect}
                onBookingClick={onBookingClick}
                onPriceAlert={onPriceAlert}
                showPriceAlert={true}
              />
            );
          } else {
            const hotel = item as HotelOption;
            return (
              <HotelCard
                key={itemId}
                hotel={hotel}
                isSelected={isSelected}
                onSelect={onHotelSelect}
                onBookingClick={onBookingClick}
                onPriceAlert={onPriceAlert}
                showPriceAlert={true}
              />
            );
          }
        })}
      </div>

      {/* Load More Button (if needed) */}
      {results.totalResults > sortedItems.length && (
        <div className="text-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            加载更多结果
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
