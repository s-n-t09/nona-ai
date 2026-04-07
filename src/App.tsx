import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import Layout from './components/Layout';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import CreateCharacter from './pages/CreateCharacter';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ChatsList from './pages/ChatsList';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (profileDoc) => {
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setProfile(data);
            
            // Apply theme
            const theme = data.settings?.theme || 'dark';
            if (theme === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching profile:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
        if (unsubscribeProfile) unsubscribeProfile();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        {user && !profile && <Route path="/onboarding" element={<Onboarding onComplete={setProfile} />} />}
        
        <Route path="/" element={user ? (profile ? <Layout profile={profile} /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />}>
          <Route index element={<Home profile={profile} />} />
          <Route path="create" element={<CreateCharacter profile={profile} />} />
          <Route path="chat/:characterId" element={<Chat profile={profile} />} />
          <Route path="profile" element={<Profile profile={profile} />} />
          <Route path="chats" element={<ChatsList profile={profile} />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
