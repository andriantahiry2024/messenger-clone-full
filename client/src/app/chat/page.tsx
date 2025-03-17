'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useConversation } from "../contexts/ConversationContext";

export default function ChatPage() {
  const { user } = useAuth();
  const { searchUsers, createConversation } = useConversation();
  const router = useRouter();
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleNewConversation = () => {
    setShowNewConversationModal(true);
    setSearchQuery("");
    setSearchResults([]);
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Erreur lors de la recherche d'utilisateurs:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const startConversation = async (userId: string) => {
    try {
      const conversationId = await createConversation([userId]);
      router.push(`/chat/${conversationId}`);
      setShowNewConversationModal(false);
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <svg
            className="h-12 w-12 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Bienvenue sur MessengerClone
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sélectionnez une conversation ou commencez une nouvelle discussion pour envoyer un message.
        </p>
        <button
          className="btn-primary"
          onClick={handleNewConversation}
        >
          Nouvelle conversation
        </button>
      </div>
      
      {/* Modal pour nouvelle conversation */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Nouvelle conversation
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowNewConversationModal(false)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="input-field pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button type="submit" className="sr-only">Rechercher</button>
            </form>
            
            <div className="max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((result) => (
                    <li key={result.id} className="py-3">
                      <button
                        className="w-full flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md"
                        onClick={() => startConversation(result.id)}
                      >
                        <div className="avatar h-10 w-10">
                          {result.avatar ? (
                            <img
                              src={result.avatar}
                              alt={result.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>
                              {result.name.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div className="ml-3 text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {result.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{result.username}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : searchQuery.trim() !== "" ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucun utilisateur trouvé
                </p>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Recherchez un utilisateur pour commencer une conversation
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 