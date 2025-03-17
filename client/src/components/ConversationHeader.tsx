'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Conversation } from '../contexts/ConversationContext';

interface ConversationHeaderProps {
  conversation: Conversation;
}

export default function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const router = useRouter();
  
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center">
      <div className="avatar h-10 w-10 relative">
        {conversation.avatar ? (
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{conversation.name.split(' ').map(n => n[0]).join('')}</span>
        )}
        {conversation.isOnline && <span className="online-indicator"></span>}
      </div>
      <div className="ml-3 flex-1">
        <p className="font-medium text-gray-900 dark:text-gray-100">{conversation.name}</p>
        <p className="text-sm text-green-500">{conversation.isOnline ? 'En ligne' : 'Hors ligne'}</p>
      </div>
      <div className="flex space-x-2">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => router.push('/chat')}
        >
          <svg
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      </div>
    </div>
  );
} 