import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { RiskFactor, RiskLevel } from '../../types';
import { RISK_COLOR } from '../../utils/entityMeta';

function useCountUp(target: number, duration = 850) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function RiskDial({ score, level, size = 132 }: { score: number; level: RiskLevel; size?: number }) {
  const display = useCountUp(score);
  const color = RISK_COLOR[level];
  const r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2531" strokeWidth={6} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
        {/* tick marks every 10 */}
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const inner = r - 10;
          const outer = r - 6;
          return (
            <line
              key={i}
              x1={size / 2 + Math.cos(a) * inner}
              y1={size / 2 + Math.sin(a) * inner}
              x2={size / 2 + Math.cos(a) * outer}
              y2={size / 2 + Math.sin(a) * outer}
              stroke="#2A3342"
              strokeWidth={1}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tabular-nums text-paper">{display}</span>
        <span className="tech text-[9px]" style={{ color }}>
          {level === 'UNKNOWN' ? 'N/A' : level}
        </span>
      </div>
    </div>
  );
}

export function RiskBreakdown({ factors }: { factors: RiskFactor[] }) {
  const max = Math.max(...factors.map((f) => Math.abs(f.weight)), 1);
  return (
    <div className="space-y-2">
      {factors.map((f, i) => {
        const negative = f.weight < 0;
        const color = negative ? '#2FCB86' : f.weight >= 28 ? '#F3474F' : f.weight >= 18 ? '#F0A93B' : '#6B7687';
        return (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-steel-300">{f.label}</span>
              <span className="font-mono text-[10px]" style={{ color }}>
                {negative ? '' : '+'}
                {f.weight}
              </span>
            </div>
            <div className="mt-1 h-[3px] w-full bg-raise">
              <motion.div
                className="h-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${(Math.abs(f.weight) / max) * 100}%` }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
              />
            </div>
            <p className="mt-1 text-[10px] leading-snug text-steel-600">{f.detail}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
