import Image from 'next/image';

interface UserAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  className?: string;
}

export default function UserAvatar({
  src,
  alt,
  size = 'md',
  status = 'none',
  className = ''
}: UserAvatarProps) {
  // Définir les tailles en fonction de la prop size
  const sizeMap = {
    sm: {
      container: 'w-8 h-8',
      statusIndicator: 'w-2 h-2',
      fontSize: 'text-xs'
    },
    md: {
      container: 'w-10 h-10',
      statusIndicator: 'w-2.5 h-2.5',
      fontSize: 'text-sm'
    },
    lg: {
      container: 'w-12 h-12',
      statusIndicator: 'w-3 h-3',
      fontSize: 'text-base'
    },
    xl: {
      container: 'w-16 h-16',
      statusIndicator: 'w-4 h-4',
      fontSize: 'text-lg'
    }
  };

  // Définir les couleurs en fonction du statut
  const statusColorMap = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    none: ''
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 40 : 32}
          height={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 40 : 32}
          className={`rounded-full object-cover ${sizeMap[size].container}`}
        />
      ) : (
        <div className={`${sizeMap[size].container} rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center`}>
          <span className={`${sizeMap[size].fontSize} font-medium text-gray-700 dark:text-gray-300`}>
            {alt.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      {status !== 'none' && (
        <div className={`absolute bottom-0 right-0 ${sizeMap[size].statusIndicator} ${statusColorMap[status]} rounded-full border-2 border-white dark:border-gray-800`}></div>
      )}
    </div>
  );
}
