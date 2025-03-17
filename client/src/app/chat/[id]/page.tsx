'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from "../../../contexts/AuthContext";
import { useConversation } from "../../../contexts/ConversationContext";
import ConversationHeader from '../../../components/ConversationHeader';
import MessageList from '../../../components/MessageList';
import MessageInput from '../../../components/MessageInput';

export default function ConversationPage() {
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();
  const { 
    currentConversation,
    messages,
    sendMessage,
    loadConversation,
    loading: conversationLoading
  } = useConversation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    
    if (id && typeof id === 'string') {
      loadConversation(id);
    }
  }, [id, loadConversation, mounted]);
  
  const handleSendMessage = (content: string) => {
    if (id && typeof id === 'string') {
      sendMessage(id, content);
    }
  };
  
  if (!mounted || loading || conversationLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will be redirected by the AuthContext
  }
  
  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Conversation non trouvée</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">La conversation que vous cherchez n'existe pas ou vous n'y avez pas accès.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      <ConversationHeader conversation={currentConversation} />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
} 