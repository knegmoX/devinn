'use client';

import React from 'react';
import { TravelDocument } from '@/types';

interface DocumentSummaryProps {
  document: TravelDocument;
}

export const DocumentSummary: React.FC<DocumentSummaryProps> = ({ document }) => {
  const getTotalActivities = () => {
    return document.itinerary.reduce((total, day) => total + day.activities.length, 0);
  };

  const getTopCategories = () => {
    const categoryCount: Record<string, number> = {};
    
    document.itinerary.forEach(day => {
      day.activities.forEach(activity => {
        categoryCount[activity.type] = (categoryCount[activity.type] || 0) + 1;
      });
    });

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
  };

  const getBudgetBreakdown = () => {
    const breakdown = document.budget.breakdown;
    const total = document.budget.total;
    
    return [
      { category: '住宿', amount: breakdown.accommodation, percentage: (breakdown.accommodation / total) * 100 },
      { category: '餐饮', amount: breakdown.food, percentage: (breakdown.food / total) * 100 },
      { category: '活动', amount: breakdown.activities, percentage: (breakdown.activities / total) * 100 },
      { category: '交通', amount: breakdown.transport, percentage: (breakdown.transport / total) * 100 },
      { category: '购物', amount: breakdown.shopping || 0, percentage: ((breakdown.shopping || 0) / total) * 100 },
      { category: '其他', amount: breakdown.miscellaneous || 0, percentage: ((breakdown.miscellaneous || 0) / total) * 100 },
    ].filter(item => item.amount > 0);
  };

  const getHighlights = () => {
    const highlights: string[] = [];
    
    document.itinerary.forEach(day => {
      if (day.dailySummary.highlights) {
        highlights.push(...day.dailySummary.highlights);
      }
    });

    return highlights.slice(0, 5); // 只显示前5个亮点
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'FLIGHT': '✈️',
      'HOTEL': '🏨',
      'ATTRACTION': '🎯',
      'RESTAURANT': '🍽️',
      'TRANSPORT': '🚗',
      'ACTIVITY': '🎪'
    };
    return icons[type] || '📍';
  };

  const getCategoryName = (type: string) => {
    const names: Record<string, string> = {
      'FLIGHT': '航班',
      'HOTEL': '住宿',
      'ATTRACTION': '景点',
      'RESTAURANT': '餐厅',
      'TRANSPORT': '交通',
      'ACTIVITY': '活动'
    };
    return names[type] || type;
  };

  const topCategories = getTopCategories();
  const budgetBreakdown = getBudgetBreakdown();
  const highlights = getHighlights();

  return (
    <div className="document-summary">
      <h2 className="document-summary__title">行程概览</h2>
      
      <div className="document-summary__grid">
        {/* 基本统计 */}
        <div className="document-summary__card">
          <h3 className="document-summary__card-title">
            <span className="document-summary__card-icon">📊</span>
            基本信息
          </h3>
          <div className="document-summary__stats">
            <div className="document-summary__stat">
              <span className="document-summary__stat-value">{document.itinerary.length}</span>
              <span className="document-summary__stat-label">天数</span>
            </div>
            <div className="document-summary__stat">
              <span className="document-summary__stat-value">{getTotalActivities()}</span>
              <span className="document-summary__stat-label">活动</span>
            </div>
            <div className="document-summary__stat">
              <span className="document-summary__stat-value">{document.travelers.count}</span>
              <span className="document-summary__stat-label">人数</span>
            </div>
            <div className="document-summary__stat">
              <span className="document-summary__stat-value">¥{document.budget.total.toLocaleString()}</span>
              <span className="document-summary__stat-label">总预算</span>
            </div>
          </div>
        </div>

        {/* 活动分类 */}
        <div className="document-summary__card">
          <h3 className="document-summary__card-title">
            <span className="document-summary__card-icon">🎯</span>
            主要活动
          </h3>
          <div className="document-summary__categories">
            {topCategories.map(({ type, count }) => (
              <div key={type} className="document-summary__category">
                <span className="document-summary__category-icon">{getTypeIcon(type)}</span>
                <span className="document-summary__category-name">{getCategoryName(type)}</span>
                <span className="document-summary__category-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 预算分布 */}
        <div className="document-summary__card">
          <h3 className="document-summary__card-title">
            <span className="document-summary__card-icon">💰</span>
            预算分布
          </h3>
          <div className="document-summary__budget">
            {budgetBreakdown.map(({ category, amount, percentage }) => (
              <div key={category} className="document-summary__budget-item">
                <div className="document-summary__budget-header">
                  <span className="document-summary__budget-category">{category}</span>
                  <span className="document-summary__budget-amount">¥{amount.toLocaleString()}</span>
                </div>
                <div className="document-summary__budget-bar">
                  <div 
                    className="document-summary__budget-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="document-summary__budget-percentage">{percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 行程亮点 */}
        {highlights.length > 0 && (
          <div className="document-summary__card">
            <h3 className="document-summary__card-title">
              <span className="document-summary__card-icon">⭐</span>
              行程亮点
            </h3>
            <div className="document-summary__highlights">
              {highlights.map((highlight, index) => (
                <div key={index} className="document-summary__highlight">
                  <span className="document-summary__highlight-bullet">•</span>
                  <span className="document-summary__highlight-text">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 航班信息 */}
        {document.flights.length > 0 && (
          <div className="document-summary__card">
            <h3 className="document-summary__card-title">
              <span className="document-summary__card-icon">✈️</span>
              航班信息
            </h3>
            <div className="document-summary__flights">
              {document.flights.slice(0, 2).map((flight) => (
                <div key={flight.id} className="document-summary__flight">
                  <div className="document-summary__flight-route">
                    <span className="document-summary__flight-airport">{flight.departure.airport.code}</span>
                    <span className="document-summary__flight-arrow">→</span>
                    <span className="document-summary__flight-airport">{flight.arrival.airport.code}</span>
                  </div>
                  <div className="document-summary__flight-details">
                    <span className="document-summary__flight-airline">{flight.airline.name}</span>
                    <span className="document-summary__flight-price">¥{flight.price.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 酒店信息 */}
        {document.hotels.length > 0 && (
          <div className="document-summary__card">
            <h3 className="document-summary__card-title">
              <span className="document-summary__card-icon">🏨</span>
              住宿信息
            </h3>
            <div className="document-summary__hotels">
              {document.hotels.slice(0, 2).map((hotel) => (
                <div key={hotel.id} className="document-summary__hotel">
                  <div className="document-summary__hotel-name">{hotel.name}</div>
                  <div className="document-summary__hotel-details">
                    <span className="document-summary__hotel-rating">
                      {'⭐'.repeat(hotel.starRating)}
                    </span>
                    <span className="document-summary__hotel-location">{hotel.location.district}</span>
                  </div>
                  <div className="document-summary__hotel-price">
                    ¥{hotel.rooms[0]?.pricing.basePrice.toLocaleString()}/晚
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .document-summary {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-6);
          margin-bottom: var(--spacing-6);
          box-shadow: var(--shadow-sm);
        }

        .document-summary__title {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 var(--spacing-6) 0;
          text-align: center;
        }

        .document-summary__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-4);
        }

        .document-summary__card {
          background: var(--color-surface-secondary);
          border-radius: var(--radius-md);
          padding: var(--spacing-4);
          border: 1px solid var(--color-border);
        }

        .document-summary__card-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 var(--spacing-4) 0;
        }

        .document-summary__card-icon {
          font-size: var(--font-size-lg);
        }

        .document-summary__stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-3);
        }

        .document-summary__stat {
          text-align: center;
          padding: var(--spacing-3);
          background: var(--color-surface);
          border-radius: var(--radius-sm);
        }

        .document-summary__stat-value {
          display: block;
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: var(--spacing-1);
        }

        .document-summary__stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .document-summary__categories {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2);
        }

        .document-summary__category {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-2);
          background: var(--color-surface);
          border-radius: var(--radius-sm);
        }

        .document-summary__category-icon {
          font-size: var(--font-size-base);
          width: 20px;
          text-align: center;
        }

        .document-summary__category-name {
          flex: 1;
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
        }

        .document-summary__category-count {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-primary);
          background: var(--color-primary-light);
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: var(--radius-sm);
        }

        .document-summary__budget {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .document-summary__budget-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-1);
        }

        .document-summary__budget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .document-summary__budget-category {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          font-weight: 500;
        }

        .document-summary__budget-amount {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .document-summary__budget-bar {
          height: 6px;
          background: var(--color-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .document-summary__budget-fill {
          height: 100%;
          background: var(--color-primary);
          transition: width 0.3s ease;
        }

        .document-summary__budget-percentage {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          text-align: right;
        }

        .document-summary__highlights {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2);
        }

        .document-summary__highlight {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-2);
          padding: var(--spacing-2);
          background: var(--color-surface);
          border-radius: var(--radius-sm);
        }

        .document-summary__highlight-bullet {
          color: var(--color-primary);
          font-weight: bold;
          margin-top: 2px;
        }

        .document-summary__highlight-text {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          line-height: 1.4;
        }

        .document-summary__flights,
        .document-summary__hotels {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .document-summary__flight {
          padding: var(--spacing-3);
          background: var(--color-surface);
          border-radius: var(--radius-sm);
        }

        .document-summary__flight-route {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          margin-bottom: var(--spacing-2);
        }

        .document-summary__flight-airport {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .document-summary__flight-arrow {
          color: var(--color-text-secondary);
        }

        .document-summary__flight-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .document-summary__flight-airline {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }

        .document-summary__flight-price {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-primary);
        }

        .document-summary__hotel {
          padding: var(--spacing-3);
          background: var(--color-surface);
          border-radius: var(--radius-sm);
        }

        .document-summary__hotel-name {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-1);
        }

        .document-summary__hotel-details {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          margin-bottom: var(--spacing-1);
        }

        .document-summary__hotel-rating {
          font-size: var(--font-size-sm);
        }

        .document-summary__hotel-location {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }

        .document-summary__hotel-price {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .document-summary {
            padding: var(--spacing-4);
          }

          .document-summary__grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-3);
          }

          .document-summary__stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
