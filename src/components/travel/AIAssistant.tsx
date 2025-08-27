'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistantStore } from '@/stores/aiAssistantStore';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { state, sendMessage } = useAIAssistantStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  // Focus input when assistant opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isProcessing) return;

    const message = inputValue.trim();
    setInputValue('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('AI Assistant error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-overlay" onClick={onClose}>
      <div className="ai-assistant" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-assistant__header">
          <div className="ai-assistant__title">
            <div className="ai-assistant__avatar">🤖</div>
            <h3>AI旅行助手</h3>
            <div className={`ai-assistant__status ${state.isProcessing ? 'processing' : 'ready'}`}>
              {state.isProcessing ? '思考中...' : '在线'}
            </div>
          </div>
          <button
            className="ai-assistant__close"
            onClick={onClose}
            aria-label="关闭AI助手"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="ai-assistant__messages">
          {state.chatHistory.length === 0 && (
            <div className="ai-assistant__message ai-assistant__message--assistant">
              <div className="ai-assistant__message-content">
                你好！我是你的AI旅行助手。我可以帮你调整行程、推荐景点、查找酒店等。有什么需要帮助的吗？
              </div>
            </div>
          )}
          {state.chatHistory.map((message) => (
            <div
              key={message.id}
              className={`ai-assistant__message ai-assistant__message--${message.type.toLowerCase()}`}
            >
              <div className="ai-assistant__message-content">
                {message.content}
              </div>
              <div className="ai-assistant__message-time">
                {message.timestamp.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
          {state.isProcessing && (
            <div className="ai-assistant__message ai-assistant__message--assistant">
              <div className="ai-assistant__message-content">
                <div className="ai-assistant__typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="ai-assistant__input-form" onSubmit={handleSubmit}>
          <div className="ai-assistant__input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的需求，比如：调整第三天的行程..."
              className="ai-assistant__input"
              disabled={state.isProcessing}
            />
            <button
              type="submit"
              className="ai-assistant__send"
              disabled={!inputValue.trim() || state.isProcessing}
              aria-label="发送消息"
            >
              {state.isProcessing ? '⏳' : '➤'}
            </button>
          </div>
          <div className="ai-assistant__shortcuts">
            <span>快捷键：Ctrl+/ 打开助手，Esc 关闭</span>
          </div>
        </form>
      </div>

      <style jsx>{`
        .ai-assistant-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .ai-assistant {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .ai-assistant__header {
          padding: var(--spacing-4);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ai-assistant__title {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
        }

        .ai-assistant__avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .ai-assistant__title h3 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .ai-assistant__status {
          padding: var(--spacing-1) var(--spacing-2);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }

        .ai-assistant__status.ready {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .ai-assistant__status.processing {
          background: var(--color-warning-light);
          color: var(--color-warning);
        }

        .ai-assistant__close {
          background: none;
          border: none;
          font-size: 18px;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--spacing-2);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .ai-assistant__close:hover {
          background: var(--color-surface-hover);
          color: var(--color-text-primary);
        }

        .ai-assistant__messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-4);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .ai-assistant__message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .ai-assistant__message--user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .ai-assistant__message--assistant {
          align-self: flex-start;
          align-items: flex-start;
        }

        .ai-assistant__message-content {
          padding: var(--spacing-3);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
          line-height: 1.5;
        }

        .ai-assistant__message--user .ai-assistant__message-content {
          background: var(--color-primary);
          color: white;
        }

        .ai-assistant__message--assistant .ai-assistant__message-content {
          background: var(--color-surface-secondary);
          color: var(--color-text-primary);
        }

        .ai-assistant__message-time {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          margin-top: var(--spacing-1);
        }

        .ai-assistant__typing {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .ai-assistant__typing span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-text-secondary);
          animation: typing 1.4s infinite ease-in-out;
        }

        .ai-assistant__typing span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .ai-assistant__typing span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .ai-assistant__input-form {
          padding: var(--spacing-4);
          border-top: 1px solid var(--color-border);
        }

        .ai-assistant__input-container {
          display: flex;
          gap: var(--spacing-2);
          align-items: center;
        }

        .ai-assistant__input {
          flex: 1;
          padding: var(--spacing-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
          background: var(--color-surface);
          color: var(--color-text-primary);
          transition: border-color 0.2s ease;
        }

        .ai-assistant__input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .ai-assistant__input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ai-assistant__send {
          padding: var(--spacing-3);
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
          min-width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-assistant__send:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        .ai-assistant__send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .ai-assistant__shortcuts {
          margin-top: var(--spacing-2);
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          text-align: center;
        }

        @media (max-width: 768px) {
          .ai-assistant-overlay {
            padding: 0;
          }

          .ai-assistant {
            max-width: none;
            max-height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};
