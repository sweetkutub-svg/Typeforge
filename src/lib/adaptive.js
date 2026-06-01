export const LESSONS = [
  { id: 1, name: 'Home Row', subtitle: 'The Foundation', keys: ['a','s','d','f','j','k','l',';'], targetWPM: 15, targetAccuracy: 90, description: 'Master A S D F · J K L ; — your fingers live here', color: '#00ff9f' },
  { id: 2, name: 'E and I', subtitle: 'Most Common Vowels', keys: ['e','i','a','s','d','f','j','k','l',';'], targetWPM: 18, targetAccuracy: 90, description: 'Add E (middle finger left) and I (middle finger right)', color: '#00d4ff' },
  { id: 3, name: 'R and O', subtitle: 'Index Finger Stretch', keys: ['r','o','e','i','a','s','d','f','j','k','l',';'], targetWPM: 20, targetAccuracy: 90, description: 'R and O are among the most-typed letters — learn them now', color: '#a78bfa' },
  { id: 4, name: 'T and U', subtitle: 'Index Fingers Up', keys: ['t','u','r','o','e','i','a','s','d','f','j','k','l',';'], targetWPM: 22, targetAccuracy: 90, description: 'Both index fingers reach up — T left, U right', color: '#f59e0b' },
  { id: 5, name: 'N, H and Top Row', subtitle: 'Complete the Top', keys: ['q','w','y','p','n','h','t','u','r','o','e','i','a','s','d','f','j','k','l',';'], targetWPM: 25, targetAccuracy: 90, description: 'Finish the top row — Q W Y P and common N H', color: '#fb923c' },
  { id: 6, name: 'Bottom Row', subtitle: 'Go Down', keys: ['z','x','c','v','b','n','m',',','.','a','s','d','f','j','k','l',';'], targetWPM: 25, targetAccuracy: 90, description: 'Z X C V B · N M , . — pinky and ring finger stretches', color: '#f43f5e' },
  { id: 7, name: 'Common Words', subtitle: 'Real Language', keys: 'full', targetWPM: 30, targetAccuracy: 90, description: 'Top 200 most-used English words — type like a pro', color: '#00ff9f' },
  { id: 8, name: 'Speed Run', subtitle: 'Push Your Limits', keys: 'full', targetWPM: 40, targetAccuracy: 92, description: 'Longer words, faster pace — no shortcuts now', color: '#00d4ff' },
  { id: 9, name: 'Sentences', subtitle: 'Punctuation & Flow', keys: 'full', targetWPM: 45, targetAccuracy: 92, description: 'Full sentences with commas, periods, and capitals', color: '#a78bfa' },
  { id: 10, name: 'Code & Symbols', subtitle: 'Developer Mode', keys: 'full', targetWPM: 35, targetAccuracy: 90, description: 'Brackets, underscores, colons — type like a dev', color: '#f59e0b' },
];

const WORD_POOLS = {
  1: [
    'as','sad','dad','ask','ads','lad','fad','lass','add','fall',
    'dads','lads','asks','adds','salad','fads','dafs','flask','flak',
    'slab','alfa','all','dals','alfs','sall','falls','lass','lads','adas',
  ],
  2: [
    'side','idea','said','file','aide','sail','safe','deal','idle','isle',
    'self','sell','life','die','fed','led','feel','seed','kids','dial',
    'fail','field','slide','aisle','leaf','laid','silk','like','desk','disk',
    'else','flee','life','fief','ides','ailed','flied','filed','leafed','felled',
  ],
  3: [
    'rise','ride','fire','fore','sore','lore','role','rose','read','rode',
    'road','real','oral','rife','dole','dear','dose','redo','laser','filed',
    'order','older','solar','rider','solid','soar','roar','dire','sire','irk',
    'oar','rods','rids','ores','rides','fires','roles','roils','lored','oiled',
  ],
  4: [
    'true','rust','rut','tour','sour','sure','lure','rule','fuel','duel',
    'dust','fuse','suit','stir','stud','turf','lust','trust','tusk','ruts',
    'tore','dusk','lute','ruse','trod','dour','oust','four','auto','fruit',
    'strut','ultra','turd','flute','jute','durst','trued','luted','outed','suited',
  ],
  5: [
    'when','then','help','hand','hunt','thin','what','hero','deny','they',
    'with','play','plan','yawn','wren','phone','print','honey','panel','queen',
    'hyena','planet','hunter','nephew','python','yell','whip','pawn','newt','hype',
    'phony','prank','handy','whelp','plenty','kidney','within','deploy','phenol','wonky',
  ],
  6: [
    'back','black','blank','block','buck','bulk','calm','clam','clan','claw',
    'club','comb','crab','zinc','vibe','cabin','claim','bunk','bomb','crave',
    'brave','clank','crumb','vim','box','mix','max','axe','exam','excel',
    'toxic','remix','index','flex','scam','scan','snack','slack','clanks','combo',
  ],
  7: [
    'the','and','for','are','but','not','you','all','any','can',
    'had','her','was','one','our','out','day','get','has','him',
    'his','how','man','new','now','old','see','two','way','who',
    'did','its','let','put','say','she','too','use','about','after',
    'back','been','come','could','down','each','find','from','give','good',
    'have','here','into','just','know','like','look','make','more','most',
    'move','much','name','need','only','open','over','part','people','place',
    'same','show','small','such','take','than','them','then','there','they',
    'think','time','turn','very','want','well','went','were','what','when',
    'which','will','with','word','work','world','year','your','long','next',
  ],
  8: [
    'ability','absence','achieve','acquire','address','advance','airport','already','another','balance',
    'because','becomes','between','brother','captain','central','chapter','compete','control','develop',
    'discuss','display','outside','perform','perhaps','picture','problem','process','produce','project',
    'quality','quickly','realize','receive','replace','require','results','through','whether','example',
  ],
  9: [
    'The quick brown fox jumps over the lazy dog.',
    'Practice makes perfect so keep going every day.',
    'Master speed improve accuracy and build confidence.',
    'Every keystroke brings you closer to mastery.',
    'Focus on accuracy first then speed will follow.',
    'Good typists do not look at the keyboard.',
    'TypeForge helps you become a faster better typist.',
    'The best way to improve is to practice daily.',
    'Small progress each day adds up to big results.',
    'Keep your eyes on the screen not the keys.',
  ],
  10: [
    'const x = 10;',
    'let name = "user";',
    'if (a > b) return a;',
    'function add(x, y) {}',
    'arr.map(x => x * 2)',
    'console.log("hello");',
    'import { useState }',
    'export default App;',
    'npm install && npm run dev',
    'git commit -m "fix: update"',
    'const [state, setState] = useState(0);',
    'return <div className="app"></div>;',
  ],
};

// Runtime strict filter — every char in word must be in allowedKeys
const isWordAllowed = (word, allowedKeys) => {
  const keySet = new Set(allowedKeys);
  for (const char of word.toLowerCase()) {
    if (!keySet.has(char)) return false;
  }
  return true;
};

export const generateChars = (keys, keyStats = {}) => {
  if (!keys || keys === 'full') return [];

  const weakKeys = Object.entries(keyStats)
    .filter(([k, s]) => keys.includes(k) && s.attempts > 0 && s.mistakes / s.attempts > 0.15)
    .map(([k]) => k);

  const weighted = [];
  keys.forEach((k) => {
    const times = weakKeys.includes(k) ? 5 : 1;
    for (let i = 0; i < times; i++) weighted.push(k);
  });

  const result = [];
  for (let i = 0; i < 300; i++) {
    result.push(weighted[Math.floor(Math.random() * weighted.length)]);
  }
  return result;
};

export const generateWords = (lessonId, keyStats = {}) => {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const pool = WORD_POOLS[lessonId] ?? WORD_POOLS[7];

  // Sentences & code — shuffle and repeat
  if (lessonId === 9 || lessonId === 10) {
    const result = [];
    while (result.length < 200) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      result.push(...shuffled);
    }
    return result.slice(0, 200);
  }

  // Strict filter for lessons with specific key sets
  const allowedKeys = Array.isArray(lesson?.keys) ? lesson.keys : null;
  const strictPool = allowedKeys
    ? pool.filter((w) => isWordAllowed(w, allowedKeys))
    : pool;

  const safePool = strictPool.length > 0 ? strictPool : pool.slice(0, 10);
  console.log('lessonId:', lessonId, 'allowedKeys:', allowedKeys, 'strictPool size:', strictPool.length, 'safePool:', safePool);

  // Weak-key weighting
  const weakKeys = Object.entries(keyStats)
    .filter(([, s]) => s.attempts > 0 && s.mistakes / s.attempts > 0.2)
    .map(([k]) => k);

  const weighted = [];
  safePool.forEach((w) => {
    const times = weakKeys.some((k) => w.includes(k)) ? 4 : 1;
    for (let i = 0; i < times; i++) weighted.push(w);
  });

  const result = [];
  for (let i = 0; i < 200; i++) {
    result.push(weighted[Math.floor(Math.random() * weighted.length)]);
  }
  return result;
};

export const updateKeyStats = (prev = {}, typed, expected) => {
  const stats = { ...prev };
  for (let i = 0; i < Math.max(typed.length, expected.length); i++) {
    const key = expected[i] ?? '';
    if (!key) continue;
    stats[key] = stats[key] ?? { attempts: 0, mistakes: 0 };
    stats[key].attempts++;
    if (typed[i] !== expected[i]) stats[key].mistakes++;
  }
  return stats;
};

export const getKeyAccuracy = (keyStats) =>
  Object.entries(keyStats).reduce((acc, [k, v]) => {
    acc[k] = v.attempts > 0 ? Math.round(((v.attempts - v.mistakes) / v.attempts) * 100) : 100;
    return acc;
  }, {});


  