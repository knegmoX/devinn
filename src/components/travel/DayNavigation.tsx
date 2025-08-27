'use client';

import React from 'react';
import { ItineraryDay } from '@/types';

interface DayNavigationProps {
  days: ItineraryDay[];
  selectedDay: number;
  onDaySelect: (dayNumber: number) => void;
}

export const DayNavigation: React.FC<DayNavigationProps> = ({
  days,
  selectedDay,
  onDaySelect
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900">行程导航</h3>
      </div>
      
      <div className="p-2">
        {days.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => onDaySelect(day.dayNumber)}
            className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
              selectedDay === day.dayNumber
                ? 'bg-blue-50 border-blue-200 border text-blue-900'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">
                  第 {day.dayNumber} 天
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {day.date}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {day.activities.length} 个活动
                </div>
                {day.dailySummary && (
                  <div className="text-xs text-blue-600 font-medium">
                    ¥{day.dailySummary.totalCost}
                  </div>
                )}
              </div>
            </div>
            
            {day.theme && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                  {day.theme}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DayNavigation;
