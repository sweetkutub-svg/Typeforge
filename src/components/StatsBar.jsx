export const StatsBar = ({ wpm, accuracy, timeLeft = null }) => {
  const mins = timeLeft !== null ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : '∞';
  const secs = timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : '';
  const accColor = accuracy >= 95 ? '#00ff9f' : accuracy >= 80 ? '#ffd060' : '#ff4d6d';
  const timeColor = timeLeft !== null && timeLeft <= 10 ? '#ff4d6d' : timeLeft !== null && timeLeft <= 20 ? '#ffd060' : '#ffffff';

  return (
    <div className="flex items-center justify-center gap-0 rounded-2xl border border-border bg-surface overflow-hidden">
      <StatCell label="WPM" value={wpm} color="#00ff9f" />
      <div className="w-px self-stretch bg-border" />
      <StatCell label="Accuracy" value={`${accuracy}%`} color={accColor} />
      <div className="w-px self-stretch bg-border" />
      <StatCell label="Time" value={timeLeft !== null ? `${mins}:${secs}` : '∞'} color={timeColor} mono />
    </div>
  );
};

const StatCell = ({ label, value, color, mono }) => (
  <div className="flex flex-col items-center px-8 py-4">
    <span className={`text-3xl font-bold ${mono ? 'font-mono' : ''}`} style={{ color }}>{value}</span>
    <span className="text-text-secondary text-[10px] uppercase tracking-widest mt-0.5 font-mono">{label}</span>
  </div>
);

export default StatsBar;
