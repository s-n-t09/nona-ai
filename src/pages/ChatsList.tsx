import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function ChatsList({ profile }: { profile: any }) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const theme = profile.settings?.theme || 'dark';

  useEffect(() => {
    const fetchChats = async () => {
      if (!auth.currentUser) return;
      
      try {
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        
        const chatsData = await Promise.all(snapshot.docs.map(async (chatDoc) => {
          const chat = { id: chatDoc.id, ...(chatDoc.data() as any) };
          
          // Fetch character info
          try {
            const charDoc = await getDoc(doc(db, 'characters', chat.characterId));
            if (charDoc.exists()) {
              chat.character = { id: charDoc.id, ...charDoc.data() as any };
            }
          } catch (e) {
            console.error("Error fetching character for chat", e);
          }
          
          return chat;
        }));
        
        // Sort by updatedAt descending
        chatsData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        setChats(chatsData);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth.currentUser) return;
    
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }
    
    setDeletingId(chatId);
    
    try {
      // 1. Delete all messages in the chat
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, `chats/${chatId}/messages`, messageDoc.id))
      );
      await Promise.all(deletePromises);
      
      // 2. Delete the chat document itself
      await deleteDoc(doc(db, 'chats', chatId));
      
      // 3. Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className={clsx("text-3xl font-bold", theme === 'dark' ? "text-zinc-50" : "text-zinc-900")}>Your Chats</h1>
          <p className="text-zinc-400 mt-2">Continue your conversations with AI characters.</p>
        </header>

        {loading ? (
          <div className="text-zinc-400">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className={clsx(
            "text-center py-20 rounded-2xl border",
            theme === 'dark' ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <p className="text-zinc-400 mb-4">You haven't started any chats yet.</p>
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Discover characters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className={clsx(
                  "group border rounded-xl p-4 flex gap-4 transition-all hover:border-indigo-500/50 hover:shadow-lg relative",
                  theme === 'dark' ? "bg-zinc-900 border-zinc-800 hover:shadow-indigo-500/10" : "bg-white border-zinc-200 hover:shadow-zinc-200"
                )}
              >
                <Link to={`/chat/${chat.characterId}`} className="absolute inset-0 z-0"></Link>
                <div className={clsx("w-16 h-16 rounded-lg shrink-0 overflow-hidden z-10 pointer-events-none", theme === 'dark' ? "bg-zinc-800" : "bg-zinc-100")}>
                  {chat.character?.imageUrl ? (
                    <img src={chat.character.imageUrl} alt={chat.character.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className={clsx("w-full h-full flex items-center justify-center text-2xl font-bold", theme === 'dark' ? "text-zinc-600" : "text-zinc-300")}>
                      {chat.character?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center z-10 pointer-events-none">
                  <h3 className={clsx("font-bold truncate group-hover:text-indigo-400 transition-colors", theme === 'dark' ? "text-zinc-100" : "text-zinc-900")}>
                    {chat.character?.name || 'Unknown Character'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                    <MessageSquare className="w-3 h-3" />
                    <span>Last active: {new Date(chat.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  disabled={deletingId === chat.id}
                  className={clsx(
                    "z-10 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity self-center",
                    theme === 'dark' ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-500",
                    deletingId === chat.id && "opacity-50 cursor-not-allowed"
                  )}
                  title="Delete chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
