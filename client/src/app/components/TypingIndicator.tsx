import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  users?: string[];
  className?: string;
}

export default function TypingIndicator({
  users = [],
  className = ''
}: TypingIndicatorProps) {
  const [displayText, setDisplayText] = useState<string>('');
  
  useEffect(() => {
    if (users.length === 0) {
      setDisplayText('');
    } else if (users.length === 1) {
      setDisplayText(`${users[0]} est en train d'écrire...`);
    } else if (users.length === 2) {
      setDisplayText(`${users[0]} et ${users[1]} sont en train d'écrire...`);
    } else {
      setDisplayText(`${users[0]} et ${users.length - 1} autres sont en train d'écrire...`);
    }
  }, [users]);
  
  if (users.length === 0) return null;
  
  return (
    <div className={`flex items-center text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <div className="flex space-x-1 mr-2">
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{displayText}</span>
    </div>
  );
} 