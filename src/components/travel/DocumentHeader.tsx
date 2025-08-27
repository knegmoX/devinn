'use client';

import React, { useState } from 'react';
import { useTravelDocumentStore } from '@/stores/travelDocumentStore';
import { TravelDocument } from '@/types';

interface DocumentHeaderProps {
  document: TravelDocument;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ document }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(document.title);
  const { setDocument } = useTravelDocumentStore();

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== document.title) {
      const updatedDocument = {
        ...document,
        title: editTitle.trim(),
        metadata: {
          ...document.metadata,
          updatedAt: new Date(),
          userModified: true
        }
      };
      setDocument(updatedDocument);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(document.title);
      setIsEditing(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
    };

    if (start.getFullYear() !== new Date().getFullYear()) {
      options.year = 'numeric';
    }

    const startStr = start.toLocaleDateString('zh-CN', options);
    const endStr = end.toLocaleDateString('zh-CN', options);

    return `${startStr} - ${endStr}`;
  };

  const getTotalDays = () => {
    const start = new Date(document.dateRange.startDate);
    const end = new Date(document.dateRange.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  const getTotalBudget = () => {
    return document.budget.total;
  };

  const getWeatherInfo = () => {
    // This would typically come from a weather API
    // For now, return a placeholder
    return {
      temperature: '24-29°C',
      condition: '局部有雨',
      icon: '🌤️'
    };
  };

  const weather = getWeatherInfo();

  return (
    <div className="document-header">
      {/* Cover Image */}
      {document.coverImage && (
        <div className="document-header__cover">
          <img 
            src={document.coverImage} 
            alt={document.title}
            className="document-header__cover-image"
          />
          <div className="document-header__cover-overlay" />
        </div>
      )}

      {/* Header Content */}
      <div className="document-header__content">
        {/* Title Section */}
        <div className="document-header__title-section">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className="document-header__title-input"
              autoFocus
            />
          ) : (
            <h1 
              className="document-header__title"
              onClick={() => setIsEditing(true)}
              title="点击编辑标题"
            >
              {document.title}
              <span className="document-header__edit-icon">✏️</span>
            </h1>
          )}
        </div>

        {/* Meta Information */}
        <div className="document-header__meta">
          <div className="document-header__meta-item">
            <span className="document-header__meta-icon">📅</span>
            <div className="document-header__meta-content">
              <span className="document-header__meta-label">日期</span>
              <span className="document-header__meta-value">
                {formatDateRange(document.dateRange.startDate, document.dateRange.endDate)}
              </span>
            </div>
          </div>

          <div className="document-header__meta-item">
            <span className="document-header__meta-icon">⏱️</span>
            <div className="document-header__meta-content">
              <span className="document-header__meta-label">天数</span>
              <span className="document-header__meta-value">
                {getTotalDays()}天
              </span>
            </div>
          </div>

          <div className="document-header__meta-item">
            <span className="document-header__meta-icon">👥</span>
            <div className="document-header__meta-content">
              <span className="document-header__meta-label">人数</span>
              <span className="document-header__meta-value">
                {document.travelers.count}人 ({document.travelers.type})
              </span>
            </div>
          </div>

          <div className="document-header__meta-item">
            <span className="document-header__meta-icon">💰</span>
            <div className="document-header__meta-content">
              <span className="document-header__meta-label">预算</span>
              <span className="document-header__meta-value">
                ¥{getTotalBudget().toLocaleString()}
              </span>
            </div>
          </div>

          <div className="document-header__meta-item">
            <span className="document-header__meta-icon">{weather.icon}</span>
            <div className="document-header__meta-content">
              <span className="document-header__meta-label">天气</span>
              <span className="document-header__meta-value">
                {weather.temperature}, {weather.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Destination Info */}
        <div className="document-header__destination">
          <div className="document-header__destination-info">
            <span className="document-header__destination-icon">📍</span>
            <span className="document-header__destination-name">{document.destination}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .document-header {
          position: relative;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: var(--spacing-6);
          box-shadow: var(--shadow-sm);
        }

        .document-header__cover {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .document-header__cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .document-header__cover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.1) 0%,
            rgba(0, 0, 0, 0.3) 100%
          );
        }

        .document-header__content {
          padding: var(--spacing-6);
        }

        .document-header__title-section {
          margin-bottom: var(--spacing-4);
        }

        .document-header__title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          transition: color 0.2s ease;
        }

        .document-header__title:hover {
          color: var(--color-primary);
        }

        .document-header__edit-icon {
          opacity: 0;
          font-size: var(--font-size-sm);
          transition: opacity 0.2s ease;
        }

        .document-header__title:hover .document-header__edit-icon {
          opacity: 1;
        }

        .document-header__title-input {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
          background: var(--color-surface);
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-md);
          padding: var(--spacing-2);
          width: 100%;
          outline: none;
        }

        .document-header__subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          margin: var(--spacing-2) 0 0 0;
          font-weight: 400;
        }

        .document-header__meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-4);
        }

        .document-header__meta-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          padding: var(--spacing-3);
          background: var(--color-surface-secondary);
          border-radius: var(--radius-md);
        }

        .document-header__meta-icon {
          font-size: var(--font-size-lg);
          width: 24px;
          text-align: center;
        }

        .document-header__meta-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-1);
        }

        .document-header__meta-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .document-header__meta-value {
          font-size: var(--font-size-sm);
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .document-header__destination {
          margin-bottom: var(--spacing-4);
        }

        .document-header__destination-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          padding: var(--spacing-3) var(--spacing-4);
          background: var(--color-surface-secondary);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--color-primary);
        }

        .document-header__destination-icon {
          font-size: var(--font-size-lg);
        }

        .document-header__destination-name {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        @media (max-width: 768px) {
          .document-header__content {
            padding: var(--spacing-4);
          }

          .document-header__title {
            font-size: var(--font-size-xl);
          }

          .document-header__meta {
            grid-template-columns: 1fr;
            gap: var(--spacing-2);
          }

          .document-header__meta-item {
            padding: var(--spacing-2);
          }

          .document-header__cover {
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};
