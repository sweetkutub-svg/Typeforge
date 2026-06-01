import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { BarChart2, BookOpen, Menu, X, Keyboard, Trophy, Type, AlignLeft, Zap, Gamepad2 } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export const Navbar = () => {
  const { pathname } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    // Clear all local storage tokens
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) localStorage.removeItem(key);
    });
    setUser(null);
    window.location.href = '/';
  };

  const links = [
    { href: '/',           label: 'Home',       icon: <Keyboard size={14} /> },
    { href: '/lessons',    label: 'Lessons',    icon: <BookOpen size={14} /> },
    { href: '/char-drill', label: 'Char Drill',  icon: <Type size={14} /> },
    { href: '/paragraph',  label: 'Paragraph',  icon: <AlignLeft size={14} /> },
    { href: '/speed',      label: 'Speed Test',  icon: <Zap size={14} /> },
    { href: '/games',      label: 'Games',       icon: <Gamepad2 size={14} /> },
    { href: '/rank',       label: 'Rank',        icon: <Trophy size={14} /> },
    { href: '/dashboard',  label: 'Dashboard',   icon: <BarChart2 size={14} /> },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b border-border"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-bg font-black text-sm transition-all group-hover:shadow-glow">
              <Keyboard size={14} />
            </div>
            <span className="font-black text-white tracking-tight">
              Type<span className="text-accent">Forge</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {links.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-white hover:bg-surface',
                ].join(' ')}
              >
                {icon}{label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                {user.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="" className="w-7 h-7 rounded-full border border-border" />
                  : <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold border border-accent/30">
                      {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase()}
                    </div>
                }
                <span className="text-white text-sm font-semibold max-w-[120px] truncate">
                  {user.user_metadata?.full_name
                    || user.user_metadata?.name
                    || user.email?.split('@')[0]}
                </span>
                <button onClick={handleLogout}
                  className="px-3 py-1.5 border border-border text-text-secondary text-xs font-semibold rounded-xl hover:border-red-500 hover:text-red-400 transition-all">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="hidden lg:block px-4 py-1.5 border border-border text-white text-sm font-semibold rounded-xl hover:border-accent/50 hover:text-accent transition-all flex-shrink-0"
              >
                Login
              </button>
            )}
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="lg:hidden text-text-secondary hover:text-white p-1"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-surface border-t border-border px-4 py-3 flex flex-col gap-1">
            {links.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={[
                  'flex items-center gap-2 text-sm font-medium py-2 px-2 rounded-lg transition-all',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-accent hover:bg-surface',
                ].join(' ')}
              >
                {icon}{label}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => { setShowAuth(true); setMenuOpen(false); }}
                className="text-left text-sm font-medium text-text-secondary hover:text-accent py-1.5 px-2 w-full"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onGuest={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;