'use client';

import React, { useState } from 'react';
import { Activity } from '@/types';
import { useTravelDocumentStore } from '@/stores/travelDocumentStore';

interface ActivityCardProps {
  activity: Activity;
  isFirst: boolean;
  isLast: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isFirst,
  isLast
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { updateActivity, deleteActivity } = useTravelDocumentStore();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ATTRACTION': return '🏛️';
      case 'RESTAURANT': return '🍽️';
      case 'HOTEL': return '🏨';
      case 'TRANSPORT': return '🚗';
      case 'ACTIVITY': return '🎯';
      case 'SHOPPING': return '🛍️';
      default: return '📍';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'ATTRACTION': return '景点';
      case 'RESTAURANT': return '餐厅';
      case 'HOTEL': return '酒店';
      case 'TRANSPORT': return '交通';
      case 'ACTIVITY': return '活动';
      case 'SHOPPING': return '购物';
      default: return '其他';
    }
  };

  const handleToggleBookmark = () => {
    updateActivity(activity.id, {
      userModifications: {
        ...activity.userModifications,
        bookmarked: !activity.userModifications.bookmarked
      }
    });
  };

  const handlePriorityChange = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    updateActivity(activity.id, {
      userModifications: {
        ...activity.userModifications,
        priority
      }
    });
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个活动吗？')) {
      deleteActivity(activity.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      {/* Timeline connector */}
      {!isFirst && (
        <div className="flex justify-center">
          <div className="w-px h-4 bg-gray-200"></div>
        </div>
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-2xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activity.title}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                  {getActivityTypeLabel(activity.type)}
                </span>
                {activity.userModifications.bookmarked && (
                  <span className="text-yellow-500">⭐</span>
                )}
              </div>
              
              {activity.startTime && activity.endTime && (
                <div className="text-sm text-gray-600 mb-2">
                  ⏰ {activity.startTime} - {activity.endTime}
                </div>
              )}
              
              <p className="text-gray-700 text-sm leading-relaxed">
                {activity.description}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                activity.userModifications.bookmarked
                  ? 'text-yellow-500 hover:bg-yellow-50'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={activity.userModifications.bookmarked ? '取消收藏' : '收藏'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
              title={isExpanded ? '收起详情' : '展开详情'}
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
              title="删除活动"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          {activity.location && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{activity.location.name}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>¥{activity.estimatedCost}</span>
          </div>
          
          {activity.duration && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{activity.duration}</span>
            </div>
          )}
        </div>

        {/* Priority Selector */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm text-gray-600">优先级:</span>
          <div className="flex space-x-1">
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityChange(priority)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  activity.userModifications.priority === priority
                    ? priority === 'HIGH' 
                      ? 'bg-red-100 text-red-800'
                      : priority === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority === 'HIGH' ? '高' : priority === 'MEDIUM' ? '中' : '低'}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {activity.location && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">位置信息</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 mb-2">{activity.location.address}</p>
                  {activity.location.coordinates && (
                    <p className="text-xs text-gray-500">
                      坐标: {activity.location.coordinates[0]}, {activity.location.coordinates[1]}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {activity.tips && activity.tips.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">贴士</h4>
                <ul className="space-y-1">
                  {activity.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">💡</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activity.bookingInfo && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">预订信息</h4>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">预订说明</p>
                  {activity.bookingInfo.url && (
                    <a
                      href={activity.bookingInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      前往预订
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Status indicators */}
            <div className="flex items-center space-x-4 text-xs">
              {activity.status.confirmed && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800">
                  ✓ 已确认
                </span>
              )}
              {activity.status.modified && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-orange-100 text-orange-800">
                  ✏️ 已修改
                </span>
              )}
              {activity.status.aiGenerated && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-800">
                  🤖 AI生成
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Timeline connector */}
      {!isLast && (
        <div className="flex justify-center">
          <div className="w-px h-4 bg-gray-200"></div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
