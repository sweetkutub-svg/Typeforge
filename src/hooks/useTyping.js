import { useState, useEffect, useRef, useCallback } from 'react';
import { updateKeyStats } from '../lib/adaptive';

const tickSound = typeof window !== 'undefined' ? new Audio('/sounds/tick.mp3') : null;
const playTick = () => {
  if (!tickSound) return;
  tickSound.currentTime = 0;
  tickSound.volume = 0.4;
  tickSound.play().catch(() => {});
};

export const useTyping = ({ words = [], mode = 'word', onComplete, onNeedMoreChars, onCharError }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [input, setValue] = useState('');
const inputRef = useRef('');  // ← ADD THIS
  const [completed, setCompleted] = useState([]);
  const [errors, setErrors] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [keyStats, setKeyStats] = useState({});
  const startTimeRef = useRef(null);
  const idleRef = useRef(null);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!started || paused) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [started, paused]);

  const elapsed = started && startTimeRef.current
    ? (Date.now() - startTimeRef.current) / 60000
    : 0.0001;
  const totalCharsTyped = mode === 'char'
    ? completed.length
    : completed.reduce((acc, w) => acc + (w.expected?.length ?? 0), 0);
  const grossWpm = totalCharsTyped > 0 ? (totalCharsTyped / 5) / elapsed : 0;
  const accuracy = totalChars > 0
    ? Math.max(0, Math.round(((totalChars - errors) / totalChars) * 100))
    : 100;
  const netWpm = totalCharsTyped > 0 ? Math.max(0, Math.round(grossWpm * (accuracy / 100))) : 0;
  const wpm = netWpm;

  const clearIdle = () => { if (idleRef.current) clearTimeout(idleRef.current); };

  const pause = useCallback(() => {
    if (!started || paused) return;
    setPaused(true);
    clearIdle();
  }, [started, paused]);

  const resume = useCallback(() => {
    if (!paused) return;
    setPaused(false);
  }, [paused]);

  useEffect(() => {
  }, []);

  useEffect(() => () => clearIdle(), []);

  // CHAR MODE — single keypress
  const handleCharKey = useCallback((e) => {
    if (paused) return;
    const key = e.key;
    if (key.length !== 1) return;

    const expected = words[wordIndex] ?? '';

    // No char available — trigger refill and wait
    if (!expected) {
      if (onNeedMoreChars) onNeedMoreChars();
      return;
    }

    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }

    clearIdle();
    idleRef.current = setTimeout(() => pause(), 7000);

    const isCorrect = key === expected;

    if (!isCorrect) {
      // Wrong character — show error, don't advance
      if (onCharError) onCharError();
      return;
    }

    // Correct character — proceed
    playTick();
    setKeyStats((prev) => updateKeyStats(prev, key, expected));
    setTotalChars((prev) => prev + 1);

    setCompleted((prev) => [...prev, { typed: key, expected, correct: isCorrect }]);

    const nextIndex = wordIndex + 1;
    setWordIndex(nextIndex);

    // When 100 chars remaining, ask parent to append more
    if (onNeedMoreChars && nextIndex >= words.length - 100) {
      onNeedMoreChars();
    }
  }, [paused, started, words, wordIndex, pause, onNeedMoreChars, onCharError]);

  // WORD MODE — space to submit
  const handleInput = useCallback((e) => {
    const val = e.target.value;
    console.log('handleInput called:', val, 'paused:', paused, 'words len:', words.length, 'wordIndex:', wordIndex);
    if (paused) return;

    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }

    clearIdle();
    idleRef.current = setTimeout(() => pause(), 7000);

    if (val.endsWith(' ')) {
      playTick();
      const typed = val.trim();
      const expected = words[wordIndex] ?? '';
      const newErrors = [...typed].filter((c, i) => c !== expected[i]).length
        + Math.abs(typed.length - expected.length);
      setErrors((prev) => prev + newErrors);
      setTotalChars((prev) => prev + expected.length);
      setKeyStats((prev) => updateKeyStats(prev, typed, expected));
      setCompleted((prev) => [...prev, { typed, expected, correct: typed === expected }]);
      setWordIndex((prev) => prev + 1);
      setValue('');
    } else {
      if (val.length > inputRef.current.length) playTick(); // ← ref use karo
      inputRef.current = val;
      setValue(val);
    }
  }, [paused, started, words, wordIndex, pause]); // ← 'input' HATAO

  const reset = useCallback(() => {
    clearIdle();
    setWordIndex(0);
    inputRef.current = '';
    setValue('');
    setCompleted([]);
    setErrors(0);
    setTotalChars(0);
    setStarted(false);
    setPaused(false);
    setKeyStats({});
    startTimeRef.current = null;
  }, []);

  const currentWord = words[wordIndex] ?? '';
  const upcomingWords = words.slice(wordIndex + 1, wordIndex + 5);

  const timeElapsed = started && startTimeRef.current
    ? Math.floor((now - startTimeRef.current) / 1000)
    : 0;

  return {
    input, wordIndex, completed, wpm, accuracy,
    started, paused, keyStats,
    handleInput, handleCharKey, reset, pause, resume,
    currentWord,
    upcomingWords,
    timeElapsed,
  };
};