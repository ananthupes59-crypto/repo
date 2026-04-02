import React from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const Auth: React.FC = () => {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border-2 border-emerald-500" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <UserIcon className="text-white w-6 h-6" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-100">{user.displayName}</span>
          <span className="text-xs text-slate-400">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleLogin}
      className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-medium shadow-lg shadow-emerald-900/20 transition-all"
    >
      <LogIn className="w-5 h-5" />
      Sign in with Google
    </motion.button>
  );
};
