import { useRef, useEffect } from 'react';

// 3-line MonkeyType style — no | cursor, green underline on current char
export const TypingArea = ({ words = [], wordIndex = 0, input = '', completed = [], onInput }) => {
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [words, wordIndex]);

  // Split words into 3 display lines of ~8 words each
  const WORDS_PER_LINE = 8;
  const currentLine = Math.floor(wordIndex / WORDS_PER_LINE);
  const lineStart = currentLine * WORDS_PER_LINE;

  const line0 = words.slice(Math.max(0, lineStart - WORDS_PER_LINE), lineStart);       // previous line (dimmed)
  const line1 = words.slice(lineStart, lineStart + WORDS_PER_LINE);                     // active line
  const line2 = words.slice(lineStart + WORDS_PER_LINE, lineStart + WORDS_PER_LINE * 2); // next line (dimmed)

  const posInLine = wordIndex - lineStart; // 0..7 within active line

  const renderWord = (word, wIdx, isActive, isPast, typed, wasCorrect) => {
    if (isActive) {
      return (
        <span key={wIdx} className="relative font-mono text-2xl">
          {[...word].map((char, i) => {
            const t = typed?.[i];
            let cls = 'text-white';
            if (t != null) cls = t === char ? 'text-accent' : 'text-red-400';
            // underline current char position
            const isCurrent = i === (typed?.length ?? 0);
            return (
              <span key={i} className={`${cls} ${isCurrent ? 'border-b-2 border-accent' : ''}`}>
                {char}
              </span>
            );
          })}
          {/* extra typed chars beyond word length */}
          {typed && [...typed].slice(word.length).map((c, i) => (
            <span key={`extra-${i}`} className="text-red-400">{c}</span>
          ))}
        </span>
      );
    }
    if (isPast) {
      return (
        <span key={wIdx} className="font-mono text-2xl opacity-50">
          {[...word].map((char, i) => {
            const t = typed?.[i];
            const isCorrect = t === char;
            const color = t == null ? 'text-accent' : isCorrect ? 'text-accent' : 'text-red-400';
            return (
              <span key={i} className={color}>
                {char}
              </span>
            );
          })}
          {typed && [...typed].slice(word.length).map((c, i) => (
            <span key={`ex-${i}`} className="text-red-400">{c}</span>
          ))}
        </span>
      );
    }
    return (
      <span key={wIdx} className="font-mono text-2xl text-white opacity-30">{word}</span>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto" onClick={() => inputRef.current?.focus()}>
      <div className="flex flex-col gap-3 min-h-[120px]">
        {/* Line 0: previous (dimmed) */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 opacity-40">
          {line0.map((w, i) => {
            const globalIdx = lineStart - WORDS_PER_LINE + i;
            const typed = completed[globalIdx]?.typed || '';
            const expected = completed[globalIdx]?.expected || w;
            return (
              <span key={i} className="font-mono text-2xl">
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
          })}
        </div>

        {/* Line 1: active */}
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {line1.map((w, i) => {
            const globalIdx = lineStart + i;
            const isActive = globalIdx === wordIndex;
            const isPast = globalIdx < wordIndex;
            const wasCorrect = isPast ? completed[globalIdx]?.correct : null;
            const typed = isActive ? input : (isPast ? completed[globalIdx]?.typed : null);
            return renderWord(w, i, isActive, isPast, typed, wasCorrect);
          })}
        </div>

        {/* Line 2: upcoming (dimmed) */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 opacity-30">
          {line2.map((w, i) => (
            <span key={i} className="font-mono text-2xl text-white">{w}</span>
          ))}
        </div>
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={onInput}
  onBlur={() => setTimeout(() => inputRef.current?.focus(), 10)}
        className="opacity-0 fixed top-0 left-0 w-1 h-1"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
};

export default TypingArea;
