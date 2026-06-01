import { useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Navbar } from '../components/Navbar';
import { KeyboardHeatmap } from '../components/KeyboardHeatmap';
import { BadgeCard } from '../components/BadgeCard';
import { useProgress } from '../hooks/useProgress';
import { getKeyAccuracy } from '../lib/adaptive';
import { BADGES, getLevelFromXP } from '../lib/xp';

const StatCard = ({ label, value, sub }) => (
  <div className="card text-center">
    <div className="text-3xl font-bold font-mono text-accent">{value}</div>
    <div className="text-white font-semibold text-sm mt-1">{label}</div>
    {sub && <div className="text-text-secondary text-xs mt-0.5">{sub}</div>}
  </div>
);

export default function Dashboard() {
  const { progress } = useProgress();
  const reportRef = useRef(null);

  const sessions = progress.sessions ?? [];
  const keyAcc = getKeyAccuracy(progress.keyStats ?? {});
  const level = getLevelFromXP(progress.xp ?? 0);

  const chartData = sessions.slice(0, 14).reverse().map((s, i) => ({
    name: `S${i + 1}`,
    wpm: s.wpm,
    accuracy: s.accuracy,
  }));

  const avgWPM = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length)
    : 0;

  const hoursTotal = sessions.length ? (sessions.length * 1 / 60).toFixed(1) : 0;

  const exportReport = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0f0f0f' });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'typeforge-report.png';
    a.click();
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-14 max-w-7xl mx-auto px-4 py-10" ref={reportRef}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Progress Dashboard</h1>
            <p className="text-text-secondary mt-1">Level {level} · {progress.xp ?? 0} XP total</p>
          </div>
          <button onClick={exportReport}
            className="btn-secondary text-sm flex items-center gap-2">
            📷 Export Report
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total XP" value={progress.xp ?? 0} sub={`+${sessions[0]?.xp ?? 0} last session`} />
          <StatCard label="Avg WPM" value={avgWPM} sub={`+0 from last 7 days`} />
          <StatCard label="Day Streak" value={progress.streak ?? 0} sub="Best: keep going!" />
          <StatCard label="Hours Practiced" value={hoursTotal} sub={`${sessions.length} sessions`} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* WPM Chart */}
          <div className="card">
            <h2 className="text-white font-bold mb-4">WPM Over Time</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#888" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="wpm" stroke="#00ff9f" strokeWidth={2} dot={{ fill: '#00ff9f', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
                Complete sessions to see WPM progress
              </div>
            )}
          </div>

          {/* Keyboard Heatmap */}
          <div className="card">
            <h2 className="text-white font-bold mb-4">Keyboard Heatmap</h2>
            <KeyboardHeatmap keyAccuracy={keyAcc} />
          </div>
        </div>

        {/* Badges */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold">Badges</h2>
            <span className="text-text-secondary text-sm">{progress.earnedBadges?.length ?? 0}/{BADGES.length} earned</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {BADGES.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} earned={progress.earnedBadges?.includes(badge.id)} />
            ))}
          </div>
        </div>

        {/* Session History */}
        <div className="card">
          <h2 className="text-white font-bold mb-4">Recent Sessions</h2>
          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary text-xs uppercase border-b border-border">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Lesson</th>
                    <th className="text-right py-2 pr-4">WPM</th>
                    <th className="text-right py-2 pr-4">Accuracy</th>
                    <th className="text-right py-2">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((s, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-surface/50 transition-all">
                      <td className="py-2 pr-4 text-text-secondary font-mono text-xs">
                        {new Date(s.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 text-white">Lesson {s.lessonId}</td>
                      <td className="py-2 pr-4 text-accent font-mono font-bold text-right">{s.wpm}</td>
                      <td className={`py-2 pr-4 font-mono font-bold text-right ${s.accuracy >= 90 ? 'text-accent' : 'text-warning'}`}>
                        {s.accuracy}%
                      </td>
                      <td className="py-2 text-right text-text-secondary font-mono">+{s.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-sm text-center py-4">No sessions yet — start a lesson to see your history!</p>
          )}
        </div>
      </div>
    </div>
  );
}
