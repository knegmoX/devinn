'use client';

import React, { useEffect, useState } from 'react';
import { useTravelDocumentStore } from '@/stores/travelDocumentStore';
import { useAIAssistantStore } from '@/stores/aiAssistantStore';
import { TravelDocument as TravelDocumentType } from '@/types';
import { logger } from '@/lib/logger';
import { DayNavigation } from './DayNavigation';
import { SortableActivityList } from './SortableActivityList';
import { AIAssistant } from './AIAssistant';
import { DocumentHeader } from './DocumentHeader';
import { DocumentSummary } from './DocumentSummary';

interface TravelDocumentProps {
  documentId: string;
  initialDocument?: TravelDocumentType;
}

export const TravelDocument: React.FC<TravelDocumentProps> = ({
  documentId,
  initialDocument
}) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [isLoading, setIsLoading] = useState(!initialDocument);
  const [error, setError] = useState<string | null>(null);

  // Store hooks
  const {
    currentDocument,
    isLoading: storeLoading,
    error: storeError,
    loadDocument,
    setDocument,
    canUndo,
    canRedo,
    undo,
    redo
  } = useTravelDocumentStore();

  const { state, openAssistant, closeAssistant } = useAIAssistantStore();
  const aiAssistantVisible = state.isOpen;
  const toggleAIAssistant = () => {
    if (aiAssistantVisible) {
      closeAssistant();
    } else {
      openAssistant();
    }
  };

  // Load document on mount
  useEffect(() => {
    const initializeDocument = async () => {
      try {
        if (initialDocument) {
          setDocument(initialDocument);
          setIsLoading(false);
        } else {
          setIsLoading(true);
          await loadDocument(documentId);
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('Failed to load travel document', { error: err, documentId });
        setError(err instanceof Error ? err.message : 'Failed to load document');
        setIsLoading(false);
      }
    };

    initializeDocument();
  }, [documentId, initialDocument, loadDocument, setDocument]);

  // Update loading and error states from store
  useEffect(() => {
    setIsLoading(storeLoading);
    setError(storeError);
  }, [storeLoading, storeError]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            if (event.shiftKey && canRedo()) {
              event.preventDefault();
              redo();
            } else if (canUndo()) {
              event.preventDefault();
              undo();
            }
            break;
          case '/':
            event.preventDefault();
            toggleAIAssistant();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, toggleAIAssistant]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载旅行计划中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // No document state
  if (!currentDocument) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">未找到旅行计划</p>
        </div>
      </div>
    );
  }

  const currentDayData = currentDocument.itinerary[selectedDay - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Document Header */}
      <DocumentHeader 
        document={currentDocument}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Day Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <DayNavigation
                days={currentDocument.itinerary}
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
              />
              
              {/* Document Summary */}
              <div className="mt-6">
                <DocumentSummary document={currentDocument} />
              </div>
            </div>
          </div>

          {/* Main Content - Activities */}
          <div className="lg:col-span-3">
            {currentDayData ? (
              <div className="space-y-6">
                {/* Day Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {currentDayData.title}
                      </h1>
                      <p className="text-gray-600 mt-1">
                        第 {currentDayData.dayNumber} 天 • {currentDayData.date}
                      </p>
                    </div>
                    {currentDayData.weather && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">天气</div>
                        <div className="text-lg">
                          {currentDayData.weather.condition} {currentDayData.weather.temperature.min}-{currentDayData.weather.temperature.max}°C
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {currentDayData.theme && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      🎯 {currentDayData.theme}
                    </div>
                  )}
                </div>

                {/* Activities List */}
                <SortableActivityList
                  activities={currentDayData.activities}
                  dayNumber={currentDayData.dayNumber}
                />

                {/* Day Summary */}
                {currentDayData.dailySummary && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      今日总结
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ¥{currentDayData.dailySummary.totalCost}
                        </div>
                        <div className="text-sm text-gray-600">预计花费</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentDayData.dailySummary.walkingDistance}km
                        </div>
                        <div className="text-sm text-gray-600">步行距离</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {currentDayData.activities.length}
                        </div>
                        <div className="text-sm text-gray-600">活动数量</div>
                      </div>
                    </div>
                    
                    {currentDayData.dailySummary.highlights.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">今日亮点</h4>
                        <ul className="space-y-1">
                          {currentDayData.dailySummary.highlights.map((highlight, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <span className="text-yellow-500 mr-2">✨</span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  未找到该天的行程
                </h3>
                <p className="text-gray-600">
                  请选择其他日期查看行程安排。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={aiAssistantVisible}
        onClose={closeAssistant}
      />

      {/* Floating Action Button */}
      <button
        onClick={toggleAIAssistant}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-40"
        title="AI助手 (Ctrl+/)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
};

export default TravelDocument;
