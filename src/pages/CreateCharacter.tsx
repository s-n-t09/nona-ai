import { useState } from 'react';
import type { FormEvent } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function CreateCharacter({ profile }: { profile: any }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isNsfw, setIsNsfw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = profile.settings?.theme || 'dark';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setError('');
    setLoading(true);

    try {
      const charData: any = {
        creatorId: auth.currentUser.uid,
        name,
        description,
        prompt,
        isPublic,
        isNsfw: profile.isAdult ? isNsfw : false,
        createdAt: new Date().toISOString()
      };

      if (imageUrl) {
        charData.imageUrl = imageUrl;
      }

      const docRef = await addDoc(collection(db, 'characters'), charData);
      navigate(`/chat/${docRef.id}`);
    } catch (err: any) {
      console.error("Error creating character:", err);
      setError(err.message || "Failed to create character");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className={clsx("text-3xl font-bold", theme === 'dark' ? "text-zinc-50" : "text-zinc-900")}>Create Character</h1>
          <p className="text-zinc-400 mt-2">Design a new AI personality to chat with.</p>
        </header>

        <form onSubmit={handleSubmit} className={clsx(
          "space-y-6 border rounded-2xl p-6 md:p-8 transition-colors",
          theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
        )}>
          {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Character Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gandalf, Cyberpunk Hacker, Helpful Assistant"
              className={clsx(
                "w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors",
                theme === 'dark' ? "bg-zinc-950 border-zinc-800 text-zinc-50" : "bg-zinc-50 border-zinc-200 text-zinc-900"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Short Description</label>
            <input 
              type="text" 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief tagline for your character"
              className={clsx(
                "w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors",
                theme === 'dark' ? "bg-zinc-950 border-zinc-800 text-zinc-50" : "bg-zinc-50 border-zinc-200 text-zinc-900"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Image URL (Optional)</label>
            <input 
              type="url" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={clsx(
                "w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors",
                theme === 'dark' ? "bg-zinc-950 border-zinc-800 text-zinc-50" : "bg-zinc-50 border-zinc-200 text-zinc-900"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">System Prompt / Personality</label>
            <textarea 
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how the character should behave, their background, tone of voice, etc."
              rows={6}
              className={clsx(
                "w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors resize-none",
                theme === 'dark' ? "bg-zinc-950 border-zinc-800 text-zinc-50" : "bg-zinc-50 border-zinc-200 text-zinc-900"
              )}
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500 bg-zinc-950"
              />
              <span className="text-sm text-zinc-400">Make Public</span>
            </label>

            {profile.isAdult && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isNsfw}
                  onChange={(e) => setIsNsfw(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500 bg-zinc-950"
                />
                <span className="text-sm text-zinc-400">Mark as NSFW</span>
              </label>
            )}
          </div>

          <div className={clsx("pt-4 border-t", theme === 'dark' ? "border-zinc-800" : "border-zinc-200")}>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
