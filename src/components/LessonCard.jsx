import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Play, ChevronRight } from 'lucide-react';

export const LessonCard = ({ lesson, status, onClick }) => {
  const isLocked    = status === 'locked';
  const isCurrent   = status === 'current';
  const isDone      = status === 'completed';
  const isUnlocked  = status === 'unlocked';

  return (
    <motion.div
      whileHover={!isLocked ? { x: 5, transition: { duration: 0.15 } } : {}}
      whileTap={!isLocked ? { scale: 0.99 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={[
        'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200',
        isLocked   ? 'border-border opacity-40 cursor-not-allowed select-none' : 'cursor-pointer',
        isCurrent  ? 'border-accent/60 bg-accent/5 shadow-glow-sm'           : '',
        isDone     ? 'border-accent-dim/40 bg-accent/3'                       : '',
        isUnlocked && !isCurrent && !isDone ? 'border-border bg-surface hover:border-accent/30 hover:bg-surface-2' : '',
      ].join(' ')}
    >
      {/* Number / status circle */}
      <div className={[
        'w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0 transition-all',
        isCurrent ? 'border-accent text-accent animate-pulse-glow'    : '',
        isDone    ? 'border-accent-dim bg-accent-dim/20 text-accent-dim' : '',
        isLocked  ? 'border-border text-text-muted'                    : '',
        isUnlocked && !isCurrent && !isDone ? 'border-border/60 text-text-secondary' : '',
      ].join(' ')}>
        {isDone   ? <CheckCircle2 size={18} className="text-accent-dim" /> :
         isLocked ? <Lock size={13} /> :
                    <span className="font-mono">{lesson.id}</span>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`font-semibold text-sm truncate ${isLocked ? 'text-text-secondary' : 'text-white'}`}>
            {lesson.name}
          </p>
          {lesson.subtitle && (
            <span className="text-text-muted text-xs font-mono hidden sm:inline">· {lesson.subtitle}</span>
          )}
        </div>
        <p className="text-text-secondary text-xs truncate">{lesson.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-text-muted text-xs font-mono">
            Target: <span className={isCurrent || isDone ? 'text-accent' : 'text-text-secondary'}>{lesson.targetWPM} WPM</span>
          </span>
          <span className="text-text-muted text-xs font-mono">
            <span className={isCurrent || isDone ? 'text-accent' : 'text-text-secondary'}>{lesson.targetAccuracy}%</span> acc
          </span>
        </div>
      </div>

      {/* Right badge */}
      <div className="flex-shrink-0">
        {isCurrent && (
          <span className="tag border-accent/40 bg-accent/10 text-accent text-[10px]">
            <Play size={9} />CURRENT
          </span>
        )}
        {isDone && (
          <span className="tag border-accent-dim/40 bg-accent-dim/10 text-accent-dim text-[10px]">
            ✓ DONE
          </span>
        )}
        {isUnlocked && !isCurrent && !isDone && (
          <ChevronRight size={16} className="text-text-secondary" />
        )}
      </div>
    </motion.div>
  );
};

export default LessonCard;
