import Image from 'next/image';
import Link from 'next/link';

interface ConversationItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
  isActive?: boolean;
  isOnline?: boolean;
  unreadCount?: number;
}

export default function ConversationItem({
  id,
  name,
  avatar,
  lastMessage,
  isActive = false,
  isOnline = false,
  unreadCount = 0
}: ConversationItemProps) {
  // Formater l'heure du dernier message
  const formattedTime = lastMessage?.timestamp 
    ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';
  
  // Tronquer le contenu du dernier message s'il est trop long
  const truncatedContent = lastMessage?.content && lastMessage.content.length > 40
    ? `${lastMessage.content.substring(0, 40)}...`
    : lastMessage?.content;
  
  return (
    <Link 
      href={`/chat/${id}`}
      className={`flex items-center p-3 rounded-lg transition-colors relative ${
        isActive 
          ? 'bg-gray-100 dark:bg-gray-800' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-900'
      }`}
    >
      <div className="relative flex-shrink-0">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Indicateur de statut en ligne */}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={`text-sm font-medium truncate ${
            unreadCount > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {name}
          </h3>
          {lastMessage && (
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
              {formattedTime}
            </span>
          )}
        </div>
        
        {lastMessage && (
          <p className={`text-xs truncate mt-1 ${
            unreadCount > 0 
              ? 'text-gray-900 dark:text-gray-100 font-medium' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {truncatedContent}
          </p>
        )}
      </div>
      
      {/* Badge de messages non lus */}
      {unreadCount > 0 && (
        <div className="ml-2 bg-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </Link>
  );
} 