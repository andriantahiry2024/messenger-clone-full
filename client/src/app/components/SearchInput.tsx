import { useState, useRef, useEffect } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  onSearch,
  placeholder = 'Rechercher...',
  className = ''
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Gérer la recherche lorsque la valeur change
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      onSearch(query);
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [query, onSearch]);
  
  // Gérer l'effacement de la recherche
  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className={`flex items-center bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden transition-all ${
        isFocused ? 'ring-2 ring-primary' : ''
      }`}>
        {/* Icône de recherche */}
        <div className="pl-3 pr-2">
          <svg 
            className="w-5 h-5 text-gray-500 dark:text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        {/* Champ de recherche */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-2 px-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
        />
        
        {/* Bouton d'effacement */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-3 pl-1"
          >
            <svg 
              className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Raccourci clavier */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden md:flex items-center pointer-events-none">
        {!isFocused && !query && (
          <div className="bg-gray-200 dark:bg-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400">
            ⌘K
          </div>
        )}
      </div>
    </div>
  );
} 