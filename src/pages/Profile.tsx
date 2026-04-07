import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';
import { Trash2, Edit2, MessageSquare, Settings, User as UserIcon, Moon, Sun, Shield, Info } from 'lucide-react';
import clsx from 'clsx';

export default function Profile({ profile }: { profile: any }) {
  const [myCharacters, setMyCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'characters' | 'settings'>('characters');
  
  // Settings state
  const [newDisplayName, setNewDisplayName] = useState(profile.displayName);
  const [message, setMessage] = useState('');
  const theme = profile.settings?.theme || 'dark';

  const updateSetting = async (key: string, value: any) => {
    if (!auth.currentUser) return;
    try {
      if (key === 'displayName') {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: value
        });
      } else {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          [`settings.${key}`]: value
        });
      }
      setMessage('Settings updated.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating setting:", error);
      setMessage('Failed to update setting.');
    }
  };

  useEffect(() => {
    const fetchMyCharacters = async () => {
      if (!auth.currentUser) return;
      
      try {
        const charsRef = collection(db, 'characters');
        const q = query(charsRef, where('creatorId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        
        const chars = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setMyCharacters(chars);
      } catch (error) {
        console.error("Error fetching characters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCharacters();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this character?")) return;
    
    try {
      await deleteDoc(doc(db, 'characters', id));
      setMyCharacters(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  const handleUpdateSettings = async () => {
    // This is no longer needed as we auto-save
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className={clsx("text-3xl font-bold", theme === 'dark' ? "text-zinc-50" : "text-zinc-900")}>{profile.displayName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={clsx("px-2 py-1 rounded text-xs font-medium", theme === 'dark' ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600")}>
                {profile.isAdult ? '18+' : 'Under 18'}
              </span>
              <span className="text-sm text-zinc-500">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        <div className={clsx("flex border-b mb-8", theme === 'dark' ? "border-zinc-800" : "border-zinc-200")}>
          <button 
            onClick={() => setActiveTab('characters')}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'characters' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            My Characters
            {activeTab === 'characters' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === 'settings' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Settings
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
          </button>
        </div>

        {activeTab === 'characters' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={clsx("text-xl font-bold", theme === 'dark' ? "text-zinc-100" : "text-zinc-800")}>My Characters</h2>
              <Link to="/create" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                Create New
              </Link>
            </div>

            {loading ? (
              <div className="text-zinc-400">Loading your characters...</div>
            ) : myCharacters.length === 0 ? (
              <div className={clsx(
                "text-center py-12 rounded-2xl border",
                theme === 'dark' ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <p className="text-zinc-400 mb-4">You haven't created any characters yet.</p>
                <Link to="/create" className={clsx(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  theme === 'dark' ? "bg-white text-zinc-900 hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}>
                  Create your first character
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCharacters.map(char => (
                  <div key={char.id} className={clsx(
                    "border rounded-xl p-4 flex gap-4 transition-colors",
                    theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  )}>
                    <div className={clsx("w-16 h-16 rounded-lg shrink-0 overflow-hidden", theme === 'dark' ? "bg-zinc-800" : "bg-zinc-100")}>
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={clsx("w-full h-full flex items-center justify-center text-2xl font-bold", theme === 'dark' ? "text-zinc-600" : "text-zinc-300")}>
                          {char.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={clsx("font-bold truncate", theme === 'dark' ? "text-zinc-100" : "text-zinc-900")}>{char.name}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => handleDelete(char.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={clsx(
                          "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                          char.isPublic ? 'bg-green-500/20 text-green-400' : (theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500')
                        )}>
                          {char.isPublic ? 'Public' : 'Private'}
                        </span>
                        {char.isNsfw && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-red-500/20 text-red-400">
                            NSFW
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <Link 
                          to={`/chat/${char.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 max-w-2xl">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {message}
              </div>
            )}

            <section className="space-y-4">
              <div className={clsx("flex items-center gap-2 font-bold", theme === 'dark' ? "text-zinc-100" : "text-zinc-800")}>
                <UserIcon className="w-5 h-5 text-indigo-400" />
                <h3>Account Settings</h3>
              </div>
              <div className={clsx(
                "border rounded-xl p-6 space-y-4",
                theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                  <input 
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    onBlur={() => {
                      if (newDisplayName !== profile.displayName) {
                        updateSetting('displayName', newDisplayName);
                      }
                    }}
                    className={clsx(
                      "w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors",
                      theme === 'dark' ? "bg-zinc-950 border-zinc-800 text-zinc-50" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                    )}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className={clsx("flex items-center gap-2 font-bold", theme === 'dark' ? "text-zinc-100" : "text-zinc-800")}>
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3>Preferences</h3>
              </div>
              <div className={clsx(
                "border rounded-xl p-6 space-y-6",
                theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={clsx("flex items-center gap-2 font-medium", theme === 'dark' ? "text-zinc-100" : "text-zinc-800")}>
                      <Shield className="w-4 h-4 text-red-400" />
                      <span>Show NSFW Characters</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {profile.isAdult 
                        ? "Toggle visibility of mature content in discovery." 
                        : "Disabled for users under 18."}
                    </p>
                  </div>
                  <button 
                    disabled={!profile.isAdult}
                    onClick={() => {
                      const newValue = !(profile.settings?.showNsfw || false);
                      updateSetting('showNsfw', newValue);
                    }}
                    className={clsx(
                      "w-12 h-6 rounded-full transition-colors relative",
                      (profile.settings?.showNsfw || false) ? 'bg-indigo-600' : (theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-300'),
                      !profile.isAdult ? 'opacity-50 cursor-not-allowed' : ''
                    )}
                  >
                    <div className={clsx(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      (profile.settings?.showNsfw || false) ? 'left-7' : 'left-1'
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className={clsx("flex items-center gap-2 font-medium", theme === 'dark' ? "text-zinc-100" : "text-zinc-800")}>
                      {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                      <span>Theme</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Switch between dark and light mode.</p>
                  </div>
                  <div className={clsx(
                    "p-1 rounded-lg border flex",
                    theme === 'dark' ? "bg-zinc-950 border-zinc-800" : "bg-zinc-100 border-zinc-200"
                  )}>
                    <button 
                      onClick={() => updateSetting('theme', 'dark')}
                      className={clsx(
                        "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                        theme === 'dark' ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      Dark
                    </button>
                    <button 
                      onClick={() => updateSetting('theme', 'light')}
                      className={clsx(
                        "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                        theme === 'light' ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100" : "bg-white text-zinc-900 shadow-sm") : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className={clsx("flex items-center gap-2 font-bold", theme === 'dark' ? "text-zinc-100" : "text-zinc-800")}>
                <Info className="w-5 h-5 text-indigo-400" />
                <h3>About Nona AI</h3>
              </div>
              <div className={clsx(
                "border rounded-xl p-6",
                theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Nona AI is a modern platform for interacting with unique AI personalities. 
                  Users can discover, chat with, and create their own AI characters powered by advanced language models.
                </p>
                <div className={clsx("mt-4 pt-4 border-t flex justify-between items-center text-xs text-zinc-500", theme === 'dark' ? "border-zinc-800" : "border-zinc-200")}>
                  <span>Version 1.0.0</span>
                  <span>Author: S.N.T</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}