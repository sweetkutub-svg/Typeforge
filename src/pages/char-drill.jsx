import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Keyboard } from '../components/Keyboard';
import { useTyping } from '../hooks/useTyping';
import { useProgress } from '../hooks/useProgress';
import { LESSONS, generateChars, getKeyAccuracy } from '../lib/adaptive';

const CHAR_UNLOCK_ACCURACY = 80;

const playErrorSound = () => {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 150;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

export default function CharDrillPage() {
  const router = useRouter();
  const { progress, recordSession } = useProgress();

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [phase, setPhase] = useState('select');
  const [chars, setChars] = useState([]);
  const [pressedKey, setPressedKey] = useState(null);
  const [errorKey, setErrorKey] = useState(null);
  const [errorShake, setErrorShake] = useState(0);

  const lesson = selectedLesson ? LESSONS.find((l) => l.id === selectedLesson) : null;
  const activeKeys = lesson && Array.isArray(lesson.keys) ? lesson.keys : [];

  const handleNeedMoreCharsRef = useRef(null);

  const {
    wordIndex, completed, wpm, accuracy,
    started, paused, keyStats,
    handleCharKey, reset, pause, resume,
    currentWord, timeElapsed,
  } = useTyping({
    words: chars,
    mode: 'char',
    onNeedMoreChars: () => handleNeedMoreCharsRef.current?.(),
    onCharError: () => {
      playErrorSound();
      setErrorShake(prev => prev + 1);
      setTimeout(() => setErrorShake(0), 500);
    },
  });

  const handleNeedMoreChars = useCallback(() => {
    const keys = lesson?.keys;
    if (!Array.isArray(keys)) return;
    setChars((prev) => [
      ...prev,
      ...generateChars(keys, progress.keyStats ?? {}),
      ...generateChars(keys, progress.keyStats ?? {}),
    ]);
  }, [lesson, progress.keyStats]);
  handleNeedMoreCharsRef.current = handleNeedMoreChars;

  useEffect(() => {
    if (!lesson || !Array.isArray(lesson.keys)) return;
    setChars(generateChars(lesson.keys, progress.keyStats ?? {}));
  }, [selectedLesson]);

  const handleCharKeyRef = useRef(handleCharKey);
  useEffect(() => { handleCharKeyRef.current = handleCharKey; }, [handleCharKey]);

  useEffect(() => {
    if (phase !== 'drilling') return;
    const handler = (e) => handleCharKeyRef.current(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'drilling') return;
    const down = (e) => {
      const k = e.key.toLowerCase();
      setPressedKey(k);
      if (k !== currentWord) {
        setErrorKey(k);
        setTimeout(() => setErrorKey(null), 300);
      }
      setTimeout(() => setPressedKey(null), 150);
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [phase, currentWord]);

  useEffect(() => {
    if (!paused) return;
    const handler = (e) => { if (e.key === ' ') { e.preventDefault(); resume(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paused, resume]);

  const startDrill = (id) => {
    setSelectedLesson(id);
    reset();
    setPhase('drilling');
  };

  const handleFinish = () => {
    recordSession({ lessonId: selectedLesson, wpm, accuracy, keyStats });
    setPhase('result');
  };

  const handleRetry = () => {
    reset();
    setChars(generateChars(lesson.keys, progress.keyStats ?? {}));
    setPhase('drilling');
  };

  const displayChar = currentWord === ' ' ? '[space]' : (currentWord?.toUpperCase() || '?');
  const formatTime = (s) => s >= 60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`;
  const keyAccuracy = getKeyAccuracy(keyStats);

  const drillableLessons = LESSONS.filter((l) => Array.isArray(l.keys));

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-20 max-w-4xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">

          {/* ── LESSON SELECT ── */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-6">
              <div>
                <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-1">Character Drill</p>
                <h1 className="text-3xl font-bold text-white mb-1">Pick a Lesson</h1>
                <p className="text-text-secondary text-sm">Practice one key at a time — adaptive weighting on your weak keys</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {drillableLessons.map((l) => {
                  const isUnlocked = progress.unlockedLessons?.includes(l.id) || l.id === 1;
                  const isCompleted = progress.completedLessons?.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => isUnlocked && startDrill(l.id)}
                      disabled={!isUnlocked}
                      className={[
                        'card text-left transition-all duration-200 relative',
                        isUnlocked
                          ? 'hover:border-accent/40 hover:shadow-glow-sm cursor-pointer'
                          : 'opacity-40 cursor-not-allowed',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs text-text-secondary font-mono uppercase tracking-widest">Lesson {l.id}</p>
                          <p className="text-white font-bold text-lg">{l.name}</p>
                        </div>
                        <span className="text-xl">{isCompleted ? '[✓]' : isUnlocked ? '[*]' : '[L]'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {l.keys.map((k) => (
                          <span key={k}
                            style={{ borderColor: l.color + '66', color: l.color, background: l.color + '11' }}
                            className="px-2 py-0.5 rounded font-mono font-bold text-xs border">
                            {k.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── DRILLING ── */}
          {phase === 'drilling' && lesson && (
            <motion.div key="drill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-2">

              {/* FIX 1: Header + Stats all in one compact row */}
              <div className="flex items-center justify-between gap-3 flex-wrap mt-6 mb-3">
                <div>
                  <p className="text-accent text-xs font-semibold tracking-widest uppercase">Lesson {lesson.id} — Char Drill</p>
                  <h2 className="text-white font-bold text-2xl leading-tight" style={{fontFamily: 'JetBrains Mono, monospace'}}>{lesson.name}</h2>
                </div>

                {/* FIX 2: Stats in one line as compact pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
                    <span className="text-accent font-bold text-sm">{accuracy}%</span>
                    <span className="text-text-secondary text-xs">Accuracy</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
                    <span className="text-white font-bold text-sm">{completed.length}</span>
                    <span className="text-text-secondary text-xs">Chars</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
                    <span className="text-white font-bold text-sm">{wpm}</span>
                    <span className="text-text-secondary text-xs">CPM</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-3 py-1.5">
                    <span className="text-white font-bold text-sm">{formatTime(timeElapsed)}</span>
                    <span className="text-text-secondary text-xs">Time</span>
                  </div>
                  <button onClick={paused ? resume : pause}
                    className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-semibold text-white hover:border-accent transition-colors">
                    {paused ? 'PLAY' : 'PAUSE'}
                  </button>
                </div>
              </div>

              {/* Drill area — FIX 3: reduced padding, smaller char display */}
              <div className="card relative py-3">
                {paused && (
                  <div className="absolute inset-0 bg-bg/90 flex flex-col items-center justify-center rounded-2xl z-10">
                    <p className="text-2xl font-bold text-white mb-2">Paused</p>
                    <p className="text-text-secondary text-sm">Press <kbd className="bg-surface border border-border px-2 py-0.5 rounded font-mono text-accent">Space</kbd> to resume</p>
                  </div>
                )}

                {/* History rows */}
                <div className="flex flex-col gap-1 mb-3">
                  {[2, 1, 0].map((offset) => {
                    const rowSize = 22;
                    const end = completed.length - offset * rowSize;
                    const start = end - rowSize;
                    const row = completed.slice(Math.max(0, start), Math.max(0, end));
                    if (row.length === 0) return <div key={offset} className="h-7" />;
                    return (
                      <div key={offset} className={`flex gap-1 justify-center ${offset > 0 ? 'opacity-20' : 'opacity-55'}`}>
                        {row.map((c, i) => (
                          <span key={i} className={`w-7 h-7 flex items-center justify-center rounded font-mono font-bold text-xs border
                            ${c.correct ? 'border-accent/25 text-accent bg-accent/5' : 'border-red-500/25 text-red-400 bg-red-500/5'}`}>
                            {c.expected?.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* FIX 4: Current char — smaller size (72px box, 40px font instead of 140px/72px) */}
                <div className="flex items-center justify-center gap-4">
                  <div className="flex gap-2 opacity-20">
                    {[completed[completed.length - 2], completed[completed.length - 1]].map((c, i) => (
                      <div key={i} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-surface">
                        <span className={`text-base font-mono font-bold ${c?.correct ? 'text-accent' : 'text-red-400'}`}>
                          {c?.expected?.toUpperCase() ?? ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <motion.div key={wordIndex}
                    initial={{ scale: 0.7, opacity: 0, y: 6 }}
                    animate={{ scale: 1, opacity: 1, y: 0, x: errorShake ? [0, -8, 8, -8, 0] : 0 }}
                    transition={{ duration: errorShake ? 0.3 : 0.1, type: errorShake ? 'tween' : 'spring', stiffness: 500, damping: 25 }}
                    style={{
                      width: 80, height: 80,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 16,
                      border: `2px solid ${errorShake ? '#ef4444' : '#00ff9f'}`,
                      background: errorShake ? 'rgba(239,68,68,0.1)' : 'rgba(0,255,159,0.07)',
                      boxShadow: errorShake
                        ? '0 0 16px rgba(239,68,68,0.25)'
                        : '0 0 24px rgba(0,255,159,0.15)',
                      transition: 'all 0.15s ease'
                    }}>
                    <span style={{ fontSize: 40, fontFamily: 'JetBrains Mono, monospace', fontWeight: 900, color: errorShake ? '#ef4444' : '#00ff9f', lineHeight: 1 }}>
                      {displayChar}
                    </span>
                  </motion.div>

                  <div className="flex gap-2 opacity-20">
                    {[chars[wordIndex + 1], chars[wordIndex + 2]].map((c, i) => (
                      <div key={i} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-surface">
                        <span className="text-base font-mono font-bold text-white">{c?.toUpperCase() ?? ''}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-text-secondary text-xs mt-2 uppercase tracking-widest font-mono">
                  {!started ? '> press the highlighted key to begin' : `${completed.length} chars typed - keep going`}
                </p>
              </div>

              {/* FIX 5: Keyboard — no overflow wrapper needed, stays in flow */}
              <div className="w-full flex justify-center">
                <Keyboard activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
              </div>

              {/* Key accuracy */}
              <div className="card py-3">
                <p className="text-text-secondary text-xs mb-2 uppercase tracking-widest font-mono">Key accuracy</p>
                <div className="flex flex-wrap gap-2">
                  {activeKeys.map((k) => {
                    const stat = keyStats[k];
                    const acc = stat?.attempts > 0
                      ? Math.round(((stat.attempts - stat.mistakes) / stat.attempts) * 100)
                      : null;
                    return (
                      <div key={k} className="flex flex-col items-center gap-1">
                        <span className={`w-9 h-9 flex items-center justify-center rounded-lg font-mono font-bold text-sm border
                          ${acc === null ? 'border-border text-text-secondary bg-surface'
                            : acc >= 90 ? 'border-accent text-accent bg-accent/10'
                            : acc >= 70 ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                            : 'border-red-400 text-red-400 bg-red-400/10'}`}>
                          {k.toUpperCase()}
                        </span>
                        <span className="text-xs text-text-secondary">{acc !== null ? `${acc}%` : '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accuracy progress */}
              <div className="card py-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-text-secondary text-sm">Accuracy target</p>
                  <p className={`text-sm font-bold ${accuracy >= CHAR_UNLOCK_ACCURACY ? 'text-accent' : 'text-white'}`}>
                    {accuracy}% / {CHAR_UNLOCK_ACCURACY}%
                  </p>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (accuracy / CHAR_UNLOCK_ACCURACY) * 100)}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center pb-2">
                <button onClick={() => { reset(); setPhase('select'); }}
                  className="text-text-secondary text-sm hover:text-white transition-colors">← Back</button>
                <button onClick={handleFinish}
                  className="px-4 py-2 bg-surface border border-border text-white rounded-lg text-sm hover:border-accent transition-colors">
                  Save & Finish
                </button>
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-10">
              <p className="text-6xl">🎯</p>
              <h2 className="text-3xl font-bold text-white">Drill Complete!</h2>
              <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                <div className="card text-center py-4">
                  <p className="text-2xl font-bold text-accent">{accuracy}%</p>
                  <p className="text-text-secondary text-xs mt-1">Accuracy</p>
                </div>
                <div className="card text-center py-4">
                  <p className="text-2xl font-bold text-white">{completed.length}</p>
                  <p className="text-text-secondary text-xs mt-1">Chars</p>
                </div>
                <div className="card text-center py-4">
                  <p className="text-2xl font-bold text-white">{wpm}</p>
                  <p className="text-text-secondary text-xs mt-1">CPM</p>
                </div>
                <div className="card text-center py-4">
                  <p className="text-2xl font-bold text-white">{formatTime(timeElapsed)}</p>
                  <p className="text-text-secondary text-xs mt-1">Time Taken</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleRetry} className="btn-primary px-6 py-3">🔄 Retry</button>
                <button onClick={() => setPhase('select')}
                  className="px-6 py-3 border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">
                  Pick Another
                </button>
                <button onClick={() => router.push('/lessons')}
                  className="px-6 py-3 border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">
                  Lessons →
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}