import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

// Single chars for Easy
const EASY_CHARS = 'asdfjkl;asdfjkl;asdfjkl;ertyuiop'.split('');

// 2-3 letter words for Medium
const MEDIUM_WORDS = [
  'ad','am','an','as','at','be','by','do','go','he','hi','if','in','is','it','me','my','no','of','on','or','so','to','up','us','we',
  'add','age','ago','aid','aim','air','all','arm','art','ask','bad','bag','ban','bar','bat','bed','big','bit','box','boy','bus','but','buy',
  'can','cap','car','cat','cop','cow','cry','cup','cut','dad','dam','day','dig','dim','dip','dog','dot','dry','due','dug','dye','ear','eat',
  'egg','end','era','eye','fan','far','fat','few','fit','fix','fly','fog','for','fun','fur','gap','gas','gel','get','god','got','gun','gut',
  'gym','had','ham','has','hat','hay','her','him','hip','his','hit','hog','hop','hot','how','hub','hug','hut','ice','icy','ill','ink','ion',
  'ire','ivy','jab','jam','jar','jaw','jet','job','jog','joy','jug','key','kid','kit','lab','lag','law','lay','led','leg','let','lid','lip',
  'lit','log','lot','low','mad','map','mat','may','men','met','mix','mob','mod','mop','mud','mug','nap','net','nip','nod','not','nun','nut',
  'oak','odd','oil','old','opt','orb','ore','our','out','own','pad','pan','pat','paw','pay','peg','pen','pet','pie','pig','pin','pit','ply',
  'pod','pop','pot','pro','pub','pun','pup','put','rag','ran','rap','rat','raw','ray','ref','rep','rid','rig','rip','rob','rod','rot','row',
  'rub','rug','run','rut','sad','sap','sat','saw','say','set','sew','she','shy','sin','sip','sir','sit','six','ski','sky','sly','sob','son',
  'sow','spa','spy','sum','sun','sup','tab','tan','tap','tar','tax','tea','ten','the','tie','tin','tip','toe','ton','too','top','toy','try',
  'tub','tug','two','use','van','vat','vow','wag','war','was','wax','web','wed','wet','who','why','wig','win','wit','woe','wok','won','woo',
];

// 3-5 letter words for Hard+
const HARD_WORDS = [
  'able','also','area','army','away','back','ball','band','bank','base','bath','bear','beat','been','bell','best','bird','blow','blue',
  'bold','bolt','bond','bone','book','boom','boot','born','boss','both','bowl','burn','busy','call','came','card','care','cart','case',
  'cash','cast','cave','cell','chat','chip','city','clap','clay','clip','club','clue','coal','coat','code','coil','cold','come','cook',
  'cool','copy','cord','core','corn','cost','crew','crop','cube','cure','cute','dark','data','date','dead','deal','dear','debt','deck',
  'deep','deny','desk','diet','dirt','disk','dock','does','done','door','dose','down','draw','drop','drug','drum','dull','dump','dust',
  'duty','each','earn','east','easy','edge','even','ever','evil','face','fact','fail','fair','fall','fame','farm','fast','fate','feel',
  'feet','fell','felt','file','fill','film','find','fine','fire','firm','fish','fist','flat','flew','flip','flow','fold','food','fool',
  'foot','ford','form','fort','four','free','frog','from','fuel','full','fund','gain','game','gang','gave','gaze','gear','give','glad',
  'glow','glue','goal','gold','golf','gone','good','grab','grew','grid','grip','grow','gulf','guys','half','hall','halt','hand','hang',
  'hard','harm','hate','have','head','heal','hear','heat','heel','held','help','here','hero','hide','high','hill','hint','hold','hole',
  'home','hook','hope','horn','host','hour','huge','hung','hunt','hurt','idea','inch','into','iron','item','jail','joke','jump','just',
  'keep','kill','kind','king','kiss','know','lack','lake','land','lane','last','late','lead','leaf','lean','leap','left','like','lime',
  'line','link','list','live','load','loan','lock','lone','long','look','loop','lord','lose','loss','lost','loud','love','luck','lung',
  'made','mail','main','make','many','mark','mass','math','mean','meat','meet','melt','menu','mild','milk','mill','mind','mine','mint',
  'miss','mode','mood','moon','more','most','move','much','must','myth','nail','name','navy','near','neck','need','next','nice','nine',
  'none','noon','norm','nose','note','oath','once','only','open','over','pace','pack','page','pain','pair','pale','palm','park','part',
  'pass','past','path','peak','peel','pick','pile','pine','pink','pipe','plan','play','plot','plug','plus','poem','pole','pond','pool',
  'poor','port','pose','post','pour','pray','pull','pump','pure','push','quit','race','rail','rain','ramp','rank','rate','read','real',
  'rear','rely','rent','rest','rice','rich','ride','ring','rise','risk','road','rock','role','roll','roof','room','root','rope','rose',
  'ruin','rule','rush','rust','safe','sail','sake','salt','same','sand','save','scan','seat','seek','self','sell','send','sent','ship',
  'shop','shot','show','shut','sick','side','sign','silk','sing','sink','site','size','skin','slam','slip','slow','snap','snow','soap',
  'sock','soft','soil','sold','sole','some','song','soon','sore','sort','soul','soup','sour','span','spin','spot','star','stay','stem',
  'step','stir','stop','such','suit','swap','swim','tale','talk','tall','tank','task','tear','tell','tend','tent','term','test','text',
  'than','that','them','then','they','thin','this','tide','till','time','tiny','tire','told','toll','tone','took','tool','torn','toss',
  'tour','town','trap','tray','tree','trim','trip','true','tube','tune','turn','twin','type','unit','upon','used','vale','veil','vein',
  'verb','very','vest','view','vine','void','vote','wade','wage','wait','wake','walk','wall','want','warm','warn','wary','wash','wave',
  'weak','well','went','were','west','what','when','wide','wife','wild','will','wind','wine','wing','wire','wise','wish','with','wolf',
  'word','wore','work','worm','worn','wrap','yard','year','your','zone',
];

const LEVELS = [
  { name: "Easy",   pool: EASY_CHARS,  isChar: true,  speed: 0.5, spawnRate: 2800, maxWords: 3,  color: "#00ff9f" },
  { name: "Medium", pool: MEDIUM_WORDS, isChar: false, speed: 0.8, spawnRate: 2200, maxWords: 5,  color: "#00d4ff" },
  { name: "Hard",   pool: HARD_WORDS,  isChar: false, speed: 1.4, spawnRate: 1500, maxWords: 7,  color: "#a78bfa" },
  { name: "Insane", pool: HARD_WORDS,  isChar: false, speed: 2.2, spawnRate: 900,  maxWords: 10, color: "#ff4d6d" },
];

let wordId = 0;
const randomItem = (pool) => pool[Math.floor(Math.random() * pool.length)];
const randomX = () => Math.floor(Math.random() * 70) + 10;

const playTick = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06);
  } catch(e) {}
};

const playShoot = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    src.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch(e) {}
};

// =================== SPEED BURST ===================
const BURST_WORDS = [...MEDIUM_WORDS, ...HARD_WORDS.slice(0, 100)];

function SpeedBurst({ onBack }) {
  const [phase, setPhase] = useState('pre');
  const [timeLeft, setTimeLeft] = useState(10);
  const [current, setCurrent] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    try { setBestScore(parseInt(localStorage.getItem('tf_burst_best') || '0')); } catch {}
  }, []);

  const getNextWord = () => BURST_WORDS[Math.floor(Math.random() * BURST_WORDS.length)];

  const start = () => {
    scoreRef.current = 0;
    setScore(0); setWrong(0); setTimeLeft(10);
    setCurrent(getNextWord());
    setInput(''); setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          try {
            const b = parseInt(localStorage.getItem('tf_burst_best') || '0');
            if (scoreRef.current > b) localStorage.setItem('tf_burst_best', String(scoreRef.current));
            setBestScore(Math.max(b, scoreRef.current));
          } catch {}
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(' ')) {
      const typed = val.trim();
      if (typed === current) {
        scoreRef.current += 1;
        setScore(s => s + 1);
      } else {
        setWrong(w => w + 1);
      }
      setCurrent(getNextWord());
      setInput('');
    } else {
      setInput(val);
    }
  };

  const accuracy = score + wrong > 0 ? Math.round((score / (score + wrong)) * 100) : 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 px-4">
      {phase === 'pre' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-5xl mb-3">⏱️</p>
            <h2 className="text-3xl font-black text-white mb-2">Speed Burst</h2>
            <p className="text-text-secondary">Type as many words as you can in <span className="text-accent font-bold">10 seconds!</span></p>
            {bestScore > 0 && <p className="mt-2 text-sm font-mono text-accent">🏆 Best: {bestScore} words</p>}
          </div>
          <button onClick={start} className="btn-primary text-lg px-10 py-4">▶ Start</button>
          <button onClick={onBack} className="text-text-secondary text-sm hover:text-white transition-colors">← Back</button>
        </motion.div>
      )}
      {phase === 'playing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 w-full max-w-md">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-black" style={{ color: timeLeft <= 3 ? '#ff4d6d' : '#00ff9f' }}>{timeLeft}</p>
              <p className="text-text-secondary text-xs">SECONDS</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-accent">{score}</p>
              <p className="text-text-secondary text-xs">WORDS</p>
            </div>
          </div>
          <div className="card w-full text-center py-8">
            <p className="text-3xl font-black text-white font-mono">{current}</p>
          </div>
          <input
            ref={inputRef} value={input} onChange={handleChange}
            className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-white font-mono text-xl text-center outline-none focus:border-accent transition-colors"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            placeholder="type then space..."
          />
        </motion.div>
      )}
      {phase === 'result' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <p className="text-5xl">🏁</p>
          <h2 className="text-3xl font-black text-white">Time's Up!</h2>
          <div className="card w-full max-w-xs grid grid-cols-3 gap-4 text-center">
            <div><p className="text-3xl font-black text-accent">{score}</p><p className="text-xs text-text-secondary mt-1">WORDS</p></div>
            <div><p className="text-3xl font-black text-white">{accuracy}%</p><p className="text-xs text-text-secondary mt-1">ACCURACY</p></div>
            <div><p className="text-3xl font-black text-yellow-400">{bestScore}</p><p className="text-xs text-text-secondary mt-1">BEST</p></div>
          </div>
          {score >= bestScore && score > 0 && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-accent font-bold text-sm">🎉 New Best!</motion.p>
          )}
          <div className="flex gap-3">
            <button onClick={start} className="btn-primary px-8 py-3">🔄 Again</button>
            <button onClick={onBack} className="px-8 py-3 bg-surface border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">← Back</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// =================== HANGMAN ===================
const HANGMAN_WORDS = [
  'python','javascript','keyboard','monitor','browser','network','function','variable',
  'algorithm','database','terminal','frontend','backend','developer','interface',
  'component','framework','debugging','compiler','recursion','syntax','pointer',
  'boolean','integer','string','array','object','method','class','module',
];
const HANGMAN_STAGES = ['😶','😐','😮','😨','😱','💀'];

function Hangman({ onBack }) {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState(new Set());
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState('pre');
  const [score, setScore] = useState(0);
  const MAX_WRONG = 5;

  const start = () => {
    const w = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
    setWord(w); setGuessed(new Set()); setWrong(0); setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (!/^[a-z]$/.test(k) || guessed.has(k)) return;
      const newGuessed = new Set([...guessed, k]);
      setGuessed(newGuessed);
      if (!word.includes(k)) {
        const newWrong = wrong + 1;
        setWrong(newWrong);
        if (newWrong > MAX_WRONG) { setPhase('lose'); return; }
      }
      const won = [...word].every(c => newGuessed.has(c));
      if (won) { setScore(s => s + 1); setPhase('win'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, guessed, word, wrong]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 px-4">
      {phase === 'pre' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-5xl mb-3">🎯</p>
            <h2 className="text-3xl font-black text-white mb-2">Hangman</h2>
            <p className="text-text-secondary">Guess the typing-related word letter by letter</p>
            <p className="text-text-secondary text-sm mt-1">Max <span className="text-red-400 font-bold">{MAX_WRONG}</span> wrong guesses allowed</p>
          </div>
          <button onClick={start} className="btn-primary text-lg px-10 py-4">▶ Start</button>
          <button onClick={onBack} className="text-text-secondary text-sm hover:text-white transition-colors">← Back</button>
        </motion.div>
      )}
      {phase === 'playing' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full max-w-md">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-5xl">{HANGMAN_STAGES[Math.min(wrong, HANGMAN_STAGES.length - 1)]}</p>
              <p className="text-xs text-text-secondary mt-1">{wrong}/{MAX_WRONG} wrong</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-accent">{score}</p>
              <p className="text-xs text-text-secondary">SOLVED</p>
            </div>
          </div>
          {/* Word display */}
          <div className="flex gap-2 flex-wrap justify-center my-2">
            {[...word].map((c, i) => (
              <div key={i} className="w-9 h-10 border-b-2 border-accent flex items-end justify-center pb-1">
                <span className="text-xl font-black text-white font-mono">
                  {guessed.has(c) ? c.toUpperCase() : ''}
                </span>
              </div>
            ))}
          </div>
          <p className="text-text-secondary text-sm">Press any letter key to guess</p>
          {/* Keyboard display */}
          <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
            {'abcdefghijklmnopqrstuvwxyz'.split('').map(c => (
              <span key={c} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold font-mono border transition-all
                ${guessed.has(c)
                  ? word.includes(c)
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-red-500/10 border-red-500/30 text-red-400 opacity-40'
                  : 'bg-surface border-border text-white'}`}>
                {c.toUpperCase()}
              </span>
            ))}
          </div>
        </motion.div>
      )}
      {(phase === 'win' || phase === 'lose') && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <p className="text-6xl">{phase === 'win' ? '🎉' : '💀'}</p>
          <h2 className="text-3xl font-black text-white">{phase === 'win' ? 'Correct!' : 'Game Over!'}</h2>
          {phase === 'lose' && (
            <p className="text-text-secondary">Word was: <span className="text-accent font-bold font-mono">{word.toUpperCase()}</span></p>
          )}
          <p className="text-accent font-bold text-lg">Score: {score}</p>
          <div className="flex gap-3">
            <button onClick={start} className="btn-primary px-8 py-3">
              {phase === 'win' ? '▶ Next Word' : '🔄 Try Again'}
            </button>
            <button onClick={onBack} className="px-8 py-3 bg-surface border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">← Back</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// =================== WORD SCRAMBLE ===================
const SCRAMBLE_WORDS = [...HARD_WORDS.slice(0, 150)];

const scrambleWord = (w) => {
  const arr = w.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('') === w ? scrambleWord(w) : arr.join('');
};

function Scramble({ onBack }) {
  const [phase, setPhase] = useState('pre');
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [bestScore, setBestScore] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    try { setBestScore(parseInt(localStorage.getItem('tf_scramble_best') || '0')); } catch {}
  }, []);

  const nextWord = (currentScore) => {
    const w = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    setWord(w); setScrambled(scrambleWord(w));
    setInput(''); setWrong(false); setTimeLeft(20);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('lose');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const start = () => {
    scoreRef.current = 0;
    setScore(0); setPhase('playing');
    nextWord(0);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleChange = (e) => {
    const val = e.target.value.toLowerCase();
    setInput(val);
    setWrong(false);
    if (val === word) {
      clearInterval(timerRef.current);
      scoreRef.current += 1;
      const newScore = scoreRef.current;
      setScore(newScore);
      try {
        const b = parseInt(localStorage.getItem('tf_scramble_best') || '0');
        if (newScore > b) {
          localStorage.setItem('tf_scramble_best', String(newScore));
          setBestScore(newScore);
        }
      } catch {}
      setPhase('correct');
      setTimeout(() => { setPhase('playing'); nextWord(newScore); }, 800);
    } else if (val.length === word.length) {
      setWrong(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 px-4">
      {phase === 'pre' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-5xl mb-3">🔀</p>
            <h2 className="text-3xl font-black text-white mb-2">Word Scramble</h2>
            <p className="text-text-secondary">Unscramble the word before time runs out!</p>
            {bestScore > 0 && <p className="mt-2 text-sm font-mono text-accent">🏆 Best: {bestScore} words</p>}
          </div>
          <button onClick={start} className="btn-primary text-lg px-10 py-4">▶ Start</button>
          <button onClick={onBack} className="text-text-secondary text-sm hover:text-white transition-colors">← Back</button>
        </motion.div>
      )}
      {(phase === 'playing' || phase === 'correct') && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 w-full max-w-md">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-black" style={{ color: timeLeft <= 5 ? '#ff4d6d' : '#00ff9f' }}>{timeLeft}</p>
              <p className="text-xs text-text-secondary">SECONDS</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-accent">{score}</p>
              <p className="text-xs text-text-secondary">SCORE</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-yellow-400">{bestScore}</p>
              <p className="text-xs text-text-secondary">BEST</p>
            </div>
          </div>
          <div className="card w-full text-center py-6">
            <p className="text-text-secondary text-xs mb-2 uppercase tracking-widest">Unscramble this</p>
            <p className="text-4xl font-black text-white font-mono tracking-widest">{scrambled.toUpperCase()}</p>
            <p className="text-text-secondary text-xs mt-2">{word.length} letters</p>
          </div>
          <input
            ref={inputRef} value={input} onChange={handleChange}
            className={`w-full bg-surface border-2 rounded-xl px-4 py-3 text-white font-mono text-xl text-center outline-none transition-colors
              ${phase === 'correct' ? 'border-accent' : wrong ? 'border-red-500' : 'border-border focus:border-accent'}`}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            placeholder="type the word..."
          />
          {phase === 'correct' && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-accent font-bold">✓ Correct!</motion.p>
          )}
          {wrong && <p className="text-red-400 text-sm">Not right, keep trying!</p>}
          <button onClick={() => { clearInterval(timerRef.current); nextWord(score); }}
            className="text-text-secondary text-xs hover:text-white transition-colors">Skip →</button>
        </motion.div>
      )}
      {phase === 'lose' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <p className="text-5xl">⏰</p>
          <h2 className="text-3xl font-black text-white">Time's Up!</h2>
          <p className="text-text-secondary">Word was: <span className="text-accent font-bold font-mono">{word.toUpperCase()}</span></p>
          <div className="card w-full max-w-xs grid grid-cols-2 gap-4 text-center">
            <div><p className="text-3xl font-black text-accent">{score}</p><p className="text-xs text-text-secondary mt-1">SCORE</p></div>
            <div><p className="text-3xl font-black text-yellow-400">{bestScore}</p><p className="text-xs text-text-secondary mt-1">BEST</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={start} className="btn-primary px-8 py-3">🔄 Again</button>
            <button onClick={onBack} className="px-8 py-3 bg-surface border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">← Back</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// =================== MAIN GAMES PAGE ===================
function Games() {
  const [screen, setScreen] = useState('hub');
  const [levelIdx, setLevelIdx] = useState(0);
  const [fallingWords, setFallingWords] = useState([]);
  const [typedSoFar, setTypedSoFar] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [exploding, setExploding] = useState([]);
  const [shake, setShake] = useState(false);
  const [bullets, setBullets] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [newBest, setNewBest] = useState(false);

  useEffect(() => {
    try { setBestScore(parseInt(localStorage.getItem('tf_wordfall_best') || '0')); } catch {}
  }, []);

  const gameRef = useRef(null);
  const animRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const livesRef = useRef(3);
  const levelIdxRef = useRef(0);
  const fallingRef = useRef([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const wordsTypedRef = useRef(0);
  const maxComboRef = useRef(0);
  const typedRef = useRef('');
  const isWrongRef = useRef(false);
  const bulletId = useRef(0);

  const level = LEVELS[levelIdx];

  const startGame = (idx) => {
    wordId = 0;
    setLevelIdx(idx); levelIdxRef.current = idx;
    setFallingWords([]); fallingRef.current = [];
    setTypedSoFar(''); typedRef.current = '';
    setIsWrong(false); isWrongRef.current = false;
    setScore(0); scoreRef.current = 0;
    setLives(3); livesRef.current = 3;
    setCombo(0); comboRef.current = 0;
    setMaxCombo(0); maxComboRef.current = 0;
    setWordsTyped(0); wordsTypedRef.current = 0;
    setExploding([]); setBullets([]);
    setNewBest(false);
    lastSpawnRef.current = 0;
    setScreen('playing');
  };

  // Game loop
  useEffect(() => {
    if (screen !== 'playing') return;
    const GAME_H = gameRef.current?.clientHeight || 480;
    let last = performance.now();

    const tick = (now) => {
      const delta = Math.min(now - last, 50);
      last = now;
      const lv = LEVELS[levelIdxRef.current];
      const move = (lv.speed * GAME_H * delta) / 8000;

      if (now - lastSpawnRef.current > lv.spawnRate && fallingRef.current.length < lv.maxWords) {
        fallingRef.current = [...fallingRef.current, {
          id: wordId++, text: randomItem(lv.pool), x: randomX(), y: -40,
        }];
        lastSpawnRef.current = now;
      }

      let lostLife = false;
      const updated = [];
      for (const w of fallingRef.current) {
        const ny = w.y + move;
        if (ny >= GAME_H - 55) {
          lostLife = true;
          livesRef.current -= 1;
          setLives(livesRef.current);
          comboRef.current = 0; setCombo(0);
          typedRef.current = ''; setTypedSoFar('');
          isWrongRef.current = false; setIsWrong(false);
        } else {
          updated.push({ ...w, y: ny });
        }
      }
      fallingRef.current = updated;
      setFallingWords([...updated]);

      if (lostLife) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }

      if (livesRef.current <= 0) {
        cancelAnimationFrame(animRef.current);
        const s = scoreRef.current;
        setBestScore(prev => {
          const nb = Math.max(prev, s);
          if (nb > prev) setNewBest(true);
          try { localStorage.setItem('tf_wordfall_best', String(nb)); } catch {}
          return nb;
        });
        setScore(s); setMaxCombo(maxComboRef.current); setWordsTyped(wordsTypedRef.current);
        setScreen('gameover');
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [screen]);

  // Keydown handler
  useEffect(() => {
    if (screen !== 'playing') return;
    const onKey = (e) => {
      if (e.key === 'Backspace') { e.preventDefault(); return; }
      if (e.key.length !== 1) return;
      e.preventDefault();
      const lv = LEVELS[levelIdxRef.current];
      const key = e.key;
      playTick();

      if (lv.isChar) {
        const match = fallingRef.current.find(w => w.text === key);
        if (match) {
          fireShot(match);
        } else {
          setIsWrong(true); isWrongRef.current = true;
          setTimeout(() => { setIsWrong(false); isWrongRef.current = false; }, 300);
        }
      } else {
        const newTyped = typedRef.current + key;
        typedRef.current = newTyped;
        const matchPrefix = fallingRef.current.find(w => w.text.toLowerCase().startsWith(newTyped.toLowerCase()));
        const exactMatch = fallingRef.current.find(w => w.text.toLowerCase() === newTyped.toLowerCase());

        if (exactMatch) {
          fireShot(exactMatch);
          typedRef.current = ''; setTypedSoFar('');
          setIsWrong(false); isWrongRef.current = false;
        } else if (matchPrefix) {
          setTypedSoFar(newTyped); setIsWrong(false); isWrongRef.current = false;
        } else {
          setIsWrong(true); isWrongRef.current = true;
          setTypedSoFar(newTyped);
          setTimeout(() => {
            if (isWrongRef.current) {
              typedRef.current = ''; setTypedSoFar('');
              setIsWrong(false); isWrongRef.current = false;
            }
          }, 400);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  const fireShot = (word) => {
    playShoot();
    const bid = bulletId.current++;
    setBullets(prev => [...prev, { id: bid, x: word.x, targetY: word.y }]);
    setTimeout(() => setBullets(prev => prev.filter(b => b.id !== bid)), 400);
    setExploding(prev => [...prev, { id: word.id, x: word.x, y: word.y }]);
    setTimeout(() => setExploding(prev => prev.filter(p => p.id !== word.id)), 600);
    fallingRef.current = fallingRef.current.filter(w => w.id !== word.id);
    setFallingWords([...fallingRef.current]);
    comboRef.current += 1;
    maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);
    setCombo(comboRef.current);
    const gained = 10 + (comboRef.current > 1 ? comboRef.current * 5 : 0);
    scoreRef.current += gained;
    wordsTypedRef.current += 1;
  };

  const getMatchLen = (word) => {
    const t = typedRef.current.toLowerCase();
    if (!t) return 0;
    return word.toLowerCase().startsWith(t) ? t.length : 0;
  };

  const lv = LEVELS[levelIdx];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-14">

        {/* HUB */}
        {screen === 'hub' && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] gap-8 px-4">
            <div className="text-center">
              <p className="text-6xl mb-4">🎮</p>
              <h1 className="text-4xl font-black text-white mb-2">Typing <span className="text-accent">Games</span></h1>
              <p className="text-text-secondary">Choose a game and start playing</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <button onClick={() => setScreen('menu')}
                className="card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                style={{ borderColor: '#00ff9f44' }}>
                <span className="text-3xl">⚡</span>
                <span className="text-white font-black">Word Fall</span>
                <span className="text-text-secondary text-xs text-center">Shoot falling words</span>
              </button>
              <button onClick={() => setScreen('speedburst')}
                className="card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                style={{ borderColor: '#00d4ff44' }}>
                <span className="text-3xl">⏱️</span>
                <span className="text-white font-black">Speed Burst</span>
                <span className="text-text-secondary text-xs text-center">10 sec word sprint</span>
              </button>
              <button onClick={() => setScreen('hangman')}
                className="card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                style={{ borderColor: '#a78bfa44' }}>
                <span className="text-3xl">🎯</span>
                <span className="text-white font-black">Hangman</span>
                <span className="text-text-secondary text-xs text-center">Guess the word</span>
              </button>
              <button onClick={() => setScreen('scramble')}
                className="card p-5 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                style={{ borderColor: '#ff4d6d44' }}>
                <span className="text-3xl">🔀</span>
                <span className="text-white font-black">Scramble</span>
                <span className="text-text-secondary text-xs text-center">Unscramble words</span>
              </button>
            </div>
          </div>
        )}

        {/* SPEED BURST */}
        {screen === 'speedburst' && <SpeedBurst onBack={() => setScreen('hub')} />}

        {/* HANGMAN */}
        {screen === 'hangman' && <Hangman onBack={() => setScreen('hub')} />}

        {/* SCRAMBLE */}
        {screen === 'scramble' && <Scramble onBack={() => setScreen('hub')} />}

        {/* WORD FALL MENU */}
        {screen === 'menu' && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] gap-8 px-4">
            <div className="text-center">
              <p className="text-6xl mb-4">⚡</p>
              <h1 className="text-4xl font-black text-white mb-2">Word <span className="text-accent">Fall</span></h1>
              <p className="text-text-secondary">Shoot falling words before they hit the ground!</p>
              {bestScore > 0 && <p className="mt-2 text-sm font-mono text-accent">🏆 Best: {bestScore} pts</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {LEVELS.map((lv, i) => (
                <button key={i} onClick={() => startGame(i)}
                  className="card p-5 flex flex-col items-center gap-1 hover:scale-105 transition-transform"
                  style={{ borderColor: lv.color + '44' }}>
                  <span className="text-xl font-black" style={{ color: lv.color }}>{lv.name}</span>
                  <span className="text-text-secondary text-xs">
                    {lv.isChar ? 'Single keys' : 'Words'} · {lv.speed}x
                  </span>
                </button>
              ))}
            </div>
            <div className="card max-w-xs w-full text-center text-sm text-text-secondary leading-relaxed">
              <p>🟢 Easy — Single character keys, slow speed</p>
              <p>🔵 Medium — Short 2-3 letter words</p>
              <p>🟣 Hard — Longer words, faster</p>
              <p>🔴 Insane — Maximum chaos!</p>
              <p className="mt-2 text-xs text-text-muted">No backspace. Wrong key = red flash. Keep typing!</p>
            </div>
            <button onClick={() => setScreen('hub')} className="text-text-secondary text-sm hover:text-white transition-colors">← Back to Games</button>
          </div>
        )}

        {/* PLAYING */}
        {screen === 'playing' && (
          <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-border"
              style={{ background: 'rgba(10,10,15,0.95)' }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} style={{ fontSize: 20, opacity: i < lives ? 1 : 0.15 }}>❤️</span>
                ))}
              </div>
              <div className="flex items-center gap-5">
                {combo > 1 && (
                  <motion.span key={combo} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-black" style={{ color: lv.color }}>
                    x{combo} COMBO!
                  </motion.span>
                )}
                <div className="text-center">
                  <p className="text-accent font-black font-mono text-xl">{score}</p>
                  <p className="text-text-secondary text-xs">SCORE</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">{wordsTypedRef.current}</p>
                  <p className="text-text-secondary text-xs">WORDS</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold border"
                  style={{ color: lv.color, borderColor: lv.color + '55', background: lv.color + '11' }}>
                  {lv.name}
                </span>
                <button onClick={() => { cancelAnimationFrame(animRef.current); setScreen('menu'); }}
                  className="px-3 py-1.5 bg-surface border border-border text-text-secondary text-xs font-semibold rounded-lg hover:border-red-500 hover:text-red-400 transition-all">
                  ✕ Exit
                </button>
              </div>
            </div>

            <motion.div ref={gameRef}
              animate={shake ? { x: [-8,8,-5,5,-2,2,0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="relative flex-1 overflow-hidden"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #0f0f1f 0%, #0a0a0f 100%)' }}>

              <div style={{
                position: 'absolute', inset: 0, opacity: 0.025,
                backgroundImage: 'linear-gradient(#00ff9f 1px,transparent 1px),linear-gradient(90deg,#00ff9f 1px,transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
              <div style={{
                position: 'absolute', bottom: 55, left: 0, right: 0, height: 1,
                background: 'rgba(255,77,109,0.3)',
                boxShadow: '0 0 8px rgba(255,77,109,0.3)',
              }} />

              <div style={{
                position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{
                  padding: '6px 20px', borderRadius: 10, minWidth: 120, textAlign: 'center',
                  background: isWrong ? 'rgba(255,77,109,0.15)' : 'rgba(18,18,26,0.95)',
                  border: '2px solid ' + (isWrong ? '#ff4d6d' : (typedSoFar ? lv.color : '#1e1e2e')),
                  boxShadow: isWrong ? '0 0 20px rgba(255,77,109,0.4)' : (typedSoFar ? '0 0 20px ' + lv.color + '44' : 'none'),
                  fontFamily: 'JetBrains Mono,monospace', fontSize: 18, fontWeight: 900,
                  color: isWrong ? '#ff4d6d' : (typedSoFar ? lv.color : '#3a3a55'),
                  transition: 'all 0.1s', letterSpacing: 2, minHeight: 38,
                }}>
                  {typedSoFar || (lv.isChar ? '·' : 'type...')}
                </div>
                <div style={{ fontSize: 24, transform: 'scaleX(-1)', filter: 'drop-shadow(0 0 6px ' + lv.color + ')' }}>
                  🔫
                </div>
              </div>

              <AnimatePresence>
                {bullets.map(b => (
                  <motion.div key={b.id}
                    initial={{ bottom: 80, opacity: 1 }}
                    animate={{ bottom: '100%', opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', left: b.x + '%', transform: 'translateX(-50%)',
                      width: 4, height: 12, borderRadius: 2,
                      background: lv.color, boxShadow: '0 0 8px ' + lv.color,
                      pointerEvents: 'none', zIndex: 15,
                    }} />
                ))}
              </AnimatePresence>

              {fallingWords.map(word => {
                const ml = lv.isChar ? 0 : getMatchLen(word.text);
                const isTarget = lv.isChar ? false : typedSoFar && word.text.toLowerCase().startsWith(typedSoFar.toLowerCase());
                return (
                  <div key={word.id} style={{
                    position: 'absolute', left: word.x + '%', top: word.y,
                    transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 10,
                  }}>
                    <div style={{
                      padding: '5px 12px', borderRadius: 8,
                      background: isTarget ? lv.color + '18' : 'rgba(18,18,26,0.92)',
                      border: '1px solid ' + (isTarget ? lv.color : '#2a2a3e'),
                      boxShadow: isTarget ? '0 0 18px ' + lv.color + '66' : 'none',
                      fontSize: lv.isChar ? 28 : 20,
                      fontFamily: 'JetBrains Mono,monospace', fontWeight: 800,
                      whiteSpace: 'nowrap', transition: 'all 0.08s',
                    }}>
                      {lv.isChar ? (
                        <span style={{ color: '#c0c0e0' }}>{word.text.toUpperCase()}</span>
                      ) : ml > 0 ? (
                        <>
                          <span style={{ color: lv.color }}>{word.text.slice(0, ml)}</span>
                          <span style={{ color: '#6060a0' }}>{word.text.slice(ml)}</span>
                        </>
                      ) : (
                        <span style={{ color: '#8080a8' }}>{word.text}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              <AnimatePresence>
                {exploding.map(ex => (
                  <motion.div key={ex.id}
                    initial={{ opacity: 1, scale: 0.3 }}
                    animate={{ opacity: 0, scale: 3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{
                      position: 'absolute', left: ex.x + '%', top: ex.y,
                      transform: 'translate(-50%,-50%)',
                      width: 70, height: 70, borderRadius: '50%',
                      background: 'radial-gradient(circle,' + lv.color + 'cc,transparent)',
                      pointerEvents: 'none', zIndex: 12,
                    }} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* GAME OVER */}
        {screen === 'gameover' && (
          <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 px-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <p className="text-6xl mb-3">💀</p>
              <h2 className="text-3xl font-black text-white mb-1">Game Over</h2>
              <p className="text-text-secondary text-sm">Words hit the ground!</p>
            </motion.div>
            <div className="card w-full max-w-xs">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-black text-accent">{score}</p>
                  <p className="text-text-secondary text-xs mt-1">SCORE</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{wordsTyped}</p>
                  <p className="text-text-secondary text-xs mt-1">WORDS</p>
                </div>
                <div>
                  <p className="text-3xl font-black" style={{ color: lv.color }}>x{maxCombo}</p>
                  <p className="text-text-secondary text-xs mt-1">MAX COMBO</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-yellow-400">{bestScore}</p>
                  <p className="text-text-secondary text-xs mt-1">BEST</p>
                </div>
              </div>
              {newBest && (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center text-accent font-bold mt-4 text-sm">
                  🎉 New Best Score!
                </motion.p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => startGame(levelIdx)} className="btn-primary px-8 py-3">Play Again</button>
              <button onClick={() => setScreen('menu')}
                className="px-8 py-3 bg-surface border border-border text-white rounded-xl font-semibold hover:border-accent transition-colors">
                Menu
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Games;