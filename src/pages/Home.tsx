import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, or, and } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';
import { MessageSquare, Search } from 'lucide-react';
import clsx from 'clsx';

export default function Home({ profile }: { profile: any }) {
  const [characters, setCharacters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const theme = profile.settings?.theme || 'dark';

  useEffect(() => {
    const fetchCharacters = async () => {
      if (!auth.currentUser) return;
      
      try {
        const charsRef = collection(db, 'characters');
        
        // Build query based on age
        let q;
        if (profile.isAdult) {
          // Adults can see all public characters + their own
          q = query(charsRef, or(
            where('isPublic', '==', true),
            where('creatorId', '==', auth.currentUser.uid)
          ));
        } else {
          // Minors can see public SFW characters + their own (which should be SFW)
          q = query(charsRef, or(
            and(where('isPublic', '==', true), where('isNsfw', '==', false)),
            where('creatorId', '==', auth.currentUser.uid)
          ));
        }
        
        const snapshot = await getDocs(q);
        let chars = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        
        // Client-side filtering for NSFW based on user settings and age
        chars = chars.filter(c => {
          const isOwn = c.creatorId === auth.currentUser?.uid;
          if (isOwn) return true;
          
          if (c.isNsfw) {
            return profile.isAdult && profile.settings?.showNsfw;
          }
          return true;
        });

        setCharacters(chars);
      } catch (error) {
        console.error("Error fetching characters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [profile]);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className={clsx("text-3xl font-bold", theme === 'dark' ? "text-zinc-50" : "text-zinc-900")}>Discover Characters</h1>
              <p className="text-zinc-400 mt-2">Chat with AI personalities created by the community.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={clsx(
                  "w-full border rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors",
                  theme === 'dark' ? "bg-zinc-900 border-zinc-800 text-zinc-50" : "bg-white border-zinc-200 text-zinc-900"
                )}
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-zinc-400">Loading characters...</div>
        ) : characters.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <div className={clsx(
            "text-center py-20 rounded-2xl border",
            theme === 'dark' ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <p className="text-zinc-400 mb-4">No characters found.</p>
            <Link to="/create" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters
              .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(char => (
              <Link 
                key={char.id} 
                to={`/chat/${char.id}`}
                className={clsx(
                  "group border rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-lg flex flex-col",
                  theme === 'dark' ? "bg-zinc-900 border-zinc-800 hover:shadow-indigo-500/10" : "bg-white border-zinc-200 hover:shadow-zinc-200"
                )}
              >
                <div className={clsx("aspect-square relative", theme === 'dark' ? "bg-zinc-800" : "bg-zinc-100")}>
                  {char.imageUrl ? (
                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className={clsx("w-full h-full flex items-center justify-center text-4xl font-bold", theme === 'dark' ? "text-zinc-700" : "text-zinc-300")}>
                      {char.name.charAt(0)}
                    </div>
                  )}
                  {char.isNsfw && (
                    <div className="absolute top-3 right-3 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-sm">
                      NSFW
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className={clsx("font-bold text-lg group-hover:text-indigo-400 transition-colors", theme === 'dark' ? "text-zinc-100" : "text-zinc-900")}>{char.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2 flex-1">{char.description || char.prompt}</p>
                  <div className="mt-4 flex items-center text-xs text-zinc-500 gap-2">
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
