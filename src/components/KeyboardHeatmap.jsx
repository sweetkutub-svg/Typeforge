const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l',';'],
  ['z','x','c','v','b','n','m',',','.','/'],
];

const getColor = (acc) => {
  if (acc == null) return '#2a2a2a';
  if (acc >= 95) return '#00ff9f';
  if (acc >= 80) return '#00cc7a';
  if (acc >= 60) return '#ffd700';
  if (acc >= 40) return '#ff9d00';
  return '#ff4d4d';
};

export const KeyboardHeatmap = ({ keyAccuracy = {} }) => (
  <div className="flex flex-col gap-1.5">
    {ROWS.map((row, ri) => (
      <div key={ri} className="flex gap-1 justify-center">
        {row.map((k) => {
          const acc = keyAccuracy[k];
          return (
            <div key={k}
              title={`${k.toUpperCase()}: ${acc != null ? acc + '%' : 'no data'}`}
              className="w-9 h-9 rounded flex items-center justify-center text-xs font-bold font-mono transition-all"
              style={{ backgroundColor: getColor(acc), color: acc != null ? '#0f0f0f' : '#888' }}>
              {k.toUpperCase()}
            </div>
          );
        })}
      </div>
    ))}
    <div className="flex items-center justify-center gap-2 mt-2">
      {[['#ff4d4d','<40%'],['#ffd700','60%'],['#00cc7a','80%'],['#00ff9f','95%+']].map(([c,l]) => (
        <div key={l} className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
          <span className="text-text-secondary text-xs">{l}</span>
        </div>
      ))}
    </div>
  </div>
);

export default KeyboardHeatmap;
