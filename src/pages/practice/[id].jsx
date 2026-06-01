import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Gauge, ArrowLeft, Play, Pause, Save, ChevronRight, TriangleAlert } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Keyboard } from '../../components/Keyboard';
import { TypingArea } from '../../components/TypingArea';
import { StatsBar } from '../../components/StatsBar';
import { ResultScreen } from '../../components/ResultScreen';
import { useTyping } from '../../hooks/useTyping';
import { useProgress } from '../../hooks/useProgress';
import { LESSONS, generateWords, getKeyAccuracy } from '../../lib/adaptive';
import { getXPForLesson } from '../../lib/xp';

const PHASES = { PRE: 'pre', WORD: 'word', RESULT: 'result' };

export default function PracticePage() {
  const router = useRouter();
  const { id } = router.query;
  const lessonId = id ? parseInt(id) : null;
  const lesson = lessonId ? LESSONS.find((l) => l.id === lessonId) : null;

  const { progress, recordSession } = useProgress();
  const [phase, setPhase] = useState(PHASES.PRE);
  const [words, setWords] = useState([]);
  const [pressedKey, setPressedKey] = useState(null);
  const [errorKey, setErrorKey] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);

  const {
    input, wordIndex, completed, wpm, accuracy,
    started, paused, keyStats,
    handleInput, reset, pause, resume,
    currentWord,
  } = useTyping({ words, mode: 'word' });

  useEffect(() => {
    if (!lessonId || isNaN(lessonId)) return;
    if (!progress.unlockedLessons) return;
    setWords(generateWords(lessonId, progress.keyStats ?? {}));
  }, [lessonId, progress.unlockedLessons]);

  useEffect(() => {
    if (phase !== PHASES.WORD) return;
    const down = (e) => {
      const k = e.key.toLowerCase();
      setPressedKey(k);
      const target = currentWord?.[input?.length];
      if (k !== target) {
        setErrorKey(k);
        setTimeout(() => setErrorKey(null), 300);
      }
      setTimeout(() => setPressedKey(null), 150);
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [phase, currentWord, input]);

  useEffect(() => {
    if (phase !== PHASES.PRE) return;
    const handler = (e) => {
      if (e.key === ' ') { e.preventDefault(); startSession(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  const resumeRef = useRef(resume);
  useEffect(() => { resumeRef.current = resume; }, [resume]);

  useEffect(() => {
    if (!paused) return;
    const handler = (e) => { if (e.key === ' ') { e.preventDefault(); resumeRef.current(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paused]);

  const startSession = () => {
    reset();
    setWords(generateWords(lessonId, progress.keyStats ?? {}));
    setPhase(PHASES.WORD);
  };

  const handleSaveSession = () => {
    const xp = getXPForLesson(wpm, accuracy, lessonId);
    recordSession({ lessonId, wpm, accuracy, keyStats });
    setSessionResult({ wpm, accuracy, xp, keyStats });
    setPhase(PHASES.RESULT);
  };

  const handleRetry = () => {
    reset();
    setSessionResult(null);
    setPhase(PHASES.PRE);
  };

  const handleNext = () => router.push('/lessons');

  const keyAccuracy = getKeyAccuracy(keyStats);
  const weakKeys = Object.entries(keyAccuracy)
    .filter(([, acc]) => acc < 80)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 5);

  if (!lesson && lessonId) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-text-secondary">Lesson not found.</p>
    </div>
  );
  if (!lesson) return null;

  const isLocked = !progress.unlockedLessons?.includes(lessonId);
  if (isLocked) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="pt-14 flex items-center justify-center h-[80vh] flex-col gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <p className="text-white font-bold text-xl">Lesson Locked</p>
          <p className="text-text-secondary">Complete previous lessons to unlock this one.</p>
          <button onClick={() => router.push('/lessons')} className="btn-primary mt-2">Back to Lessons</button>
        </div>
      </div>
    );
  }

  const activeKeys = Array.isArray(lesson.keys) ? lesson.keys : [];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-14 max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── PRE SCREEN ── */}
          {phase === PHASES.PRE && (
            <motion.div key="pre" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8">
              <div className="text-center">
                <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-2">Lesson {lesson.id}</p>
                <h1 className="text-3xl font-bold text-white mb-1">{lesson.name}</h1>
                <p className="text-text-secondary">{lesson.description}</p>
                <div className="flex gap-3 justify-center mt-3 flex-wrap">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm text-text-secondary">
                    <Target size={13} /> Target: {lesson.targetWPM} WPM
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm text-text-secondary">
                    <Gauge size={13} /> {lesson.targetAccuracy}% accuracy
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-sm text-text-secondary">
                    <Clock size={13} /> No time limit
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto w-full flex justify-center">
                <Keyboard activeKeys={activeKeys} showFingerGuide={true} />
              </div>

              {Array.isArray(lesson.keys) && (
                <div className="card text-center">
                  <p className="text-text-secondary text-sm mb-2">Focus Keys</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {lesson.keys.map((k) => (
                      <span key={k} className="px-3 py-1 bg-accent/10 border border-accent text-accent rounded font-mono font-bold">
                        {k.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-3">
                <button onClick={startSession} className="btn-primary text-lg px-10 py-4 flex items-center gap-2">
                  <Play size={18} /> Word Practice
                </button>
                <p className="text-text-secondary text-sm">
                  or press <kbd className="bg-surface border border-border px-2 py-0.5 rounded font-mono text-accent">Space</kbd> to start
                </p>
              </div>
            </motion.div>
          )}

          {/* ── WORD PRACTICE SCREEN ── */}
          {phase === PHASES.WORD && (
            <motion.div key="word" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <StatsBar wpm={wpm} accuracy={accuracy} timeLeft={null} />
                </div>
                <button onClick={paused ? resume : pause}
                  className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-white hover:border-accent transition-colors">
                  {paused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
                </button>
              </div>

              <div className="card min-h-[160px] flex items-center justify-center cursor-text relative">
                {paused && (
                  <div className="absolute inset-0 bg-bg/90 flex flex-col items-center justify-center rounded-2xl z-10">
                    <p className="text-2xl font-bold text-white mb-2">Paused</p>
                    <p className="text-text-secondary text-sm">
                      Press <kbd className="bg-surface border border-border px-2 py-0.5 rounded font-mono text-accent">Space</kbd> to resume
                    </p>
                  </div>
                )}
                <TypingArea words={words} wordIndex={wordIndex} input={input} completed={completed} onInput={handleInput} />
              </div>

              <div className="overflow-x-auto w-full flex justify-center">
                <Keyboard activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
              </div>

              {weakKeys.length > 0 && (
                <div className="card">
                  <p className="text-text-secondary text-xs mb-2 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <TriangleAlert size={12} /> Struggling keys
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {weakKeys.map(([key, acc]) => (
                      <span key={key} className="px-3 py-1 bg-red-500/10 border border-red-500/50 rounded-lg font-mono text-sm">
                        <span className="text-white">{key.toUpperCase()}</span>
                        <span className="text-red-400 ml-2">{acc}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button onClick={() => { reset(); setPhase(PHASES.PRE); }}
                  className="flex items-center gap-1.5 text-text-secondary text-sm hover:text-white transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={handleSaveSession}
                  className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
                  <Save size={14} /> Save & Finish
                </button>
              </div>
            </motion.div>
          )}

          {/* ── RESULT SCREEN ── */}
          {phase === PHASES.RESULT && sessionResult && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultScreen
                wpm={sessionResult.wpm}
                accuracy={sessionResult.accuracy}
                xpGained={sessionResult.xp}
                keyStats={sessionResult.keyStats}
                lessonId={lessonId}
                onRetry={handleRetry}
                onNext={handleNext}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}