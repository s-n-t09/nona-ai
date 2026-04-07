import { useState } from 'react';
import type { FormEvent } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { differenceInYears } from 'date-fns';

export default function Onboarding({ onComplete }: { onComplete: (profile: any) => void }) {
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setError('');
    setLoading(true);

    try {
      const dob = new Date(dateOfBirth);
      const age = differenceInYears(new Date(), dob);
      const isAdult = age >= 18;

      const profileData = {
        uid: auth.currentUser.uid,
        displayName,
        dateOfBirth,
        isAdult,
        settings: {
          showNsfw: false,
          theme: 'dark'
        },
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), profileData);
      onComplete(profileData);
      navigate('/');
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-zinc-50 mb-2">Complete your profile</h1>
        <p className="text-zinc-400 mb-6">Just a few more details before you can start chatting.</p>
        
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Display Name</label>
            <input 
              type="text" 
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should AI address you?"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-50 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Date of Birth</label>
            <input 
              type="date" 
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-50 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-zinc-500 mt-1">Used to determine access to mature content.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Saving...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
