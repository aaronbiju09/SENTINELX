import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Compass, LogOut, Play, X } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useActiveInvestigation } from '../../hooks/useDataset';
import { DEMO_SCENARIOS } from '../../data/investigations';
import { PRIMARY_ENTITY_ID } from '../../data/mockData';

interface GuidedStep {
  title: string;
  body: string;
  /** Optional explicit action the presenter triggers from the control bar. */
  actionLabel?: string;
  run?: () => void;
}

/** Persistent demo-mode banner — never lets the panel mistake sample for real data. */
export function DemoBanner() {
  const state = useAppState();
  const actions = useActions();
  const investigation = useActiveInvestigation();
  const scenario = DEMO_SCENARIOS.find((s) => s.id === state.demo.scenarioId);

  if (!state.demo.active) return null;

  return (
    <div className="relative z-40 flex shrink-0 items-center gap-3 border-b border-system-line bg-system-dim px-3 py-1.5">
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-system animate-risk-pulse" />
        <span className="tech text-[9px] text-system">Demo mode</span>
      </span>
      <span className="tech truncate text-[9px] text-steel-400">
        {scenario?.title ?? investigation?.name} · sample data, not live intelligence
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        {!state.demo.guided && (
          <button
            onClick={() => actions.setGuided(true)}
            title="Start the guided walkthrough"
            className="tech flex items-center gap-1.5 border border-system-line px-2 py-1 text-[9px] text-system transition-colors hover:bg-system/15"
          >
            <Compass className="h-3 w-3" /> Guided demo
          </button>
        )}
        <button
          onClick={actions.exitDemo}
          title="Leave demo mode and return to the Demo Center"
          className="tech flex items-center gap-1.5 border border-line bg-panel px-2 py-1 text-[9px] text-steel-300 transition-colors hover:border-crit/50 hover:text-crit"
        >
          <LogOut className="h-3 w-3" /> Exit demo
        </button>
      </div>
    </div>
  );
}

/** The guided walkthrough control bar used during live presentation. */
export function GuidedDemo() {
  const state = useAppState();
  const actions = useActions();

  const steps = useMemo<GuidedStep[]>(
    () => [
      {
        title: 'Identify the central suspect',
        body: 'The network opens on the full investigation. Rohan Mehta carries the highest risk score, so the analysis starts there.',
        actionLabel: 'Focus suspect',
        run: () => actions.investigate(PRIMARY_ENTITY_ID),
      },
      {
        title: 'Trace their connections',
        body: 'Tracing walks outward hop by hop, reporting how many direct and secondary connections exist and how many touch a high-risk entity.',
        actionLabel: 'Run trace',
        run: () => actions.traceFrom(PRIMARY_ENTITY_ID),
      },
      {
        title: 'Run the intelligence engine',
        body: 'The engine scans entities, relationships and transaction patterns, then reports what it found across the network.',
        actionLabel: 'Run analysis',
        run: () => actions.runAI(),
      },
      {
        title: 'Reveal the hidden relationship',
        body: 'Link prediction proposes relationships that appear in no source record — each with a confidence score and its reasoning. You confirm, investigate or dismiss.',
        actionLabel: 'Reveal connections',
        run: () => actions.enterPredictionMode(),
      },
      {
        title: 'Review the risk profile',
        body: 'Every score decomposes into weighted contributing factors, so the panel can see exactly why an entity is rated the way it is.',
        actionLabel: 'Open risk breakdown',
        run: () => {
          actions.exitPredictionMode();
          actions.investigate(PRIMARY_ENTITY_ID, 'risk');
        },
      },
      {
        title: 'Compile the intelligence report',
        body: 'Finally the investigation compiles into a report that can be printed or exported.',
        actionLabel: 'Generate report',
        run: () => actions.generateReport(),
      },
    ],
    [actions]
  );

  if (!state.demo.active || !state.demo.guided || state.demo.intro) return null;

  const idx = Math.min(state.demo.step, steps.length - 1);
  const step = steps[idx];
  const last = idx === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="pointer-events-auto absolute bottom-[4.9rem] left-1/2 z-[45] w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 border border-system-line bg-panel/95 backdrop-blur-md shadow-2xl shadow-black/70 cut-both"
      >
        <div className="flex items-center gap-3 border-b border-line px-3 py-1.5">
          <span className="tech text-[9px] text-system">Guided demo</span>
          <span className="font-mono text-[10px] text-steel-400">
            {String(idx + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => actions.setGuided(false)}
              title="Exit the guided walkthrough (stay in demo mode)"
              className="tech flex items-center gap-1 border border-line px-2 py-1 text-[8px] text-steel-500 transition-colors hover:text-paper"
            >
              <X className="h-2.5 w-2.5" /> Exit guide
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[13px] font-semibold text-paper">
              Step {idx + 1} — {step.title}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-steel-400">{step.body}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {step.run && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={step.run}
                className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-3 py-2 text-[9px] text-system transition-colors hover:bg-system/20"
              >
                <Play className="h-3 w-3" />
                {step.actionLabel}
              </motion.button>
            )}
            <button
              onClick={() => actions.setDemoStep(Math.max(0, idx - 1))}
              disabled={idx === 0}
              title="Previous step"
              className="flex h-8 w-8 items-center justify-center border border-line text-steel-400 transition-colors hover:text-paper disabled:opacity-25"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => (last ? actions.setGuided(false) : actions.setDemoStep(idx + 1))}
              title={last ? 'Finish the walkthrough' : 'Next step'}
              className="tech flex h-8 items-center gap-1 border border-line px-2.5 text-[9px] text-steel-300 transition-colors hover:border-system-line hover:text-system"
            >
              {last ? 'Finish' : 'Next'}
              {!last && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex gap-px bg-line">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => actions.setDemoStep(i)}
              title={`Go to step ${i + 1}`}
              className={`h-1 flex-1 transition-colors ${i <= idx ? 'bg-system' : 'bg-raise hover:bg-edge'}`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
