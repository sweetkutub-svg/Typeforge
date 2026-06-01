export const BADGES = [
  { id: 'first_blood',  label: 'First Strike',   emoji: '⚡', desc: 'Complete your first lesson' },
  { id: 'home_master',  label: 'Home Master',     emoji: '🏠', desc: 'Master the home row' },
  { id: 'speed_15',     label: 'Sprinter',        emoji: '🏃', desc: 'Hit 15 WPM' },
  { id: 'speed_30',     label: 'Racer',           emoji: '🚀', desc: 'Hit 30 WPM' },
  { id: 'speed_50',     label: 'Speedster',       emoji: '⚡', desc: 'Hit 50 WPM' },
  { id: 'accuracy_100', label: 'Perfectionist',   emoji: '🎯', desc: 'Get 100% accuracy in a session' },
  { id: 'streak_3',     label: 'On Fire',         emoji: '🔥', desc: '3-day streak' },
  { id: 'streak_7',     label: 'Week Warrior',    emoji: '🗡️', desc: '7-day streak' },
  { id: 'lessons_5',    label: 'Halfway There',   emoji: '🌟', desc: 'Complete 5 lessons' },
  { id: 'lessons_all',  label: 'TypeForge Master',emoji: '👑', desc: 'Complete all 10 lessons' },
];

export const getXPForLesson = (wpm, accuracy, lessonId) => {
  const base = 50 + lessonId * 10;
  const wpmBonus = Math.floor(wpm * 2);
  const accBonus = accuracy >= 100 ? 30 : accuracy >= 95 ? 15 : accuracy >= 90 ? 5 : 0;
  return base + wpmBonus + accBonus;
};

export const getLevelFromXP = (xp) => Math.floor(0.5 * (1 + Math.sqrt(1 + 8 * xp / 100)));

export const getXPForLevel = (level) => Math.floor((level * (level - 1) / 2) * 100);

export const getNextLevelXP = (level) => getXPForLevel(level + 1);
