import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActions } from '../../hooks/useActions';
import { useActiveInvestigation } from '../../hooks/useDataset';
import { summarize, DEMO_SCENARIOS } from '../../data/investigations';
import { PRODUCT_NAME } from '../../data/product';

const LINES = ['Loading entities', 'Mapping relationships', 'Running intelligence engine', 'Analyzing suspicious activity'];
const STEP_MS = 480;

/** Cinematic demo startup — only ever plays when entering a demo scenario. */
export function DemoIntro() {
  const { finishDemoIntro } = useActions();
  const investigation = useActiveInvestigation();
  const [step, setStep] = useState(0);
  const [reveal, setReveal] = useState(false);

  const counts = investigation ? summarize(investigation) : null;
  const scenario = DEMO_SCENARIOS.find((s) => s.id);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    LINES.forEach((_, i) => t.push(setTimeout(() => setStep(i + 1), STEP_MS * (i + 1))));
    t.push(setTimeout(() => setReveal(true), STEP_MS * (LINES.length + 1)));
    t.push(setTimeout(() => finishDemoIntro(), STEP_MS * LINES.length + 2100));
    return () => t.forEach(clearTimeout);
  }, [finishDemoIntro]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[190] flex flex-col items-center justify-center bg-void"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-vignette" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-system to-transparent opacity-60" />

      <div className="relative w-full max-w-md px-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-7 text-center">
          <p className="tech text-[10px] text-system">{PRODUCT_NAME} · Demo</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[0.1em] text-paper">
            INITIALIZING DEMO INVESTIGATION
          </h1>
          <p className="mt-2 text-xs text-steel-500">{investigation?.name ?? 'Sample investigation'}</p>
        </motion.div>

        <div className="space-y-1.5">
          {LINES.map((line, i) => {
            const active = step === i;
            const done = step > i;
            return (
              <motion.div
                key={line}
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= i ? 1 : 0.25 }}
                className="flex items-center gap-2.5 font-mono text-[11px]"
              >
                <span
                  className={`h-1 w-1 shrink-0 rounded-full ${
                    done ? 'bg-system' : active ? 'bg-system animate-caret-blink' : 'bg-steel-700'
                  }`}
                />
                <span className={done ? 'text-steel-400' : active ? 'text-paper' : 'text-steel-700'}>
                  {line.toUpperCase()}
                  {active && <span className="animate-caret-blink">_</span>}
                </span>
                {done && <span className="ml-auto text-[10px] text-system">OK</span>}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {reveal && counts && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7 border-t border-line pt-5"
            >
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: counts.entities, l: 'Entities' },
                  { v: counts.relationships, l: 'Relations' },
                  { v: counts.events, l: 'Events' },
                  { v: counts.alerts, l: 'Alerts' },
                ].map((c, i) => (
                  <motion.div
                    key={c.l}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="text-center"
                  >
                    <p className="font-display text-2xl font-bold text-system">{c.v}</p>
                    <p className="tech text-[9px] text-steel-600">{c.l}</p>
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="tech mt-4 text-center text-[10px] text-verify"
              >
                {(investigation?.name ?? 'Investigation').toUpperCase()} READY
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={finishDemoIntro}
        className="tech absolute bottom-8 right-8 border border-line px-3 py-1.5 text-[10px] text-steel-500 transition-colors hover:border-edge hover:text-paper"
      >
        Skip intro
      </button>
      <p className="tech absolute bottom-8 left-8 text-[9px] text-steel-700">
        Simulated environment · fictional data{scenario ? '' : ''}
      </p>
    </motion.div>
  );
}
