import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles, Waypoints, Gauge } from 'lucide-react';
import { useActions } from '../../hooks/useActions';
import { PRODUCT_NAME, TEAM_NAME, SIH_INFO } from '../../data/product';

/** Deterministic decorative network — suggests activity without implying live data. */
function useBackdrop() {
  return useMemo(() => {
    let s = 20260915;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    const nodes = Array.from({ length: 34 }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 1 + rand() * 2,
      d: rand() * 5,
    }));
    const links: { a: number; b: number }[] = [];
    nodes.forEach((n, i) => {
      nodes.forEach((m, j) => {
        if (j <= i) return;
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < 19) links.push({ a: i, b: j });
      });
    });
    return { nodes, links };
  }, []);
}

const CAPABILITIES = [
  { icon: Waypoints, label: 'Entity resolution', text: 'Fuse fragmented records into one relationship graph.' },
  { icon: Sparkles, label: 'Link prediction', text: 'Surface relationships that appear in no source record.' },
  { icon: Gauge, label: 'Explainable risk', text: 'Every score decomposes into weighted contributing factors.' },
  { icon: ShieldCheck, label: 'Case & evidence', text: 'Dossiers, evidence chain and compiled intelligence reports.' },
];

export function LandingScreen() {
  const { enterPlatform, setSection, startDemo } = useActions();
  const { nodes, links } = useBackdrop();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.4 }}
      className="relative h-screen w-screen overflow-y-auto scrollbar-thin bg-void"
    >
      {/* Backdrop */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-grid-fine bg-grid opacity-40" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {links.map((l, i) => (
            <motion.line
              key={i}
              x1={nodes[l.a].x}
              y1={nodes[l.a].y}
              x2={nodes[l.b].x}
              y2={nodes[l.b].y}
              stroke="#22D3E0"
              strokeWidth={0.06}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.05, 0.18, 0.05] }}
              transition={{ duration: 6, delay: (i % 12) * 0.35, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          {nodes.map((n, i) => (
            <motion.circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r * 0.16}
              fill="#22D3E0"
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.12, 0.45, 0.12] }}
              transition={{ duration: 4.5, delay: n.d, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 bg-vignette" />
      </div>

      {/* Top strip */}
      <div className="relative flex items-center justify-between px-6 py-5">
        <span className="tech text-[10px] text-steel-600">
          Team {TEAM_NAME} · {SIH_INFO.id}
        </span>
        <span className="tech border border-line bg-panel/60 px-2.5 py-1 text-[9px] text-steel-500 backdrop-blur">
          Prototype · simulated data
        </span>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-5xl flex-col justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="font-display text-7xl font-bold tracking-[0.12em] text-paper sm:text-8xl">{PRODUCT_NAME}</h1>
          <p className="mt-3 font-display text-lg font-medium tracking-[0.22em] text-steel-400 sm:text-xl">
            NETWORK INTELLIGENCE
            <br />
            &amp; INVESTIGATION PLATFORM
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-steel-500">
            Connect the unseen. Understand the network.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => enterPlatform(true)}
            className="group flex items-center gap-3 border border-system-line bg-system-dim px-6 py-3.5 text-sm font-semibold text-system transition-colors hover:bg-system/20"
          >
            ENTER PLATFORM
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              enterPlatform(false);
              setSection('demo');
            }}
            className="group flex items-center gap-3 border border-line bg-panel/60 px-6 py-3.5 text-sm font-semibold text-steel-300 backdrop-blur transition-colors hover:border-edge hover:text-paper"
          >
            <PlayCircle className="h-4 w-4" />
            EXPLORE DEMO
          </motion.button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => {
            startDemo('nightfall');
          }}
          className="tech mt-4 self-start text-[10px] text-steel-600 underline-offset-4 transition-colors hover:text-system hover:underline"
        >
          Or jump straight into Operation Nightfall →
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-panel/70 p-4 backdrop-blur">
                <Icon className="h-4 w-4 text-system" />
                <p className="tech mt-2.5 text-[9px] text-steel-500">{c.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-steel-400">{c.text}</p>
              </div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 max-w-2xl text-[11px] leading-relaxed text-steel-600"
        >
          SENTINELX is a frontend prototype. It ships with one sample investigation and runs entirely on simulated,
          fictional data — no surveillance, tracking or collection of real personal information.
        </motion.p>
      </div>
    </motion.div>
  );
}
