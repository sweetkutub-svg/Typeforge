import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calcForgePoints } from './rank';
import { Navbar } from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const TIMER_OPTIONS = [
  { label: '15s', seconds: 15 },
  { label: '30s', seconds: 30 },
  { label: '1m',  seconds: 60 },
  { label: '3m',  seconds: 180 },
  { label: '5m',  seconds: 300 },
];

const WORD_POOL = [
  'the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this',
  'but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their',
  'what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just',
  'him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now',
  'look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well',
  'way','even','new','want','because','any','these','give','day','most','us','great','between','need','large','often',
  'hand','high','place','hold','turn','where','much','before','right','too','mean','old','any','same','tell','boy',
  'follow','came','show','also','around','form','small','set','put','end','why','again','off','play','spell','air',
  'away','animal','house','point','page','letter','mother','answer','found','study','still','learn','should','world',
  'america','state','family','change','light','voice','power','town','fine','drive','short','road','half','ten','fly',
  'gave','box','finally','wait','correct','oh','quickly','person','became','shown','minutes','strong','verb','star',
  'front','feel','fact','inch','street','decided','contain','course','surface','produce','building','ocean','class',
  'note','nothing','rest','carefully','scientists','inside','wheels','stay','green','known','island','week','less',
  'machine','base','ago','stood','plane','system','behind','ran','round','boat','game','force','brought','understand',
  'warm','common','bring','explain','dry','though','language','shape','deep','thousands','yes','clear','equation',
  'yet','government','filled','heat','full','hot','check','object','rule','among','noun','power','cannot','able',
  'six','size','dark','ball','material','special','heavy','fine','pair','circle','include','built','can\'t','matter',
];

const getRandomWords = (count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
  }
  return result;
};

const formatTime = (s) => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
};

// Simple WPM line chart using SVG
function WpmGraph({ data }) {
  if (!data || data.length < 2) return null;
  const W = 600, H = 140;
  const pad = { top: 16, right: 16, bottom: 28, left: 44 };
  const maxWpm = Math.max(...data.map(d => d.wpm), 10);
  const minWpm = 0;

  const xScale = (i) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const yScale = (v) => pad.top + (1 - (v - minWpm) / (maxWpm - minWpm)) * (H - pad.top - pad.bottom);

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.wpm)}`).join(' ');
  const areaD = `${pathD} L ${xScale(data.length - 1)} ${H - pad.bottom} L ${xScale(0)} ${H - pad.bottom} Z`;

  // Y axis ticks
  const yTicks = [0, Math.round(maxWpm / 2), maxWpm];
  // X axis ticks (time labels)
  const xTicks = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 5)) === 0 || i === data.length - 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 160 }}>
        <defs>
          <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00ff9f" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ff9f" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} y1={yScale(t)} x2={W - pad.right} y2={yScale(t)}
              stroke="#ffffff10" strokeWidth="1" />
            <text x={pad.left - 6} y={yScale(t) + 4} textAnchor="end"
              fill="#6060a0" fontSize="10">{t}</text>
          </g>
        ))}
        {/* Area */}
        <path d={areaD} fill="url(#wpmGrad)" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="#00ff9f" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d.wpm)} r="2.5" fill="#00ff9f" />
        ))}
        {/* X axis labels */}
        {xTicks.map((d, i) => (
          <text key={i} x={xScale(data.indexOf(d))} y={H - 6} textAnchor="middle"
            fill="#6060a0" fontSize="10">{d.label}</text>
        ))}
        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#2a2a3e" strokeWidth="1" />
        <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#2a2a3e" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function SpeedTest() {
  const [phase, setPhase] = useState('pre'); // pre | typing | result
  const [selectedTimer, setSelectedTimer] = useState(1); // index in TIMER_OPTIONS
  const [words, setWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState([]); // Track typed characters for each word

  // Stats tracking
  const [correctWords, setCorrectWords] = useState(0);
  const [wrongWords, setWrongWords] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [wrongChars, setWrongChars] = useState(0);
  const [wpmHistory, setWpmHistory] = useState([]); // [{wpm, label}]

  // Result state
  const [finalStats, setFinalStats] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wpmTickRef = useRef(null);
  const startTimeRef = useRef(null);
  const correctWordsRef = useRef(0);
  const correctCharsRef = useRef(0);
  const wrongCharsRef = useRef(0);
  const wpmHistoryRef = useRef([]);
  const timeLeftRef = useRef(60);
  const totalSecondsRef = useRef(60);

  const duration = TIMER_OPTIONS[selectedTimer].seconds;

  const initWords = useCallback(() => {
    setWords(getRandomWords(300));
  }, []);

  useEffect(() => { initWords(); }, [initWords]);

  const startTest = () => {
    const secs = TIMER_OPTIONS[selectedTimer].seconds;
    correctWordsRef.current = 0;
    correctCharsRef.current = 0;
    wrongCharsRef.current = 0;
    wpmHistoryRef.current = [];
    timeLeftRef.current = secs;
    totalSecondsRef.current = secs;

    setCorrectWords(0); setWrongWords(0);
    setCorrectChars(0); setWrongChars(0);
    setWpmHistory([]);
    setWordIndex(0); setInput('');
    setCompleted([]);
    setTimeLeft(secs);
    setStarted(false);
    initWords();
    setPhase('typing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const finishTest = useCallback(async () => {
    clearInterval(timerRef.current);
    clearInterval(wpmTickRef.current);

    const elapsed = totalSecondsRef.current - timeLeftRef.current;
    const mins = elapsed / 60 || 1/60;
    const wpm = Math.round(correctWordsRef.current / mins);
    const rawWpm = Math.round((correctWordsRef.current + wrongCharsRef.current / 5) / mins);
    const totalChars = correctCharsRef.current + wrongCharsRef.current;
    const acc = totalChars > 0 ? Math.round((correctCharsRef.current / totalChars) * 100) : 100;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const fp = calcForgePoints(wpm, acc, elapsed);
        const displayName = session.user.user_metadata?.full_name
          || session.user.user_metadata?.name
          || session.user.email?.split('@')[0]
          || 'Anonymous';

        // Individual test record
        await supabase.from('leaderboard').insert({
          user_id: session.user.id,
          display_name: displayName,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          wpm,
          accuracy: acc,
          forge_points: fp,
          test_duration: elapsed,
        });

        // Cumulative FP upsert
        const { data: existing } = await supabase
          .from('user_stats')
          .select('total_forge_points, best_wpm, best_accuracy, total_tests')
          .eq('user_id', session.user.id)
          .single();

        if (existing) {
          await supabase.from('user_stats').update({
            display_name: displayName,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            total_forge_points: existing.total_forge_points + fp,
            total_tests: existing.total_tests + 1,
            best_wpm: Math.max(existing.best_wpm, wpm),
            best_accuracy: Math.max(existing.best_accuracy, acc),
            updated_at: new Date().toISOString(),
          }).eq('user_id', session.user.id);
        } else {
          await supabase.from('user_stats').insert({
            user_id: session.user.id,
            display_name: displayName,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            total_forge_points: fp,
            total_tests: 1,
            best_wpm: wpm,
            best_accuracy: acc,
          });
        }
      }
    } catch (err) {
      console.error('Leaderboard save failed:', err);
    }

    const fp = calcForgePoints(wpm, acc, elapsed);
    setFinalStats({
      wpm,
      rawWpm,
      accuracy: acc,
      correctWords: correctWordsRef.current,
      correctChars: correctCharsRef.current,
      wrongChars: wrongCharsRef.current,
      duration: elapsed,
      wpmGraph: wpmHistoryRef.current,
      forgePoints: fp,
    });
    setPhase('result');
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'typing' || !started) return;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        finishTest();
      }
    }, 1000);

    // WPM tracker every second
    wpmTickRef.current = setInterval(() => {
      const elapsed = totalSecondsRef.current - timeLeftRef.current;
      const mins = elapsed / 60 || 0.01;
      const wpm = Math.round(correctWordsRef.current / mins);
      const label = elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed/60)}m${elapsed%60>0?elapsed%60+'s':''}`;
      wpmHistoryRef.current = [...wpmHistoryRef.current, { wpm, label }];
      setWpmHistory([...wpmHistoryRef.current]);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(wpmTickRef.current);
    };
  }, [phase, started, finishTest]);

  // Auto-focus
  useEffect(() => {
    if (phase !== 'typing') return;
    const refocus = () => inputRef.current?.focus();
    document.addEventListener('keydown', refocus, true);
    return () => document.removeEventListener('keydown', refocus, true);
  }, [phase]);

  const handleInput = (e) => {
    const val = e.target.value;

    // Start timer on first keypress
    if (!started && val.length > 0) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }

    if (val.endsWith(' ')) {
      const typed = val.trim();
      const expected = words[wordIndex];
      const isCorrect = typed === expected;

      if (isCorrect) {
        correctWordsRef.current += 1;
        correctCharsRef.current += typed.length;
        setCorrectWords(c => c + 1);
        setCorrectChars(c => c + typed.length);
      } else {
        // Count wrong chars
        const wc = Math.abs(typed.length - expected.length) +
          [...typed].filter((ch, i) => ch !== expected[i]).length;
        wrongCharsRef.current += wc;
        setWrongChars(c => c + wc);
        setWrongWords(w => w + 1);
      }

      setCompleted(prev => [...prev, { typed, expected, correct: isCorrect }]);
      setWordIndex(i => i + 1);
      setInput('');

      // Load more words if needed
      if (wordIndex + 1 >= words.length - 20) {
        setWords(prev => [...prev, ...getRandomWords(100)]);
      }
    } else {
      setInput(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') finishTest();
  };

  // Timer color
  const timerColor = timeLeft <= 10 ? '#ff4d6d' : timeLeft <= 30 ? '#fbbf24' : '#00ff9f';

  // Live WPM
  const liveWpm = started
    ? Math.round(correctWordsRef.current / ((totalSecondsRef.current - timeLeft + 0.1) / 60))
    : 0;

  // Render words
  const renderWords = () => {
    const visibleStart = Math.max(0, wordIndex - 20);
    const visibleEnd = Math.min(words.length, wordIndex + 60);
    return words.slice(visibleStart, visibleEnd).map((word, relIdx) => {
      const absIdx = visibleStart + relIdx;
      const isPast = absIdx < wordIndex;
      const isActive = absIdx === wordIndex;
      const isFuture = absIdx > wordIndex;

      if (isActive) {
        return (
          <span key={absIdx} className="inline-block mx-1 my-0.5">
            {[...word].map((char, i) => {
              const t = input[i];
              let cls = 'text-white border-b-2 border-accent';
              if (t !== undefined) cls = t === char ? 'text-accent' : 'text-red-400';
              return <span key={i} className={`font-mono text-xl ${cls}`}>{char}</span>;
            })}
            {input.length > word.length && (
              <span className="font-mono text-xl text-red-400">
                {input.slice(word.length)}
              </span>
            )}
          </span>
        );
      }
      if (isPast) {
        const compData = completed[absIdx];
        const typed = compData?.typed || '';
        const expected = compData?.expected || word;
        return (
          <span key={absIdx} className="inline-block mx-1 my-0.5 font-mono text-xl opacity-40">
            {[...expected].map((char, j) => {
              const t = typed?.[j];
              const isCorrect = t === char;
              const color = t == null ? 'text-accent' : isCorrect ? 'text-accent' : 'text-red-400';
              return (
                <span key={j} className={color}>
                  {char}
                </span>
              );
            })}
            {typed && [...typed].slice(expected.length).map((c, j) => (
              <span key={`ex-${j}`} className="text-red-400">{c}</span>
            ))}
          </span>
        );
      }
      return (
        <span key={absIdx} className="inline-block mx-1 my-0.5 font-mono text-xl text-white opacity-20">
          {word}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-14 max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* PRE */}
          {phase === 'pre' && (
            <motion.div key="pre" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-10 py-12">
              <div className="text-center">
                <p className="text-6xl mb-4">⚡</p>
                <h1 className="text-4xl font-black text-white mb-2">Speed Test</h1>
                <p className="text-text-secondary">Test your typing speed with timed sessions</p>
              </div>

              {/* Timer selector */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-text-secondary text-sm uppercase tracking-widest">Select Duration</p>
                <div className="flex gap-2">
                  {TIMER_OPTIONS.map((opt, i) => (
                    <button key={i} onClick={() => setSelectedTimer(i)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border
                        ${selectedTimer === i
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-surface border-border text-text-secondary hover:border-accent hover:text-white'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startTest} className="btn-primary text-lg px-12 py-4">
                ▶ Start Test
              </button>

              <div className="card max-w-sm w-full text-center text-sm text-text-secondary">
                <p>⌨️ Start typing — timer begins on first keypress</p>
                <p className="mt-1">Press <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded font-mono text-accent text-xs">Esc</kbd> to end early</p>
              </div>
            </motion.div>
          )}

          {/* TYPING */}
          {phase === 'typing' && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-6">

              {/* HUD */}
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="font-black font-mono text-3xl" style={{ color: timerColor }}>{formatTime(timeLeft)}</p>
                    <p className="text-text-secondary text-xs">TIME</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black font-mono text-3xl text-accent">{liveWpm}</p>
                    <p className="text-text-secondary text-xs">WPM</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black font-mono text-3xl text-white">{correctWords}</p>
                    <p className="text-text-secondary text-xs">WORDS</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  {!started && (
                    <span className="text-text-secondary text-sm animate-pulse">Start typing...</span>
                  )}
                  <button onClick={finishTest}
                    className="px-4 py-2 bg-surface border border-border text-text-secondary text-sm rounded-lg hover:border-red-500 hover:text-red-400 transition-all">
                    ✕ End
                  </button>
                </div>
              </div>

              {/* Timer bar */}
              <div className="h-1 bg-surface rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full transition-all"
                  style={{
                    width: `${(timeLeft / duration) * 100}%`,
                    background: timerColor,
                    boxShadow: `0 0 8px ${timerColor}`,
                  }} />
              </div>

              {/* Words area */}
              <div className="card min-h-[160px] cursor-text overflow-hidden relative"
                onClick={() => inputRef.current?.focus()}>
                <div className="leading-relaxed flex flex-wrap">
                  {renderWords()}
                </div>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  onBlur={() => { if (phase === 'typing') setTimeout(() => inputRef.current?.focus(), 10); }}
                  className="opacity-0 fixed top-0 left-0 w-1 h-1"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                />
              </div>

              {/* Live WPM mini graph */}
              {wpmHistory.length > 1 && (
                <div className="card py-3">
                  <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">Live WPM</p>
                  <WpmGraph data={wpmHistory} />
                </div>
              )}
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && finalStats && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-6 py-4">

              <div className="text-center">
                <p className="text-5xl mb-3">🎯</p>
                <h2 className="text-3xl font-black text-white">Test Complete!</h2>
                <p className="text-text-secondary text-sm mt-1">Duration: {formatTime(finalStats.duration)}</p>
              </div>

              {/* Main stats */}
              {finalStats.forgePoints > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="card text-center py-4 mb-1 border-accent/30"
                  style={{ background: 'rgba(0,255,159,0.06)' }}>
                  <p className="text-accent text-xs font-mono uppercase tracking-widest mb-1">⚡ Forge Points Earned</p>
                  <p className="text-5xl font-black text-accent">+{finalStats.forgePoints}</p>
                  <p className="text-text-secondary text-xs mt-1">Added to leaderboard</p>
                </motion.div>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="card text-center py-5">
                  <p className="text-4xl font-black text-accent">{finalStats.wpm}</p>
                  <p className="text-text-secondary text-xs mt-1">WPM</p>
                  <p className="text-text-secondary text-xs opacity-50">net</p>
                </div>
                <div className="card text-center py-5">
                  <p className="text-4xl font-black text-white">{finalStats.rawWpm}</p>
                  <p className="text-text-secondary text-xs mt-1">RAW WPM</p>
                  <p className="text-text-secondary text-xs opacity-50">incl. errors</p>
                </div>
                <div className="card text-center py-5">
                  <p className="text-4xl font-black" style={{ color: finalStats.accuracy >= 95 ? '#00ff9f' : finalStats.accuracy >= 85 ? '#fbbf24' : '#ff4d6d' }}>
                    {finalStats.accuracy}%
                  </p>
                  <p className="text-text-secondary text-xs mt-1">ACCURACY</p>
                </div>
                <div className="card text-center py-5">
                  <p className="text-4xl font-black text-white">{finalStats.correctWords}</p>
                  <p className="text-text-secondary text-xs mt-1">WORDS</p>
                  <p className="text-text-secondary text-xs opacity-50">correct</p>
                </div>
              </div>

              {/* Detailed breakdown */}
              <div className="card">
                <p className="text-text-secondary text-xs uppercase tracking-widest mb-4">Breakdown</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Correct characters</span>
                    <span className="text-accent font-bold font-mono">{finalStats.correctChars}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Wrong characters</span>
                    <span className="text-red-400 font-bold font-mono">{finalStats.wrongChars}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total keystrokes</span>
                    <span className="text-white font-mono">{finalStats.correctChars + finalStats.wrongChars}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Error rate</span>
                    <span className="text-white font-mono">
                      {finalStats.correctChars + finalStats.wrongChars > 0
                        ? ((finalStats.wrongChars / (finalStats.correctChars + finalStats.wrongChars)) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Chars per minute</span>
                    <span className="text-white font-mono">
                      {Math.round((finalStats.correctChars / (finalStats.duration / 60)) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Consistency</span>
                    <span className="text-white font-mono">
                      {finalStats.wpmGraph.length > 1
                        ? (() => {
                            const wpms = finalStats.wpmGraph.map(d => d.wpm);
                            const avg = wpms.reduce((a, b) => a + b, 0) / wpms.length;
                            const variance = wpms.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / wpms.length;
                            const cv = avg > 0 ? Math.round((1 - Math.sqrt(variance) / avg) * 100) : 100;
                            return `${Math.max(0, Math.min(100, cv))}%`;
                          })()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* WPM Graph */}
              {finalStats.wpmGraph.length > 1 && (
                <div className="card">
                  <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">WPM Over Time</p>
                  <WpmGraph data={finalStats.wpmGraph} />
                </div>
              )}

              {/* Accuracy bar */}
              <div className="card">
                <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">Accuracy Breakdown</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-4 rounded-full overflow-hidden bg-surface border border-border">
                    <div className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${finalStats.accuracy}%` }} />
                  </div>
                  <span className="text-accent font-bold font-mono text-sm w-12 text-right">{finalStats.accuracy}%</span>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                  <span>✓ {finalStats.correctChars} correct</span>
                  <span>✗ {finalStats.wrongChars} errors</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                <button onClick={startTest} className="btn-primary px-8 py-3">🔄 Try Again</button>
                <button onClick={() => setPhase('pre')}
                  className="px-8 py-3 bg-surface border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">
                  Change Duration
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}