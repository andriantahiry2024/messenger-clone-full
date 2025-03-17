'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../contexts/ConversationContext';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-end max-w-[75%]">
              {message.senderId !== user?.id && (
                <div className="flex-shrink-0 mr-2">
                  <div className="avatar h-8 w-8">
                    {message.senderAvatar ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>
                        {message.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.senderId === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p>{message.content}</p>
                <div className="mt-1 text-xs flex justify-end">
                  <span className={`${
                    message.senderId === user?.id
                      ? 'text-blue-200'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.senderId === user?.id && (
                    <span className="ml-1">
                      {message.isRead ? (
                        <svg
                          className="h-3 w-3 text-blue-200 inline"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-3 w-3 text-blue-200 inline"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 