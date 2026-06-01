import { motion } from 'framer-motion';

export const BadgeCard = ({ badge, earned }) => (
  <motion.div
    whileHover={earned ? { scale: 1.05 } : {}}
    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all
      ${earned ? 'border-accent bg-[#001a0d] shadow-glow-sm' : 'border-border opacity-40'}`}
  >
    <span className="text-2xl">{badge.icon}</span>
    <span className={`text-xs font-bold text-center uppercase tracking-wide leading-tight
      ${earned ? 'text-accent' : 'text-text-secondary'}`}>
      {(badge.label ?? badge.name ?? '').replace(/ /g, '\n')}
    </span>
  </motion.div>
);

export default BadgeCard;
