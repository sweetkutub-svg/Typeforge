import { useState, useEffect } from 'react';

const STORAGE_KEY = 'typeforge_progress';

const defaultProgress = {
  unlockedLessons: [1],
  completedLessons: [],
  keyStats: {},
  sessions: [],
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
};

const loadLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultProgress, ...JSON.parse(raw) } : defaultProgress;
  } catch { return defaultProgress; }
};

const saveLocal = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

export const useProgress = () => {
  const [progress, setProgress] = useState(defaultProgress);

  useEffect(() => {
    setProgress(loadLocal());
  }, []);

  const recordSession = ({ lessonId, wpm, accuracy, keyStats }) => {
    setProgress((prev) => {
      const session = { lessonId, wpm, accuracy, date: Date.now() };
      const sessions = [...(prev.sessions ?? []), session].slice(-100);

      // Merge keyStats
      const merged = { ...(prev.keyStats ?? {}) };
      Object.entries(keyStats ?? {}).forEach(([k, v]) => {
        merged[k] = merged[k]
          ? { attempts: merged[k].attempts + v.attempts, mistakes: merged[k].mistakes + v.mistakes }
          : { ...v };
      });

      // Unlock next lesson if accuracy >= 70%
      const unlockedLessons = [...(prev.unlockedLessons ?? [1])];
      if (accuracy >= 70 && !unlockedLessons.includes(lessonId + 1)) {
        unlockedLessons.push(lessonId + 1);
      }

      // Mark completed if accuracy >= 80%
      const completedLessons = [...(prev.completedLessons ?? [])];
      if (accuracy >= 80 && !completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      // XP
      const xpGained = Math.round((wpm * accuracy) / 100);
      const xp = (prev.xp ?? 0) + xpGained;

      // Streak
      const today = new Date().toDateString();
      const lastDate = prev.lastPracticeDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak = lastDate === today
        ? prev.streak
        : lastDate === yesterday
        ? (prev.streak ?? 0) + 1
        : 1;

      const next = {
        ...prev,
        sessions,
        keyStats: merged,
        unlockedLessons,
        completedLessons,
        xp,
        streak,
        lastPracticeDate: today,
      };
      saveLocal(next);
      return next;
    });
  };

  const level = Math.floor((progress.xp ?? 0) / 500) + 1;

  return { progress, recordSession, level };
};

export default useProgress;