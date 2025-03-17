import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';
import SearchInput from './SearchInput';
import UserAvatar from './UserAvatar';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (userIds: string[]) => Promise<string>;
}

export default function NewConversationModal({
  isOpen,
  onClose,
  onCreateConversation
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Simuler le chargement des utilisateurs
  useEffect(() => {
    // Dans une application réelle, vous feriez un appel API ici
    const mockUsers: User[] = [
      { id: '1', name: 'Alice Martin', username: 'alice', status: 'online' },
      { id: '2', name: 'Bob Dupont', username: 'bob', status: 'offline' },
      { id: '3', name: 'Charlie Dubois', username: 'charlie', status: 'away' },
      { id: '4', name: 'David Moreau', username: 'david', status: 'busy' },
      { id: '5', name: 'Emma Petit', username: 'emma', status: 'online' },
    ];
    
    if (searchQuery) {
      const filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filteredUsers);
    } else {
      setUsers(mockUsers);
    }
  }, [searchQuery]);
  
  // Gérer la sélection d'un utilisateur
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  // Créer une nouvelle conversation
  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;
    
    setIsLoading(true);
    try {
      const userIds = selectedUsers.map(user => user.id);
      const conversationId = await onCreateConversation(userIds);
      
      // Rediriger vers la nouvelle conversation
      router.push(`/chat/${conversationId}`);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Nouvelle conversation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="Rechercher des contacts..."
            className="mb-4"
          />
          
          {/* Utilisateurs sélectionnés */}
          {selectedUsers.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1"
                >
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="ml-2 text-primary hover:text-primary-dark"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Liste des utilisateurs */}
          <div className="max-h-60 overflow-y-auto">
            {users.length > 0 ? (
              users.map(user => (
                <div
                  key={user.id}
                  onClick={() => toggleUserSelection(user)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.some(u => u.id === user.id)
                      ? 'bg-primary/10'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserAvatar
                    src={user.avatar}
                    alt={user.name}
                    status={user.status}
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </p>
                  </div>
                  {selectedUsers.some(u => u.id === user.id) && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Aucun utilisateur trouvé
              </p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            className="mr-2"
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0 || isLoading}
            isLoading={isLoading}
          >
            Créer
          </Button>
        </div>
      </div>
    </div>
  );
}