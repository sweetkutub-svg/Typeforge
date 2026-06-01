import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { LessonCard } from '../components/LessonCard';
import { BadgeCard } from '../components/BadgeCard';
import { useProgress } from '../hooks/useProgress';
import { LESSONS } from '../lib/adaptive';
import { BADGES, getLevelFromXP, getNextLevelXP, getXPForLevel } from '../lib/xp';

export default function LessonsPage() {
  const router = useRouter();
  const { progress, level } = useProgress();

  const getStatus = (id) => {
    if (progress.completedLessons?.includes(id)) return 'completed';
    if (id === 1) return progress.completedLessons?.includes(1) ? 'completed' : 'current';
    const prevDone = progress.completedLessons?.includes(id - 1);
    if (prevDone) return 'current';
    if (progress.unlockedLessons?.includes(id)) return 'unlocked';
    return 'locked';
  };

  const nextXP   = getNextLevelXP(level);
  const curXP    = getXPForLevel(level);
  const xpPct    = nextXP > curXP ? ((progress.xp - curXP) / (nextXP - curXP)) * 100 : 100;
  const totalPct = Math.round(((progress.completedLessons?.length ?? 0) / LESSONS.length) * 100);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-14 max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-6">

        {/* Lesson Map */}
        <main className="flex-1">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold text-white mb-1">Your Path to Mastery</h1>
            <p className="text-text-secondary text-sm mb-6">
              10 lessons · Keys introduced by frequency, not just rows. Complete each to unlock the next.
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-text-secondary mb-1.5 font-mono">
                <span>{progress.completedLessons?.length ?? 0} / {LESSONS.length} lessons done</span>
                <span>{totalPct}% complete</span>
              </div>
              <div className="progress-bar">
                <motion.div className="progress-fill" initial={{ width: 0 }}
                  animate={{ width: `${totalPct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {LESSONS.map((lesson, i) => (
                <motion.div key={lesson.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <LessonCard
                    lesson={lesson}
                    status={getStatus(lesson.id)}
                    onClick={() => router.push(`/practice/${lesson.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Sidebar */}
        <aside className="lg:w-72 flex flex-col gap-4">
          {/* XP */}
          <div className="card">
            <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-1 font-mono">Level</p>
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-white font-bold text-2xl">Level {level}</h3>
              <span className="text-text-secondary text-xs font-mono">{progress.xp ?? 0} / {nextXP} XP</span>
            </div>
            <div className="progress-bar">
              <motion.div className="progress-fill" initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
            </div>
          </div>

          {/* Streak */}
          <div className="card">
            <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-3 font-mono">Streak</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-warning/10 border border-warning/25 flex items-center justify-center">
                <Flame size={20} className="text-warning animate-streak-fire" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">{progress.streak ?? 0}</span>
                <span className="text-text-secondary text-sm"> days</span>
                <p className="text-text-secondary text-xs">Keep it going!</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <p className="text-text-secondary text-[10px] uppercase tracking-widest font-mono">Badges</p>
              <span className="text-text-secondary text-xs font-mono">
                {progress.earnedBadges?.length ?? 0}/{BADGES.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map((badge) => (
                <BadgeCard key={badge.id} badge={badge}
                  earned={progress.earnedBadges?.includes(badge.id)} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
