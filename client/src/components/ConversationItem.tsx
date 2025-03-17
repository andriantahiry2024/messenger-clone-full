import Link from 'next/link';

interface ConversationItemProps {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
  isActive?: boolean;
  unreadCount?: number;
}

export default function ConversationItem({
  id,
  name,
  avatar,
  lastMessage,
  time,
  isOnline,
  isActive = false,
  unreadCount = 0
}: ConversationItemProps) {
  // Extraire les initiales du nom pour l'avatar
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Link href={`/chat/${id}`}>
      <div 
        className={`p-4 cursor-pointer ${
          isActive 
            ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center">
          <div className="relative">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                {initials}
              </div>
            )}
            <span 
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{name}</p>
              <p className="text-xs text-gray-500">{time}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
              {unreadCount > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 