import { useEffect, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

export default function Chat({ profile }: { profile: any }) {
  const { characterId } = useParams();
  const navigate = useNavigate();
  
  const [character, setCharacter] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      if (!auth.currentUser || !characterId) return;

      try {
        // 1. Fetch character
        const charDoc = await getDoc(doc(db, 'characters', characterId));
        if (!charDoc.exists()) {
          navigate('/');
          return;
        }
        const charData = charDoc.data();
        
        // Age check for NSFW
        if (charData.isNsfw && !profile.isAdult && charData.creatorId !== auth.currentUser.uid) {
          navigate('/');
          return;
        }
        
        setCharacter({ id: charDoc.id, ...charData });

        // 2. Find or create chat session
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, 
          where('userId', '==', auth.currentUser.uid),
          where('characterId', '==', characterId)
        );
        
        const chatSnapshot = await getDocs(q);
        let currentChatId;
        
        if (chatSnapshot.empty) {
          const newChat = await addDoc(chatsRef, {
            userId: auth.currentUser.uid,
            characterId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          currentChatId = newChat.id;
        } else {
          currentChatId = chatSnapshot.docs[0].id;
        }
        
        setChatId(currentChatId);

        // 3. Listen to messages
        const messagesRef = collection(db, `chats/${currentChatId}/messages`);
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
        
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(msgs);
        });

        setLoading(false);
        return () => unsubscribe();

      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    initChat();
  }, [characterId, profile, navigate]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId || sending || !character) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    try {
      // 1. Save user message to Firestore
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      await addDoc(messagesRef, {
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString()
      });

      // Update chat updatedAt
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: new Date().toISOString()
      });

      // 2. Prepare messages for Groq API
      // We need to inject the user's display name into the system prompt
      const systemPrompt = `You are playing the role of the following character:\n\n${character.prompt}\n\nThe user you are talking to is named "${profile.displayName}". Always stay in character.`;
      
      // Get last 10 messages for context
      const recentMessages = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      recentMessages.push({ role: 'user', content: userMessage });

      // 3. Call our backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentMessages,
          systemPrompt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // 4. Save assistant message to Firestore
      await addDoc(messagesRef, {
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error sending message:", error);
      // Could add a toast notification here
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400">Loading chat...</div>;
  }

  if (!character) {
    return <div className="flex-1 flex items-center justify-center text-zinc-400">Character not found.</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      {/* Chat Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 shrink-0">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
            {character.imageUrl ? (
              <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-500">
                {character.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-zinc-50">{character.name}</h2>
            <p className="text-xs text-zinc-400">AI Character</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-zinc-700" />
            </div>
            <p>Start a conversation with {character.name}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={clsx(
                "flex max-w-[80%] gap-3",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden",
                msg.role === 'user' ? "bg-indigo-600" : "bg-zinc-800"
              )}>
                {msg.role === 'user' ? (
                  <span className="text-xs font-bold text-white">{profile.displayName.charAt(0)}</span>
                ) : character.imageUrl ? (
                  <img src={character.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xs font-bold text-zinc-400">{character.name.charAt(0)}</span>
                )}
              </div>
              <div className={clsx(
                "px-4 py-3 rounded-2xl whitespace-pre-wrap",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-zinc-800 text-zinc-100 rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex max-w-[80%] gap-3">
            <div className="w-8 h-8 rounded-full shrink-0 bg-zinc-800 flex items-center justify-center overflow-hidden">
              {character.imageUrl ? (
                <img src={character.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xs font-bold text-zinc-400">{character.name.charAt(0)}</span>
              )}
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-800 text-zinc-400 rounded-tl-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${character.name}...`}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-full pl-6 pr-14 py-4 text-zinc-50 focus:outline-none focus:border-indigo-500 transition-colors"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
