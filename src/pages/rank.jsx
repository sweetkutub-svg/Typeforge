import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// ─── Forge Points Calculator ───────────────────────────────────────────────
export const calcForgePoints = (wpm, accuracy, durationSeconds) => {
  const timeBonus = durationSeconds >= 300 ? 50
    : durationSeconds >= 180 ? 30
    : durationSeconds >= 60  ? 15
    : 5;
  return Math.round((wpm * (accuracy / 100)) + timeBonus);
};

// ─── Rank Tier ─────────────────────────────────────────────────────────────
const getTier = (fp) => {
  if (fp >= 2000) return { name: 'Grandmaster', color: '#ff4d6d', icon: '👑' };
  if (fp >= 1500) return { name: 'Master',      color: '#a78bfa', icon: '💜' };
  if (fp >= 1000) return { name: 'Diamond',     color: '#00d4ff', icon: '💎' };
  if (fp >= 600)  return { name: 'Gold',        color: '#fbbf24', icon: '🥇' };
  if (fp >= 300)  return { name: 'Silver',      color: '#94a3b8', icon: '🥈' };
  return           { name: 'Bronze',            color: '#cd7f32', icon: '🥉' };
};

const TABS = ['Daily', 'Weekly'];

// ─── Medal for top 3 ───────────────────────────────────────────────────────
const Medal = ({ rank }) => {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-text-secondary text-sm font-bold font-mono">
      {rank}
    </span>
  );
};

export default function Rank() {
  const [tab, setTab]         = useState(0); // 0=Daily, 1=Weekly
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [user, setUser]       = useState(null);
  const [myRank, setMyRank]   = useState(null);

  // ── Auth ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  // ── Fetch leaderboard ─────────────────────────────────────────────────
  useEffect(() => {
    fetchLeaderboard();
  }, [tab, user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      let since;
      if (tab === 0) {
        // Daily — from midnight today
        since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else {
        // Weekly — last 7 days
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        since = d.toISOString();
      }

      // Get cumulative FP from user_stats
      const { data, error: err } = await supabase
        .from('user_stats')
        .select('user_id, display_name, avatar_url, total_forge_points, best_wpm, best_accuracy, total_tests, updated_at')
        .gte('updated_at', since)
        .order('total_forge_points', { ascending: false })
        .limit(100);

      if (err) throw err;

      const sorted = (data || []).map(row => ({
        user_id: row.user_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        forge_points: row.total_forge_points,
        wpm: row.best_wpm,
        accuracy: row.best_accuracy,
        total_tests: row.total_tests,
      }));

      setEntries(sorted);

      // Find current user's rank
      if (user) {
        const idx = sorted.findIndex(e => e.user_id === user.id);
        setMyRank(idx >= 0 ? idx + 1 : null);
      } else {
        setMyRank(null);
      }
    } catch (e) {
      setError('Could not load leaderboard. Check your connection.');
    }
    setLoading(false);
  };

  // ── Google Login ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/rank' },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ── Current user row ──────────────────────────────────────────────────
  const myEntry = user ? entries.find(e => e.user_id === user.id) : null;
  const myTier  = myEntry ? getTier(myEntry.forge_points) : null;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-14 max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🏆</p>
          <h1 className="text-3xl font-black text-white mb-1">Leaderboard</h1>
          <p className="text-text-secondary text-sm">Top typists ranked by <span className="text-accent font-bold">Forge Points</span></p>
          <p className="text-text-secondary text-xs mt-1 opacity-60">
            Forge Points = (WPM × Accuracy%) + Time Bonus
          </p>
        </div>

        {/* Login CTA */}
        {!user && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-sm">Login to appear on the leaderboard</p>
              <p className="text-text-secondary text-xs mt-0.5">Complete speed tests to earn Forge Points</p>
            </div>
            <button onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </motion.div>
        )}

        {/* My rank card (if logged in and on leaderboard) */}
        {user && myEntry && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card mb-6 border-accent/40"
            style={{ background: 'rgba(0,255,159,0.04)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {myEntry.avatar_url
                    ? <img src={myEntry.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                    : <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                        {myEntry.display_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                  }
                  <span className="absolute -bottom-1 -right-1 text-sm">{myTier.icon}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{myEntry.display_name} <span className="text-accent text-xs">(You)</span></p>
                  <p className="text-xs" style={{ color: myTier.color }}>{myTier.name}</p>
                </div>
              </div>
              <div className="flex gap-5 items-center">
                <div className="text-center">
                  <p className="text-accent font-black text-xl">{myEntry.forge_points}</p>
                  <p className="text-text-secondary text-xs">FP</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">#{myRank ?? '—'}</p>
                  <p className="text-text-secondary text-xs">RANK</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">{myEntry.wpm}</p>
                  <p className="text-text-secondary text-xs">WPM</p>
                </div>
                <button onClick={handleLogout} className="text-text-secondary text-xs hover:text-red-400 transition-colors ml-2">
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-surface rounded-xl p-1 w-fit">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
                ${tab === i ? 'bg-accent text-bg' : 'text-text-secondary hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tier legend */}
        <div className="flex gap-2 flex-wrap mb-5">
          {[
            { fp: 0,    name: 'Bronze',      color: '#cd7f32', icon: '🥉' },
            { fp: 300,  name: 'Silver',      color: '#94a3b8', icon: '🥈' },
            { fp: 600,  name: 'Gold',        color: '#fbbf24', icon: '🥇' },
            { fp: 1000, name: 'Diamond',     color: '#00d4ff', icon: '💎' },
            { fp: 1500, name: 'Master',      color: '#a78bfa', icon: '💜' },
            { fp: 2000, name: 'Grandmaster', color: '#ff4d6d', icon: '👑' },
          ].map((tier) => (
            <div key={tier.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs">
              <span>{tier.icon}</span>
              <span style={{ color: tier.color }} className="font-semibold">{tier.name}</span>
              <span className="text-text-secondary opacity-50">{tier.fp}+ FP</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1fr_80px_70px_70px_80px] gap-2 px-4 py-3 border-b border-border bg-surface/50">
            <span className="text-text-secondary text-xs font-semibold">#</span>
            <span className="text-text-secondary text-xs font-semibold">Player</span>
            <span className="text-text-secondary text-xs font-semibold text-right">FP</span>
            <span className="text-text-secondary text-xs font-semibold text-right">WPM</span>
            <span className="text-text-secondary text-xs font-semibold text-right">ACC</span>
            <span className="text-text-secondary text-xs font-semibold text-right">Tier</span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary text-sm">Loading leaderboard...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={fetchLeaderboard} className="text-accent text-sm hover:underline">Try again</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-4xl">🏜️</p>
              <p className="text-white font-semibold">No entries yet</p>
              <p className="text-text-secondary text-sm">Be the first to complete a speed test!</p>
            </div>
          )}

          {/* Rows */}
          {!loading && !error && entries.map((entry, idx) => {
            const rank = idx + 1;
            const tier = getTier(entry.forge_points);
            const isMe = user && entry.user_id === user.id;

            return (
              <motion.div key={entry.user_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`grid grid-cols-[48px_1fr_80px_70px_70px_80px] gap-2 px-4 py-3 border-b border-border/50 items-center transition-colors
                  ${isMe ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-surface/50'}
                  ${rank <= 3 ? 'bg-yellow-500/3' : ''}`}>

                {/* Rank */}
                <div className="flex items-center">
                  <Medal rank={rank} />
                </div>

                {/* Player */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative flex-shrink-0">
                    {entry.avatar_url
                      ? <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      : <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary text-xs font-bold">
                          {entry.display_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-accent' : 'text-white'}`}>
                      {entry.display_name}
                      {isMe && <span className="text-xs text-accent opacity-70 ml-1">(you)</span>}
                    </p>
                  </div>
                </div>

                {/* Forge Points */}
                <div className="text-right">
                  <span className="text-accent font-black font-mono text-sm">{entry.forge_points}</span>
                </div>

                {/* WPM */}
                <div className="text-right">
                  <span className="text-white font-mono text-sm">{entry.wpm}</span>
                </div>

                {/* Accuracy */}
                <div className="text-right">
                  <span className="font-mono text-sm"
                    style={{ color: entry.accuracy >= 95 ? '#00ff9f' : entry.accuracy >= 85 ? '#fbbf24' : '#ff4d6d' }}>
                    {entry.accuracy}%
                  </span>
                </div>

                {/* Tier */}
                <div className="text-right flex items-center justify-end gap-1">
                  <span>{tier.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: tier.color }}>{tier.name}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-text-secondary text-xs mt-4 opacity-50">
          {tab === 0 ? 'Resets daily at midnight' : 'Resets every 7 days'} · Top 100 shown
        </p>

      </div>
    </div>
  );
}