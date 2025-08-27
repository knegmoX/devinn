import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AIAssistantStore, 
  AIAssistantState, 
  ChatMessage, 
  AISuggestionEnhanced 
} from '@/types';
import { logger } from '@/lib/logger';

// 生成唯一ID的工具函数
const generateId = () => Math.random().toString(36).substr(2, 9);

// 初始状态
const initialState: AIAssistantState = {
  isOpen: false,
  mode: 'COLLAPSED',
  position: 'BOTTOM_RIGHT',
  chatHistory: [],
  currentInput: '',
  isProcessing: false,
  suggestions: [],
  activeSuggestion: undefined,
  currentContext: {
    documentId: '',
    activeDay: undefined,
    selectedActivity: undefined,
    lastAction: undefined
  }
};

export const useAIAssistantStore = create<AIAssistantStore>()(
  devtools(
    (set, get) => ({
      // State
      state: initialState,

      // Actions
      openAssistant: () => {
        logger.info('Opening AI assistant');
        set(state => ({
          state: {
            ...state.state,
            isOpen: true,
            mode: state.state.chatHistory.length > 0 ? 'CHAT_MODE' : 'QUICK_MENU'
          }
        }));
      },

      closeAssistant: () => {
        logger.info('Closing AI assistant');
        set(state => ({
          state: {
            ...state.state,
            isOpen: false,
            mode: 'COLLAPSED'
          }
        }));
      },

      setMode: (mode: AIAssistantState['mode']) => {
        logger.info('Setting AI assistant mode', { mode });
        set(state => ({
          state: {
            ...state.state,
            mode
          }
        }));
      },

      setPosition: (position: AIAssistantState['position']) => {
        logger.info('Setting AI assistant position', { position });
        set(state => ({
          state: {
            ...state.state,
            position
          }
        }));
      },

      // Chat
      addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date()
        };

        logger.info('Adding chat message', { 
          messageType: newMessage.type, 
          messageId: newMessage.id 
        });

        set(state => ({
          state: {
            ...state.state,
            chatHistory: [...state.state.chatHistory, newMessage],
            mode: 'CHAT_MODE'
          }
        }));
      },

      clearChat: () => {
        logger.info('Clearing chat history');
        set(state => ({
          state: {
            ...state.state,
            chatHistory: [],
            mode: 'QUICK_MENU'
          }
        }));
      },

      sendMessage: async (content: string) => {
        const state = get().state;
        
        if (state.isProcessing) {
          logger.warn('AI assistant is already processing a message');
          return;
        }

        logger.info('Sending message to AI assistant', { content });

        // 添加用户消息
        get().addMessage({
          type: 'USER',
          content,
          relatedContext: state.currentContext.documentId
        });

        // 设置处理状态
        set(currentState => ({
          state: {
            ...currentState.state,
            isProcessing: true,
            mode: 'PROCESSING'
          }
        }));

        try {
          // 构建请求数据
          const requestData = {
            message: content,
            context: state.currentContext,
            chatHistory: state.chatHistory.slice(-5) // 只发送最近5条消息作为上下文
          };

          // 调用AI API
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });

          if (!response.ok) {
            throw new Error('Failed to get AI response');
          }

          const aiResponse = await response.json();

          // 添加AI回复
          get().addMessage({
            type: 'ASSISTANT',
            content: aiResponse.message,
            relatedContext: state.currentContext.documentId
          });

          // 如果有建议，添加到建议列表
          if (aiResponse.suggestions && Array.isArray(aiResponse.suggestions)) {
            aiResponse.suggestions.forEach((suggestion: any) => {
              get().addSuggestion({
                id: generateId(),
                type: suggestion.type || 'TIP',
                title: suggestion.title,
                description: suggestion.description,
                priority: suggestion.priority || 1,
                relatedItems: suggestion.relatedItems || [],
                dismissible: true,
                action: suggestion.action ? {
                  type: suggestion.action.type,
                  label: suggestion.action.label,
                  handler: async () => {
                    // 这里可以实现具体的建议执行逻辑
                    logger.info('Executing AI suggestion', { suggestionId: suggestion.id });
                  }
                } : undefined
              });
            });
          }

          logger.info('AI response received successfully');

        } catch (error) {
          logger.error('Failed to send message to AI', { error, content });
          
          // 添加错误消息
          get().addMessage({
            type: 'ASSISTANT',
            content: '抱歉，我现在无法处理您的请求。请稍后再试。',
            relatedContext: state.currentContext.documentId
          });
        } finally {
          // 重置处理状态
          set(currentState => ({
            state: {
              ...currentState.state,
              isProcessing: false,
              mode: 'CHAT_MODE'
            }
          }));
        }
      },

      // Suggestions
      addSuggestion: (suggestion: AISuggestionEnhanced) => {
        logger.info('Adding AI suggestion', { 
          suggestionType: suggestion.type, 
          suggestionId: suggestion.id 
        });

        set(state => ({
          state: {
            ...state.state,
            suggestions: [...state.state.suggestions, suggestion]
          }
        }));

        // 如果有自动过期时间，设置定时器
        if (suggestion.autoExpire) {
          const timeoutMs = suggestion.autoExpire.getTime() - Date.now();
          if (timeoutMs > 0) {
            setTimeout(() => {
              get().dismissSuggestion(suggestion.id);
            }, timeoutMs);
          }
        }
      },

      dismissSuggestion: (suggestionId: string) => {
        logger.info('Dismissing AI suggestion', { suggestionId });

        set(state => ({
          state: {
            ...state.state,
            suggestions: state.state.suggestions.filter(s => s.id !== suggestionId),
            activeSuggestion: state.state.activeSuggestion === suggestionId 
              ? undefined 
              : state.state.activeSuggestion
          }
        }));
      },

      applySuggestion: async (suggestionId: string) => {
        const state = get().state;
        const suggestion = state.suggestions.find(s => s.id === suggestionId);

        if (!suggestion) {
          logger.warn('Suggestion not found for application', { suggestionId });
          return;
        }

        logger.info('Applying AI suggestion', { 
          suggestionId, 
          suggestionType: suggestion.type 
        });

        try {
          // 如果建议有处理函数，执行它
          if (suggestion.action?.handler) {
            await suggestion.action.handler();
          }

          // 添加确认消息到聊天
          get().addMessage({
            type: 'ASSISTANT',
            content: `已应用建议：${suggestion.title}`,
            relatedContext: state.currentContext.documentId
          });

          // 移除已应用的建议
          get().dismissSuggestion(suggestionId);

          logger.info('AI suggestion applied successfully', { suggestionId });

        } catch (error) {
          logger.error('Failed to apply AI suggestion', { error, suggestionId });
          
          // 添加错误消息
          get().addMessage({
            type: 'ASSISTANT',
            content: `应用建议时出错：${suggestion.title}。请稍后再试。`,
            relatedContext: state.currentContext.documentId
          });
        }
      },

      // Context
      setContext: (context: Partial<AIAssistantState['currentContext']>) => {
        logger.info('Setting AI assistant context', context);

        set(state => ({
          state: {
            ...state.state,
            currentContext: {
              ...state.state.currentContext,
              ...context
            }
          }
        }));
      },

      updateContext: (updates: Partial<AIAssistantState['currentContext']>) => {
        logger.info('Updating AI assistant context', updates);

        set(state => ({
          state: {
            ...state.state,
            currentContext: {
              ...state.state.currentContext,
              ...updates
            }
          }
        }));
      },
    }),
    {
      name: 'ai-assistant-store',
    }
  )
);

// 便捷的选择器函数
export const useAIAssistantSelectors = () => {
  const store = useAIAssistantStore();
  
  return {
    // 基础状态
    isOpen: store.state.isOpen,
    mode: store.state.mode,
    isProcessing: store.state.isProcessing,
    
    // 聊天相关
    chatHistory: store.state.chatHistory,
    hasMessages: store.state.chatHistory.length > 0,
    lastMessage: store.state.chatHistory[store.state.chatHistory.length - 1],
    
    // 建议相关
    suggestions: store.state.suggestions,
    hasSuggestions: store.state.suggestions.length > 0,
    urgentSuggestions: store.state.suggestions.filter(s => s.priority >= 3),
    
    // 上下文
    currentContext: store.state.currentContext,
    hasContext: !!store.state.currentContext.documentId,
    
    // 操作
    ...store
  };
};
