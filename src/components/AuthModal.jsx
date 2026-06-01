import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthModal = ({ onClose, onGuest }) => {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const handle = async () => {
    if (!supabase) { onGuest?.(); return; }
    setError('');
    if (tab === 'signup' && name.trim().length < 2) {
      setError('Please enter your full name.'); return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      } else {
        const { error: e } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name.trim() } },
        });
        if (e) throw e;
      }
      onClose?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-bg font-bold text-sm">T</div>
              <span className="font-bold text-white">TypeForge</span>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex rounded-xl border border-border overflow-hidden mb-5">
            {['login','signup'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold transition-all
                  ${tab === t ? 'bg-accent text-bg' : 'text-text-secondary hover:text-white'}`}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">

            {/* Google Login */}
            <button onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-secondary text-xs">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Name field (signup only) */}
            {tab === 'signup' && (
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full Name" type="text"
                className="bg-bg border border-border rounded-xl px-4 py-2.5 text-white placeholder-text-secondary text-sm outline-none focus:border-accent transition-all" />
            )}

            <input value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" type="email"
              className="bg-bg border border-border rounded-xl px-4 py-2.5 text-white placeholder-text-secondary text-sm outline-none focus:border-accent transition-all" />
            <div className="relative">
              <input value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" type={showPw ? 'text' : 'password'}
                className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white placeholder-text-secondary text-sm outline-none focus:border-accent transition-all" />
              <button onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p className="text-error text-xs">{error}</p>}
            <button onClick={handle} disabled={loading}
              className="w-full py-2.5 bg-accent text-bg font-bold rounded-xl hover:bg-accent-dim transition-all shadow-glow disabled:opacity-50">
              {loading ? 'Loading...' : tab === 'login' ? 'Login' : 'Sign Up'}
            </button>
            <button onClick={onGuest}
              className="w-full py-2.5 border border-border text-text-secondary rounded-xl hover:border-accent hover:text-accent transition-all text-sm font-semibold">
              Continue as Guest
            </button>
            <p className="text-center text-text-secondary text-xs flex items-center justify-center gap-1">
              <span className="text-accent">🔒</span> Secured by Supabase
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
