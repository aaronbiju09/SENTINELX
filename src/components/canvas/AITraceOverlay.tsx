import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, X, Radio, GitBranch } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';

/** Cinematic AI analysis + the trace activity feed, docked to the canvas left edge. */
export function AITraceOverlay() {
  const state = useAppState();
  const { runAI, resetTrace, enterPredictionMode, investigate } = useActions();
  const data = useDataset();
  const { ai, trace } = state;

  const showAI = ai.running || ai.result;
  const bridge = ai.result?.intermediaries
    .map((id) => data.entities.find((e) => e.id === id))
    .find((e) => e?.tags.includes('bridge-candidate'));

  return (
    <div className="pointer-events-none absolute left-3 top-16 z-30 flex w-72 flex-col gap-2">
      {/* Scanning sweep across the whole canvas while the engine runs */}
      <AnimatePresence>
        {ai.running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
          >
            <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-system/10 to-transparent animate-scan-line" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trace activity feed */}
      <AnimatePresence>
        {trace.active && trace.log.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="pointer-events-auto border border-line bg-panel/92 backdrop-blur cut-tr"
          >
            <div className="flex items-center gap-2 border-b border-line px-3 py-2">
              <Radio className="h-3 w-3 animate-caret-blink text-system" />
              <span className="tech flex-1 truncate text-[9px] text-system">Connection trace</span>
              <button onClick={resetTrace} className="text-steel-600 hover:text-paper" aria-label="Close trace">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="max-h-44 space-y-1 overflow-y-auto scrollbar-thin p-2.5">
              {trace.log.map((line) => (
                <motion.p
                  key={line.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-mono text-[10px] leading-snug"
                  style={{
                    color:
                      line.tone === 'danger'
                        ? '#F3474F'
                        : line.tone === 'success'
                        ? '#2FCB86'
                        : line.tone === 'warning'
                        ? '#F0A93B'
                        : '#8C97A8',
                  }}
                >
                  {line.text}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI engine */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="pointer-events-auto border border-system-line bg-panel/92 backdrop-blur cut-tr"
          >
            <div className="flex items-center gap-2 border-b border-line px-3 py-2">
              <Sparkles className="h-3 w-3 text-system" />
              <span className="tech flex-1 text-[9px] text-system">
                {ai.running ? 'Intelligence engine' : 'Analysis complete'}
              </span>
            </div>

            {ai.running && (
              <div className="space-y-1.5 p-3">
                {ai.stages.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span
                      className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${
                        s.done ? 'border-system bg-system-dim' : 'border-steel-700'
                      }`}
                    >
                      {s.done && <Check className="h-2 w-2 text-system" strokeWidth={3} />}
                    </span>
                    <span className={`font-mono text-[10px] ${s.done ? 'text-steel-400' : 'text-steel-700'}`}>
                      {s.label.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!ai.running && ai.result && (
              <div className="space-y-3 p-3">
                <div className="grid grid-cols-3 gap-2">
                  <Stat value={ai.result.entityCount} label="Entities" />
                  <Stat value={ai.result.relationshipCount} label="Links" />
                  <Stat value={ai.result.highRiskCount} label="High risk" tone="#F3474F" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="border-l-2 border-system pl-2.5"
                >
                  <p className="tech text-[9px] text-steel-600">Finding</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-paper">{ai.result.insight}</p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[10px] leading-relaxed text-steel-500"
                >
                  {ai.result.unusualPattern}
                </motion.p>

                {bridge && (
                  <button
                    onClick={() => investigate(bridge.id)}
                    className="tech w-full border border-line px-2 py-1.5 text-[9px] text-steel-400 transition-colors hover:border-system-line hover:text-system"
                  >
                    Inspect bridge entity
                  </button>
                )}

                <button
                  onClick={enterPredictionMode}
                  className="tech flex w-full items-center justify-center gap-1.5 border border-system-line bg-system-dim px-2 py-2 text-[9px] text-system transition-colors hover:bg-system/20"
                >
                  <GitBranch className="h-3 w-3" />
                  Trace hidden connections
                </button>

                <p className="tech border-t border-line pt-2 text-[8px] text-steel-700">
                  Simulated analysis · demo data
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!showAI && !trace.active && (
        <button
          onClick={() => runAI()}
          className="tech pointer-events-auto flex items-center gap-2 border border-line bg-panel/85 px-3 py-2 text-[9px] text-steel-400 backdrop-blur cut-tr transition-colors hover:border-system-line hover:text-system"
        >
          <Sparkles className="h-3 w-3" />
          Analyze network
        </button>
      )}
    </div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <div className="border border-line bg-raise/50 py-1.5 text-center">
      <p className="font-display text-base font-bold" style={{ color: tone ?? '#22D3E0' }}>
        {value}
      </p>
      <p className="tech text-[8px] text-steel-600">{label}</p>
    </div>
  );
}
