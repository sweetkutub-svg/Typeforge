import { motion } from 'framer-motion';

// Finger zone colors matching the 3D keyboard style
const ZONE_COLORS = {
  'l-pinky':  { base: '#a855f7', glow: 'rgba(168,85,247,0.6)',  bg: 'rgba(168,85,247,0.12)' },
  'l-ring':   { base: '#2dd4bf', glow: 'rgba(45,212,191,0.6)',  bg: 'rgba(45,212,191,0.12)' },
  'l-mid':    { base: '#4ade80', glow: 'rgba(74,222,128,0.6)',  bg: 'rgba(74,222,128,0.12)' },
  'l-idx':    { base: '#fbbf24', glow: 'rgba(251,191,36,0.6)',  bg: 'rgba(251,191,36,0.12)' },
  'r-idx':    { base: '#fb923c', glow: 'rgba(251,146,60,0.6)',  bg: 'rgba(251,146,60,0.12)' },
  'r-mid':    { base: '#22d3ee', glow: 'rgba(34,211,238,0.6)',  bg: 'rgba(34,211,238,0.12)' },
  'r-ring':   { base: '#f472b6', glow: 'rgba(244,114,182,0.6)', bg: 'rgba(244,114,182,0.12)' },
  'r-pinky':  { base: '#f87171', glow: 'rgba(248,113,113,0.6)', bg: 'rgba(248,113,113,0.12)' },
  'thumb':    { base: '#94a3b8', glow: 'rgba(148,163,184,0.4)', bg: 'rgba(148,163,184,0.08)' },
};

const KEY_ZONE = {
  'escape':'r-pinky',
  '`':'l-pinky','1':'l-pinky','2':'l-pinky','3':'l-ring','4':'l-mid','5':'l-idx',
  '6':'r-idx','7':'r-idx','8':'r-ring','9':'r-ring','0':'r-pinky','-':'r-pinky','=':'r-pinky',
  'q':'l-pinky','w':'l-ring','e':'l-mid','r':'l-idx','t':'l-idx',
  'y':'r-idx','u':'r-idx','i':'r-mid','o':'r-ring','p':'r-pinky','[':'r-pinky',']':'r-pinky','\\':'r-pinky',
  'a':'l-pinky','s':'l-ring','d':'l-mid','f':'l-idx','g':'l-idx',
  'h':'r-idx','j':'r-idx','k':'r-mid','l':'r-ring',';':'r-pinky',"'":'r-pinky',
  'z':'l-pinky','x':'l-ring','c':'l-mid','v':'l-idx','b':'l-idx',
  'n':'r-idx','m':'r-idx',',':'r-mid','.':'r-ring','/':'r-pinky',
  ' ':'thumb',
};

const ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','='],
  ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['a','s','d','f','g','h','j','k','l',';',"'"],
  ['z','x','c','v','b','n','m',',','.','/'],
];

const WIDE_KEYS = {
  'tab': 54, 'caps': 62, 'shift-l': 80, 'shift-r': 100,
  'ctrl': 54, '\\': 54,
};

const Key = ({ k, activeKeys = [], pressedKey, errorKey }) => {
  const zone = KEY_ZONE[k] ?? 'r-pinky';
  const color = ZONE_COLORS[zone];
  const isActive = activeKeys.includes(k);
  const isPressed = pressedKey === k;
  const isError = errorKey === k;

  const label = k === ' ' ? 'space' : k === '\\' ? '\\' : k.toUpperCase();

  return (
    <motion.div
      animate={isPressed ? { y: 4, scaleY: 0.92 } : { y: 0, scaleY: 1 }}
      transition={{ duration: 0.06, ease: 'easeOut' }}
      style={{
        position: 'relative',
        width: 52,
        flexShrink: 0,
        height: 56,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Key top face */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 50,
        borderRadius: '5px 5px 4px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: 700,
        fontFamily: 'JetBrains Mono, monospace',
        transition: 'all 0.08s',
        zIndex: 2,
        // States
        ...(isError ? {
          background: 'linear-gradient(155deg,#7f1d1d,#991b1b)',
          borderTop: '1px solid #ef4444',
          borderLeft: '1px solid #dc2626',
          borderRight: '1px solid #b91c1c',
          color: '#fff',
          boxShadow: '0 0 0 1px rgba(248,113,113,0.5), 0 0 16px 6px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        } : isPressed ? {
          background: 'linear-gradient(155deg,#004d26,#003d1f)',
          borderTop: '1px solid #00ff9f',
          borderLeft: '1px solid #00cc7a',
          borderRight: '1px solid #009960',
          color: '#00ff9f',
          boxShadow: '0 0 0 1px rgba(0,255,159,0.4), 0 0 20px 8px rgba(0,255,159,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          top: 3,
        } : isActive ? {
          background: `linear-gradient(155deg, ${color.bg}, rgba(0,0,0,0.2))`,
          borderTop: `1px solid ${color.base}`,
          borderLeft: `1px solid ${color.base}88`,
          borderRight: `1px solid ${color.base}55`,
          color: color.base,
          boxShadow: `0 0 0 1px ${color.base}33, 0 0 12px 4px ${color.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        } : {
          background: 'linear-gradient(155deg, #1e1e30 0%, #18182a 50%, #141420 100%)',
          borderTop: '1px solid #2e2e45',
          borderLeft: '1px solid #282838',
          borderRight: '1px solid #1a1a28',
          color: '#6b6b8a',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.4)',
        }),
      }}>
        {label}
      </div>

      {/* 3D front face */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 1, right: 1,
        height: isPressed ? 3 : 7,
        borderRadius: '0 0 5px 5px',
        transition: 'height 0.06s',
        zIndex: 1,
        ...(isError ? {
          background: 'linear-gradient(180deg,#7f1d1d,#6b1616)',
        } : isActive ? {
          background: `linear-gradient(180deg,${color.base}44,${color.base}22)`,
        } : {
          background: 'linear-gradient(180deg,#0d0d1a,#080810)',
          borderLeft: '1px solid #111120',
          borderRight: '1px solid #111120',
          borderBottom: '1px solid #0a0a14',
        }),
      }} />
    </motion.div>
  );
};

const WideKey = ({ label, zone = 'r-pinky', width, activeKeys = [], keyValue, pressedKey, errorKey }) => {
  const color = ZONE_COLORS[zone];
  const isActive = keyValue ? activeKeys.includes(keyValue) : false;
  const isPressed = pressedKey === keyValue;
  const isError = errorKey === keyValue;

  return (
    <motion.div
      animate={isPressed ? { y: 4, scaleY: 0.92 } : { y: 0, scaleY: 1 }}
      transition={{ duration: 0.06 }}
      style={{ position: 'relative', width, flexShrink: 0, height: 56, userSelect: 'none' }}
    >
      <div style={{
        position: 'absolute',
        top: isPressed ? 4 : 0, left: 0, right: 0,
        height: 50,
        borderRadius: '5px 5px 4px 4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
        transition: 'all 0.08s', zIndex: 2,
        ...(isActive ? {
          background: `linear-gradient(155deg, ${color.bg}, rgba(0,0,0,0.2))`,
          borderTop: `1px solid ${color.base}`,
          borderLeft: `1px solid ${color.base}88`,
          borderRight: `1px solid ${color.base}55`,
          color: color.base,
          boxShadow: `0 0 0 1px ${color.base}33, 0 0 12px 4px ${color.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        } : {
          background: 'linear-gradient(155deg,#1e1e30 0%,#18182a 50%,#141420 100%)',
          borderTop: '1px solid #2e2e45',
          borderLeft: '1px solid #282838',
          borderRight: '1px solid #1a1a28',
          color: '#4a4a6a',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.4)',
        }),
      }}>
        {label}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 1, right: 1,
        height: isPressed ? 3 : 7, borderRadius: '0 0 5px 5px',
        transition: 'height 0.06s', zIndex: 1,
        background: 'linear-gradient(180deg,#0d0d1a,#080810)',
      }} />
    </motion.div>
  );
};

export const Keyboard = ({ activeKeys = [], pressedKey, errorKey, showFingerGuide = false }) => {
  const gap = 5;

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      gap,
      padding: '18px 22px 24px',
      background: 'linear-gradient(160deg,#13131f 0%,#0f0f1a 60%,#0b0b14 100%)',
      borderRadius: 16,
      border: '1px solid #1e1e32',
      boxShadow: '0 2px 0 #00000000, 0 4px 0 #060610, 0 6px 0 #050509, 0 8px 0 #040408, 0 14px 35px rgba(0,0,0,0.6), 0 28px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      position: 'relative',
      transform: 'rotateX(4deg)',
      transformStyle: 'preserve-3d',
    }}>

      {/* Row 1 — Numbers */}
      <div style={{ display: 'flex', gap, alignItems: 'flex-end' }}>
        {ROWS[0].map(k => <Key key={k} k={k} activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />)}
        <WideKey label="bksp" width={97} zone="r-pinky" keyValue="Backspace" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
      </div>

      {/* Row 2 — QWERTY */}
      <div style={{ display: 'flex', gap, alignItems: 'flex-end' }}>
        <WideKey label="tab" width={73} zone="l-pinky" keyValue="Tab" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
        {ROWS[1].map(k => <Key key={k} k={k} activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />)}
      </div>

      {/* Row 3 — ASDF */}
      <div style={{ display: 'flex', gap, alignItems: 'flex-end' }}>
        <WideKey label="caps" width={84} zone="l-pinky" keyValue="CapsLock" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
        {ROWS[2].map(k => <Key key={k} k={k} activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />)}
        <WideKey label="enter" width={111} zone="r-pinky" keyValue="Enter"
          activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
      </div>

      {/* Row 4 — ZXCV */}
      <div style={{ display: 'flex', gap, alignItems: 'flex-end' }}>
        <WideKey label="shift" width={119} zone="l-pinky" keyValue="ShiftLeft" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
        {ROWS[3].map(k => <Key key={k} k={k} activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />)}
        <WideKey label="shift" width={129} zone="r-pinky" keyValue="ShiftRight" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
      </div>

      {/* Space row */}
      <div style={{ display: 'flex', gap, alignItems: 'flex-end', justifyContent: 'center' }}>
        <WideKey label="ctrl" width={73} zone="l-pinky" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
        <WideKey label="alt" width={59} zone="l-pinky" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />

        {/* Space bar */}
        <motion.div
          animate={pressedKey === ' ' ? { y: 4, scaleY: 0.92 } : { y: 0, scaleY: 1 }}
          transition={{ duration: 0.06 }}
          style={{ position: 'relative', width: 297, flexShrink: 0, height: 56 }}
        >
          <div style={{
            position: 'absolute',
            top: pressedKey === ' ' ? 4 : 0, left: 0, right: 0, height: 50,
            borderRadius: '5px 5px 4px 4px',
            transition: 'all 0.08s', zIndex: 2,
            ...(activeKeys.includes(' ') ? {
              background: 'linear-gradient(155deg,rgba(148,163,184,0.1),rgba(0,0,0,0.2))',
              borderTop: '1px solid #94a3b8',
              borderLeft: '1px solid #94a3b888',
              borderRight: '1px solid #94a3b855',
              boxShadow: '0 0 0 1px rgba(148,163,184,0.2), 0 0 12px 4px rgba(148,163,184,0.3)',
            } : {
              background: 'linear-gradient(155deg,#1e1e30,#141420)',
              borderTop: '1px solid #2e2e45',
              borderLeft: '1px solid #282838',
              borderRight: '1px solid #1a1a28',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }),
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 1, right: 1,
            height: pressedKey === ' ' ? 3 : 7, borderRadius: '0 0 5px 5px',
            background: 'linear-gradient(180deg,#0d0d1a,#080810)',
            transition: 'height 0.06s', zIndex: 1,
          }} />
        </motion.div>

        <WideKey label="alt" width={44} zone="r-pinky" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
        <WideKey label="ctrl" width={54} zone="r-pinky" activeKeys={activeKeys} pressedKey={pressedKey} errorKey={errorKey} />
      </div>

      {/* Finger guide legend */}
      {showFingerGuide && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {Object.entries(ZONE_COLORS).filter(([k]) => k !== 'thumb').map(([zone, color]) => (
            <div key={zone} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color.base }} />
              <span style={{ fontSize: 9, color: '#4a4a6a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
                {zone.replace('l-','L ').replace('r-','R ').replace('pinky','pink').replace('idx','index').replace('mid','mid').replace('ring','ring')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Keyboard;