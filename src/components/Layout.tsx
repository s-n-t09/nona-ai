import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { MessageSquare, PlusCircle, User, LogOut, Home, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

export default function Layout({ profile }: { profile: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = profile.settings?.theme || 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className={clsx(
      "min-h-screen flex flex-col md:flex-row transition-colors duration-300",
      theme === 'dark' ? "bg-zinc-950 text-zinc-50" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Mobile Header */}
      <div className={clsx(
        "md:hidden flex items-center justify-between p-4 border-b",
        theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="https://files.catbox.moe/obic5w.png" alt="Nona AI Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Nona AI</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={clsx(
        "w-full md:w-64 border-r flex flex-col transition-colors duration-300 absolute md:relative z-50 h-full md:h-auto",
        theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "transition-transform duration-300 ease-in-out"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="https://files.catbox.moe/obic5w.png" alt="Nona AI Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Nona AI</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 md:py-0 space-y-2">
          <Link to="/" className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            theme === 'dark' ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
          )}>
            <Home className={clsx("w-5 h-5", theme === 'dark' ? "text-zinc-400" : "text-zinc-500")} />
            <span>Home</span>
          </Link>
          <Link to="/chats" className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            theme === 'dark' ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
          )}>
            <MessageSquare className={clsx("w-5 h-5", theme === 'dark' ? "text-zinc-400" : "text-zinc-500")} />
            <span>Chats</span>
          </Link>
          <Link to="/create" className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            theme === 'dark' ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
          )}>
            <PlusCircle className={clsx("w-5 h-5", theme === 'dark' ? "text-zinc-400" : "text-zinc-500")} />
            <span>Create Character</span>
          </Link>
          <Link to="/profile" className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            theme === 'dark' ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
          )}>
            <User className={clsx("w-5 h-5", theme === 'dark' ? "text-zinc-400" : "text-zinc-500")} />
            <span>Profile</span>
          </Link>
        </nav>

        <div className={clsx(
          "p-4 border-t transition-colors duration-300",
          theme === 'dark' ? "border-zinc-800" : "border-zinc-200"
        )}>
          <div className="px-3 py-2 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Project Info</p>
            <p className="text-xs text-zinc-400">Author: S.N.T</p>
          </div>
          <button 
            onClick={handleLogout}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 w-full text-left rounded-md transition-colors text-red-400 hover:text-red-300",
              theme === 'dark' ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-screen overflow-hidden relative z-0">
        <Outlet />
      </main>
    </div>
  );
}
