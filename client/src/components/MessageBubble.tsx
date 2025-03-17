interface MessageBubbleProps {
  content: string;
  time: string;
  isCurrentUser: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  reactions?: Array<{
    emoji: string;
    count: number;
    users?: string[];
  }>;
  onReactionClick?: (emoji: string) => void;
}

export default function MessageBubble({
  content,
  time,
  isCurrentUser,
  senderName,
  senderAvatar,
  isRead = false,
  reactions = [],
  onReactionClick
}: MessageBubbleProps) {
  // Extraire les initiales du nom pour l'avatar
  const initials = senderName
    ? senderName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : '';

  // Liste d'emojis pour les réactions rapides
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className={`flex items-end ${isCurrentUser ? 'justify-end' : ''}`}>
      {!isCurrentUser && (
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
        <div
          className={`relative p-3 rounded-lg group ${
            isCurrentUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
          }`}
        >
          <p>{content}</p>
          
          {reactions.length > 0 && (
            <div className="flex mt-2 -mb-1 -mr-1">
              {reactions.map((reaction, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs flex items-center mr-1 shadow-sm"
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span className="text-gray-600 dark:text-gray-400">{reaction.count}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Menu de réactions rapides (visible au survol) */}
          {onReactionClick && (
            <div className="absolute -top-10 left-0 bg-white dark:bg-gray-800 rounded-full shadow-lg p-1 hidden group-hover:flex">
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  onClick={() => onReactionClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={`flex text-xs text-gray-500 mt-1 ${isCurrentUser ? 'justify-end' : ''}`}>
          <span>{time}</span>
          {isCurrentUser && isRead && (
            <span className="ml-1 text-blue-500">
              <svg
                className="h-3 w-3 inline"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 