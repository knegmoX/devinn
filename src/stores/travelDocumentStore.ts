import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  TravelDocument, 
  TravelDocumentStore, 
  Activity, 
  EditAction, 
  DragDropResult 
} from '@/types';
import { logger } from '@/lib/logger';

// 生成唯一ID的工具函数
const generateId = () => Math.random().toString(36).substr(2, 9);

// 创建编辑动作
const createEditAction = (
  type: EditAction['type'], 
  data: any, 
  undoData?: any
): EditAction => ({
  id: generateId(),
  type,
  timestamp: new Date(),
  data,
  undoData
});

export const useTravelDocumentStore = create<TravelDocumentStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        currentDocument: null,
        isLoading: false,
        error: null,
        editHistory: [],
        currentEditIndex: -1,

        // Actions
        setDocument: (document: TravelDocument) => {
          logger.info('Setting travel document', { documentId: document.id });
          set({ 
            currentDocument: document,
            editHistory: [],
            currentEditIndex: -1,
            error: null
          });
        },

        updateActivity: (activityId: string, updates: Partial<Activity>) => {
          const state = get();
          if (!state.currentDocument) return;

          logger.info('Updating activity', { activityId, updates });

          const document = { ...state.currentDocument };
          let activityFound = false;
          let originalActivity: Activity | null = null;

          // 查找并更新活动
          document.itinerary = document.itinerary.map(day => ({
            ...day,
            activities: day.activities.map(activity => {
              if (activity.id === activityId) {
                originalActivity = { ...activity };
                activityFound = true;
                return {
                  ...activity,
                  ...updates,
                  status: {
                    ...activity.status,
                    modified: true
                  }
                };
              }
              return activity;
            })
          }));

          if (!activityFound) {
            logger.warn('Activity not found for update', { activityId });
            return;
          }

          // 创建编辑动作
          const editAction = createEditAction(
            'EDIT',
            { activityId, updates },
            { activityId, originalData: originalActivity }
          );

          // 更新文档元数据
          document.metadata = {
            ...document.metadata,
            updatedAt: new Date(),
            userModified: true
          };

          set(state => ({
            currentDocument: document,
            editHistory: [...state.editHistory.slice(0, state.currentEditIndex + 1), editAction],
            currentEditIndex: state.currentEditIndex + 1
          }));
        },

        moveActivity: (result: DragDropResult) => {
          const state = get();
          if (!state.currentDocument) return;

          logger.info('Moving activity', result);

          const document = { ...state.currentDocument };
          let movedActivity: Activity | null = null;
          let sourceDay = -1;
          const destinationDay = result.destinationDay ?? result.sourceDay ?? 0;

          // 从源位置移除活动
          document.itinerary = document.itinerary.map((day, dayIndex) => {
            const activities = [...day.activities];
            
            if (dayIndex === (result.sourceDay ?? 0)) {
              sourceDay = dayIndex;
              if (activities[result.sourceIndex]) {
                movedActivity = activities[result.sourceIndex];
                activities.splice(result.sourceIndex, 1);
                
                // 重新排序剩余活动
                activities.forEach((activity, index) => {
                  activity.order = index;
                });
              }
            }
            
            return { ...day, activities };
          });

          // 添加到目标位置
          if (!movedActivity || destinationDay >= document.itinerary.length) {
            logger.warn('Failed to move activity: invalid activity or destination', { 
              movedActivity: !!movedActivity, 
              destinationDay, 
              totalDays: document.itinerary.length 
            });
            return;
          }

          const targetDay = { ...document.itinerary[destinationDay] };
          const activities = [...targetDay.activities];
          
          // 插入到指定位置 - TypeScript 类型断言确保 movedActivity 不为 null
          const activityToInsert: Activity = {
            ...movedActivity as Activity,
            order: result.destinationIndex,
            status: {
              ...(movedActivity as Activity).status,
              modified: true
            }
          };
          activities.splice(result.destinationIndex, 0, activityToInsert);
          
          // 重新排序所有活动
          activities.forEach((activity, index) => {
            activity.order = index;
          });
          
          document.itinerary[destinationDay] = { ...targetDay, activities };

          // 创建编辑动作
          const editAction = createEditAction(
            'MOVE',
            result,
            { 
              activityId: result.draggedId,
              originalSourceDay: sourceDay,
              originalSourceIndex: result.sourceIndex
            }
          );

          // 更新文档元数据
          document.metadata = {
            ...document.metadata,
            updatedAt: new Date(),
            userModified: true
          };

          set(state => ({
            currentDocument: document,
            editHistory: [...state.editHistory.slice(0, state.currentEditIndex + 1), editAction],
            currentEditIndex: state.currentEditIndex + 1
          }));
        },

        deleteActivity: (activityId: string) => {
          const state = get();
          if (!state.currentDocument) return;

          logger.info('Deleting activity', { activityId });

          const document = { ...state.currentDocument };
          let deletedActivity: Activity | null = null;
          let deletedFromDay = -1;
          let deletedFromIndex = -1;

          // 查找并删除活动
          document.itinerary = document.itinerary.map((day, dayIndex) => {
            const activities = day.activities.filter((activity, activityIndex) => {
              if (activity.id === activityId) {
                deletedActivity = { ...activity };
                deletedFromDay = dayIndex;
                deletedFromIndex = activityIndex;
                return false;
              }
              return true;
            });

            // 重新排序剩余活动
            activities.forEach((activity, index) => {
              activity.order = index;
            });

            return { ...day, activities };
          });

          if (!deletedActivity) {
            logger.warn('Activity not found for deletion', { activityId });
            return;
          }

          // 创建编辑动作
          const editAction = createEditAction(
            'DELETE',
            { activityId },
            { 
              activity: deletedActivity,
              dayIndex: deletedFromDay,
              activityIndex: deletedFromIndex
            }
          );

          // 更新文档元数据
          document.metadata = {
            ...document.metadata,
            updatedAt: new Date(),
            userModified: true
          };

          set(state => ({
            currentDocument: document,
            editHistory: [...state.editHistory.slice(0, state.currentEditIndex + 1), editAction],
            currentEditIndex: state.currentEditIndex + 1
          }));
        },

        addActivity: (dayNumber: number, activity: Omit<Activity, 'id' | 'order'>) => {
          const state = get();
          if (!state.currentDocument) return;

          logger.info('Adding activity', { dayNumber, activity: activity.title });

          const document = { ...state.currentDocument };
          const dayIndex = dayNumber - 1;

          if (dayIndex < 0 || dayIndex >= document.itinerary.length) {
            logger.warn('Invalid day number for adding activity', { dayNumber });
            return;
          }

          const newActivity: Activity = {
            ...activity,
            id: generateId(),
            order: document.itinerary[dayIndex].activities.length,
            userModifications: {
              priority: 'MEDIUM',
              bookmarked: false
            },
            status: {
              confirmed: false,
              modified: false,
              aiGenerated: false
            }
          };

          // 添加活动到指定天
          document.itinerary[dayIndex] = {
            ...document.itinerary[dayIndex],
            activities: [...document.itinerary[dayIndex].activities, newActivity]
          };

          // 创建编辑动作
          const editAction = createEditAction(
            'ADD',
            { dayNumber, activity: newActivity },
            { activityId: newActivity.id, dayIndex }
          );

          // 更新文档元数据
          document.metadata = {
            ...document.metadata,
            updatedAt: new Date(),
            userModified: true
          };

          set(state => ({
            currentDocument: document,
            editHistory: [...state.editHistory.slice(0, state.currentEditIndex + 1), editAction],
            currentEditIndex: state.currentEditIndex + 1
          }));
        },

        // Edit History
        addEditAction: (action: EditAction) => {
          set(state => ({
            editHistory: [...state.editHistory.slice(0, state.currentEditIndex + 1), action],
            currentEditIndex: state.currentEditIndex + 1
          }));
        },

        undo: () => {
          const state = get();
          if (!state.canUndo()) return;

          const action = state.editHistory[state.currentEditIndex];
          logger.info('Undoing action', { actionType: action.type, actionId: action.id });

          let document = state.currentDocument;
          if (!document) return;

          document = { ...document };

          try {
            switch (action.type) {
              case 'EDIT':
                if (action.undoData?.originalData) {
                  // 恢复原始活动数据
                  document.itinerary = document.itinerary.map(day => ({
                    ...day,
                    activities: day.activities.map(activity => 
                      activity.id === action.undoData.activityId 
                        ? action.undoData.originalData 
                        : activity
                    )
                  }));
                }
                break;

              case 'DELETE':
                if (action.undoData?.activity) {
                  // 恢复被删除的活动
                  const { activity, dayIndex, activityIndex } = action.undoData;
                  const targetDay = { ...document.itinerary[dayIndex] };
                  const activities = [...targetDay.activities];
                  activities.splice(activityIndex, 0, activity);
                  
                  // 重新排序
                  activities.forEach((act, index) => {
                    act.order = index;
                  });
                  
                  document.itinerary[dayIndex] = { ...targetDay, activities };
                }
                break;

              case 'ADD':
                if (action.undoData?.activityId) {
                  // 删除添加的活动
                  const { activityId, dayIndex } = action.undoData;
                  document.itinerary = document.itinerary.map((day, index) => {
                    if (index === dayIndex) {
                      return {
                        ...day,
                        activities: day.activities.filter(activity => activity.id !== activityId)
                      };
                    }
                    return day;
                  });
                }
                break;

              case 'MOVE':
                // 移动操作的撤销比较复杂，需要恢复到原始位置
                if (action.undoData?.originalSourceDay !== undefined) {
                  const { activityId, originalSourceDay, originalSourceIndex } = action.undoData;
                  
                  // 找到当前活动位置并移回原位置
                  let movedActivity: Activity | null = null;
                  
                  // 从当前位置移除
                  document.itinerary = document.itinerary.map(day => ({
                    ...day,
                    activities: day.activities.filter(activity => {
                      if (activity.id === activityId) {
                        movedActivity = activity;
                        return false;
                      }
                      return true;
                    })
                  }));
                  
                  // 恢复到原始位置
                  if (movedActivity && originalSourceDay < document.itinerary.length) {
                    const targetDay = { ...document.itinerary[originalSourceDay] };
                    const activities = [...targetDay.activities];
                    activities.splice(originalSourceIndex, 0, movedActivity);
                    
                    // 重新排序
                    activities.forEach((activity, index) => {
                      activity.order = index;
                    });
                    
                    document.itinerary[originalSourceDay] = { ...targetDay, activities };
                  }
                }
                break;
            }

            // 更新文档元数据
            document.metadata = {
              ...document.metadata,
              updatedAt: new Date(),
              userModified: true
            };

            set({
              currentDocument: document,
              currentEditIndex: state.currentEditIndex - 1
            });

          } catch (error) {
            logger.error('Failed to undo action', { error, action });
            set({ error: 'Failed to undo action' });
          }
        },

        redo: () => {
          const state = get();
          if (!state.canRedo()) return;

          const action = state.editHistory[state.currentEditIndex + 1];
          logger.info('Redoing action', { actionType: action.type, actionId: action.id });

          // 重新执行对应的操作
          switch (action.type) {
            case 'EDIT':
              state.updateActivity(action.data.activityId, action.data.updates);
              break;
            case 'DELETE':
              state.deleteActivity(action.data.activityId);
              break;
            case 'ADD':
              state.addActivity(action.data.dayNumber, action.data.activity);
              break;
            case 'MOVE':
              state.moveActivity(action.data);
              break;
          }
        },

        canUndo: () => {
          const state = get();
          return state.currentEditIndex >= 0;
        },

        canRedo: () => {
          const state = get();
          return state.currentEditIndex < state.editHistory.length - 1;
        },

        // Persistence
        saveDocument: async () => {
          const state = get();
          if (!state.currentDocument) return;

          set({ isLoading: true, error: null });

          try {
            logger.info('Saving travel document', { documentId: state.currentDocument.id });

            const response = await fetch(`/api/notes/${state.currentDocument.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(state.currentDocument),
            });

            if (!response.ok) {
              throw new Error('Failed to save document');
            }

            const savedDocument = await response.json();
            
            set({ 
              currentDocument: savedDocument,
              isLoading: false,
              error: null
            });

            logger.info('Document saved successfully', { documentId: savedDocument.id });

          } catch (error) {
            logger.error('Failed to save document', { error });
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to save document'
            });
            throw error;
          }
        },

        loadDocument: async (documentId: string) => {
          set({ isLoading: true, error: null });

          try {
            logger.info('Loading travel document', { documentId });

            const response = await fetch(`/api/notes/${documentId}`);
            
            if (!response.ok) {
              throw new Error('Failed to load document');
            }

            const document = await response.json();
            
            set({ 
              currentDocument: document,
              editHistory: [],
              currentEditIndex: -1,
              isLoading: false,
              error: null
            });

            logger.info('Document loaded successfully', { documentId });

          } catch (error) {
            logger.error('Failed to load document', { error, documentId });
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to load document'
            });
            throw error;
          }
        },
      }),
      {
        name: 'travel-document-store',
        partialize: (state) => ({
          currentDocument: state.currentDocument,
          editHistory: state.editHistory.slice(-10), // 只保存最近10个编辑动作
          currentEditIndex: Math.min(state.currentEditIndex, 9)
        }),
      }
    ),
    {
      name: 'travel-document-store',
    }
  )
);
