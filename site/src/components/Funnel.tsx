/** Hero background: the orange perspective "funnel" grid, drawn in SVG and slowly pulled inward. */
export function Funnel() {
  const rings = Array.from({ length: 14 }, (_, i) => i);
  const spokes = Array.from({ length: 36 }, (_, i) => (i * Math.PI * 2) / 36);
  const cx = 935;
  const cy = 400;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[68px] h-[842px] w-[1870px] -translate-x-1/2">
      {/* warm wash */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(255,170,90,0.35)_0%,rgba(255,200,140,0.18)_45%,rgba(248,246,241,0)_75%)]" />
      <svg viewBox="0 0 1870 842" className="absolute inset-0 h-full w-full [mask-image:radial-gradient(60%_50%_at_50%_52%,#000_40%,transparent_85%)]">
        <defs>
          <radialGradient id="fhole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8f6f1" stopOpacity="1" />
            <stop offset="55%" stopColor="#f8f6f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f8f6f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g stroke="#e26b08" fill="none">
          {spokes.map((a) => (
            <line
              key={a}
              x1={cx + Math.cos(a) * 140}
              y1={cy + 60 + Math.sin(a) * 34}
              x2={cx + Math.cos(a) * 1300}
              y2={cy + Math.sin(a) * 420}
              strokeOpacity="0.28"
              strokeWidth="1"
            />
          ))}
          {rings.map((i) => {
            const t = (i + 1) / rings.length;
            const rx = 140 + Math.pow(t, 1.6) * 1060;
            const ry = 34 + Math.pow(t, 1.6) * 330;
            const dy = 60 * (1 - t);
            return (
              <ellipse
                key={i}
                className="funnel-ring"
                style={{ animationDelay: `${-(i / rings.length) * 9}s` }}
                cx={cx}
                cy={cy + dy}
                rx={rx}
                ry={ry}
                strokeOpacity={0.22 + 0.3 * (1 - t)}
                strokeWidth="1"
              />
            );
          })}
        </g>
        <ellipse cx={cx} cy={cy + 64} rx="300" ry="90" fill="url(#fhole)" />
      </svg>
      {/* sparse bright streaks like the template's light trails */}
      <div className="absolute left-[18%] top-[46%] h-px w-[220px] -rotate-[8deg] bg-gradient-to-r from-transparent via-orange/60 to-transparent" />
      <div className="absolute right-[17%] top-[33%] h-px w-[260px] rotate-[12deg] bg-gradient-to-r from-transparent via-orange/50 to-transparent" />
      <div className="absolute right-[24%] top-[60%] h-px w-[180px] rotate-[4deg] bg-gradient-to-r from-transparent via-orange/50 to-transparent" />
    </div>
  );
}
