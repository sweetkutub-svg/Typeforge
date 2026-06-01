import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Keyboard } from '../components/Keyboard';
import { useTyping } from '../hooks/useTyping';

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.",
  "Typing is a skill that improves with daily practice. The more you type, the faster and more accurate you become. Focus on accuracy first, then speed will follow naturally.",
  "A good typist does not look at the keyboard while typing. Keep your eyes on the screen and let your fingers find the keys by muscle memory. This takes time but pays off greatly.",
  "The internet has changed the way we communicate. Emails, messages, and documents are all typed. Being a fast typist saves hours every week and makes you more productive at work.",
  "Programming requires a lot of typing. Writing clean code means typing carefully and accurately. Every bracket, semicolon, and variable name must be typed correctly for the program to work.",
  "Reading books expands your vocabulary and improves your writing. When you type passages from books, you learn new words and sentence structures. This makes you a better communicator.",
  "Practice makes perfect. No skill is developed overnight. With consistent effort and focused practice, anyone can become a proficient typist. Start slow, build accuracy, then increase your speed.",
  "The home row keys are the foundation of touch typing. Your fingers rest on A S D F and J K L semicolon. From this position, you can reach every key on the keyboard efficiently.",
  "Speed typing competitions test how fast and accurately people can type. The world record is over two hundred words per minute. Most professional typists average between sixty and eighty words per minute.",
  "Learning to type without looking at the keyboard is called touch typing. It is one of the most valuable skills you can learn in the modern world. Start today and practice every single day.",
];

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Last used index track karo taaki same paragraph repeat na ho
let lastParagraphIndex = -1;
const getRandomParagraph = () => {
  let idx;
  do {
    idx = Math.floor(Math.random() * PARAGRAPHS.length);
  } while (idx === lastParagraphIndex && PARAGRAPHS.length > 1);
  lastParagraphIndex = idx;
  return PARAGRAPHS[idx];
};

export default function Paragraph() {
  const [phase, setPhase] = useState('pre'); // pre | typing | result
  const [paragraph, setParagraph] = useState('');
  const [words, setWords] = useState([]);
  const [finalTime, setFinalTime] = useState(0);
  // Last word complete hua ya nahi track karne ke liye
  const [lastWordDone, setLastWordDone] = useState(false);
const [pressedKey, setPressedKey] = useState(null);

  const {
    input, wordIndex, completed, wpm, accuracy,
    started, paused, keyStats,
    handleInput, reset, pause, resume,
    timeElapsed,
  } = useTyping({ words, mode: 'word' });

  const inputRef = useRef(null);

  const startSession = useCallback((keepResult = false) => {
    const p = getRandomParagraph();
    setParagraph(p);
    setWords(p.split(' ').filter(Boolean));
    setLastWordDone(false);
    reset();
    setPhase('typing');
  }, [reset]);

  // Jab wordIndex words.length tak pahunche — last word done, Enter ka wait karo
  useEffect(() => {
    if (phase !== 'typing') return;
    if (words.length > 0 && wordIndex >= words.length) {
      setLastWordDone(true);
      // Auto-finish nahi karna, Enter ka wait karo
    } else {
      setLastWordDone(false);
    }
  }, [wordIndex, words.length, phase]);

  // Focus input when typing starts
  useEffect(() => {
    if (phase === 'typing') {
      setTimeout(() => inputRef.current?.focus(), 100);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'typing') return;
    const refocus = () => setTimeout(() => inputRef.current?.focus(), 50);
    window.addEventListener('click', refocus);
    // Koi bhi key press kare toh focus wapas aaye
    const refocusKey = () => inputRef.current?.focus();
    document.addEventListener('keydown', refocusKey, true);
    return () => {
      window.removeEventListener('click', refocus);
      document.removeEventListener('keydown', refocusKey, true);
    };
  }, [phase]);

  const handleRetry = () => {
    reset();
    setFinalTime(0);
    setLastWordDone(false);
    setPhase('pre');
  };

  const handleFinish = () => {
    setFinalTime(timeElapsed);
    setPhase('result');
  };

  // KeyDown handler — Enter press pe next paragraph ya finish
  const handleKeyDown = useCallback((e) => {
    // Pressed key glow ke liye
    setPressedKey(e.key);
    setTimeout(() => setPressedKey(null), 150);

    if (e.key === 'Enter') {
      e.preventDefault();
      if (lastWordDone) {
        // Turant naya paragraph — no delay, no result screen
        startSession();
      }
    }
  }, [lastWordDone, startSession]);

  // Render paragraph with colored chars
  const renderParagraph = () => {
    return words.map((word, wIdx) => {
      const isActive = wIdx === wordIndex;
      const isPast = wIdx < wordIndex;
      const wasCorrect = isPast ? completed[wIdx]?.correct : null;

      if (isPast) {
        const typed = completed[wIdx]?.typed || '';
        const expected = completed[wIdx]?.expected || word;
        return (
          <span key={wIdx}>
            <span className="font-mono text-lg opacity-70">
              {[...expected].map((char, i) => {
                const t = typed?.[i];
                const isCorrect = t === char;
                const color = t == null ? 'text-accent' : isCorrect ? 'text-accent' : 'text-red-400';
                return (
                  <span key={i} className={color}>
                    {char}
                  </span>
                );
              })}
              {typed && [...typed].slice(expected.length).map((c, i) => (
                <span key={`ex-${i}`} className="text-red-400">{c}</span>
              ))}
            </span>
            <span> </span>
          </span>
        );
      }

      if (isActive) {
        return (
          <span key={wIdx}>
            <span className="relative font-mono text-lg">
              {[...word].map((char, i) => {
                const t = input?.[i];
                let cls = 'text-white';
                if (t != null) cls = t === char ? 'text-accent' : 'text-red-400';
                const isCurrent = i === (input?.length ?? 0);
                return (
                  <span key={i} className={`${cls} ${isCurrent ? 'border-b-2 border-accent' : ''}`}>
                    {char}
                  </span>
                );
              })}
              {input && [...input].slice(word.length).map((c, i) => (
                <span key={`ex-${i}`} className="text-red-400">{c}</span>
              ))}
            </span>
            <span> </span>
          </span>
        );
      }

      return (
        <span key={wIdx}>
          <span className="font-mono text-lg text-white opacity-30">{word}</span>
          <span> </span>
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-14 max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* PRE */}
          {phase === 'pre' && (
            <motion.div key="pre" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 py-10">
              <div className="text-center">
                <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-2">Paragraph Practice</p>
                <h1 className="text-3xl font-bold text-white mb-2">Type Full Paragraphs</h1>
                <p className="text-text-secondary">Random paragraphs — focus on flow and accuracy</p>
              </div>
              <button onClick={() => startSession()} className="btn-primary text-lg px-10 py-4">
                ▶ Start Typing
              </button>
            </motion.div>
          )}

          {/* TYPING */}
          {phase === 'typing' && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-5">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card text-center py-3">
                  <p className="text-2xl font-bold text-accent">{accuracy}%</p>
                  <p className="text-text-secondary text-xs mt-1">Accuracy</p>
                </div>
                <div className="card text-center py-3">
                  <p className="text-2xl font-bold text-white">{wpm}</p>
                  <p className="text-text-secondary text-xs mt-1">WPM</p>
                </div>
                <div className="card text-center py-3">
                  <p className="text-2xl font-bold text-white">{formatTime(timeElapsed)}</p>
                  <p className="text-text-secondary text-xs mt-1">Time</p>
                </div>
              </div>

              {/* Paragraph area */}
              <div className="card relative min-h-[200px] cursor-text" onClick={() => inputRef.current?.focus()}>
                {paused && (
                  <div className="absolute inset-0 bg-bg/90 flex flex-col items-center justify-center rounded-2xl z-10">
                    <p className="text-2xl font-bold text-white mb-2">Paused</p>
                    <p className="text-text-secondary text-sm">
                      Press <kbd className="bg-surface border border-border px-2 py-0.5 rounded font-mono text-accent">Space</kbd> to resume
                    </p>
                  </div>
                )}
                <div className="leading-relaxed">
                  {renderParagraph()}
                </div>

                {/* Last word done hone pe Enter hint dikhao */}
                {lastWordDone && (
                  <div className="mt-4 flex items-center justify-center gap-2 animate-pulse">
                    <kbd className="bg-surface border border-accent px-3 py-1 rounded font-mono text-accent text-sm">Enter</kbd>
                    <span className="text-text-secondary text-sm">next paragraph ke liye</span>
                  </div>
                )}

                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInput}
                  onBlur={() => {
  if (phase === 'typing') setTimeout(() => inputRef.current?.focus(), 10);
}}
                  className="opacity-0 fixed top-0 left-0 w-1 h-1"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Progress bar */}
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (wordIndex / words.length) * 100)}%` }} />
              </div>

              {/* Keyboard */}
              <div className="w-full flex justify-center">
                <Keyboard activeKeys={[]} pressedKey={pressedKey} errorKey={null} />
              </div>

              <div className="flex justify-between items-center">
                <button onClick={handleRetry} className="text-text-secondary text-sm hover:text-white transition-colors">← Back</button>
                <div className="flex gap-3">
                  <button onClick={paused ? resume : pause}
                    className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-semibold text-white hover:border-accent transition-colors">
                    {paused ? 'Resume' : 'Pause'}
                  </button>
                  <button onClick={handleFinish}
                    className="btn-primary text-sm px-4 py-2">
                    Save & Finish
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-10">
              <p className="text-6xl">🎯</p>
              <h2 className="text-3xl font-bold text-white">Paragraph Complete!</h2>
              <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                <div className="card text-center py-4">
                  <p className="text-2xl font-bold text-accent">{accuracy}%</p>
                  <p className="text-text-secondary text-xs mt-1">Accuracy</p>
                </div>
                <div className="card text-center py-4">
                  <p className="text-2xl font-bold text-white">{wpm}</p>
                  <p className="text-text-secondary text-xs mt-1">WPM</p>
                </div>
                <div className="card text-center py-4">
                  <p className="text-2xl font-bold text-white">{formatTime(finalTime)}</p>
                  <p className="text-text-secondary text-xs mt-1">Time Taken</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startSession()} className="btn-primary px-6 py-3">🔄 New Paragraph</button>
                <button onClick={handleRetry}
                  className="px-6 py-3 border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">
                  Back
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}