import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getKeyAccuracy } from '../lib/adaptive';
import { LESSONS } from '../lib/adaptive';
import confetti from 'canvas-confetti';

export const ResultScreen = ({ wpm, accuracy, xpGained, keyStats, lessonId, onRetry, onNext }) => {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const passed = wpm >= (lesson?.targetWPM ?? 0) && accuracy >= (lesson?.targetAccuracy ?? 0);
  const keyAcc = getKeyAccuracy(keyStats ?? {});
  const weakKeys = Object.entries(keyAcc).filter(([, v]) => v < 80).map(([k]) => k);

  useEffect(() => {
    if (passed) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#00ff9f','#00cc7a','#ffffff'] });
    }
  }, [passed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 py-10 px-4 max-w-lg mx-auto text-center"
    >
      <h2 className={`text-2xl font-bold ${passed ? 'text-accent' : 'text-white'}`}>
        {passed ? '🎉 Great Job!' : '😤 Almost there!'}
      </h2>

      <div className="flex gap-10">
        <div>
          <div className="text-6xl font-bold font-mono text-accent">{wpm}</div>
          <div className="text-text-secondary text-sm">WPM</div>
        </div>
        <div>
          <div className="text-6xl font-bold font-mono text-white">{accuracy}%</div>
          <div className="text-text-secondary text-sm">Accuracy</div>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="bg-[#001a0d] border border-accent rounded-xl px-6 py-3 text-accent font-bold text-xl"
      >
        +{xpGained} XP
      </motion.div>

      <div className={`text-sm px-4 py-2 rounded-lg border ${passed ? 'border-accent text-accent' : 'border-error text-error'}`}>
        Target: {lesson?.targetWPM} WPM · {lesson?.targetAccuracy}% accuracy
        {passed ? ' ✓ Met!' : ' — Not yet'}
      </div>

      {passed && (
        <div className="bg-[#001a0d] border border-accent rounded-xl px-4 py-3 text-accent font-semibold">
          🔓 Lesson {lessonId + 1} Unlocked!
        </div>
      )}

      {weakKeys.length > 0 && (
        <div className="w-full">
          <p className="text-text-secondary text-sm mb-2">Weak keys — practice more:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {weakKeys.map((k) => (
              <span key={k} className="px-3 py-1 bg-error/20 border border-error text-error rounded font-mono font-bold text-sm">
                {k.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button onClick={onRetry}
          className="px-6 py-2.5 rounded-xl border border-border text-white hover:border-accent hover:text-accent transition-all font-semibold">
          Retry
        </button>
        {passed && lessonId < 5 && (
          <button onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-accent text-bg font-bold hover:bg-accent-dim transition-all shadow-glow">
            Next Lesson →
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ResultScreen;
