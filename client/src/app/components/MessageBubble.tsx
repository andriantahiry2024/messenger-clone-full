import { useState } from 'react';
import Image from 'next/image';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  sender?: {
    name: string;
    avatar?: string;
  };
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export default function MessageBubble({
  content,
  timestamp,
  isOwn,
  sender,
  status = 'sent',
  reactions = []
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  // Emojis disponibles pour les réactions
  const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
  
  // Formater l'heure du message
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && sender && (
        <div className="flex-shrink-0 mr-2">
          {sender.avatar ? (
            <Image
              src={sender.avatar}
              alt={sender.name}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {sender.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className={`max-w-[70%] relative`}>
        {!isOwn && sender && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
            {sender.name}
          </div>
        )}
        
        <div
          className={`relative rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs opacity-70">{formattedTime}</span>
            {isOwn && (
              <span className="text-xs ml-2">
                {status === 'read' ? (
                  <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : status === 'delivered' ? (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </span>
            )}
          </div>
          
          {/* Affichage des réactions */}
          {reactions.length > 0 && (
            <div className="absolute bottom-0 transform translate-y-1/2 left-2 bg-white dark:bg-gray-800 rounded-full shadow-md px-2 py-1 flex space-x-1">
              {reactions.map((reaction, index) => (
                <div key={index} className="flex items-center">
                  <span>{reaction.emoji}</span>
                  {reaction.count > 1 && (
                    <span className="text-xs ml-1">{reaction.count}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Bouton pour afficher le sélecteur de réactions */}
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="absolute top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity"
          style={{ [isOwn ? 'left' : 'right']: '-20px' }}
        >
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {/* Sélecteur de réactions */}
        {showReactionPicker && (
          <div className="absolute z-10 bg-white dark:bg-gray-800 rounded-full shadow-lg p-1 flex space-x-1 transition-all"
               style={{ [isOwn ? 'right' : 'left']: '0', bottom: '-30px' }}>
            {availableReactions.map((emoji, index) => (
              <button
                key={index}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-colors"
                onClick={() => {
                  // Logique pour ajouter une réaction
                  setShowReactionPicker(false);
                }}
              >
                <span className="text-lg">{emoji}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 