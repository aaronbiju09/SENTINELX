import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Network, Sparkles, FileText, FolderPlus, PlayCircle } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { PRODUCT_NAME } from '../../data/product';

const STEPS = [
  { icon: FolderPlus, title: 'Create or open an investigation', body: 'Each investigation is its own workspace of entities, cases and evidence.' },
  { icon: Search, title: 'Search entities', body: 'Press / or Ctrl+K anywhere to find a person, phone, wallet, account or case.' },
  { icon: Network, title: 'Explore relationships', body: 'The network canvas maps everything. Click a node to open its intelligence panel.' },
  { icon: Sparkles, title: 'Run AI analysis', body: 'Surface predicted links and patterns, each with confidence and reasoning.' },
  { icon: FileText, title: 'Generate reports', body: 'Compile the investigation into a printable intelligence report.' },
];

export function OnboardingOverlay() {
  const state = useAppState();
  const actions = useActions();

  return (
    <AnimatePresence>
      {state.onboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[160] flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
          onClick={() => actions.setOnboarding(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md border border-edge bg-panel shadow-2xl shadow-black/70 cut-tr"
          >
            <div className="flex items-start justify-between border-b border-line p-4">
              <div>
                <p className="tech text-[9px] text-system">Getting started</p>
                <h3 className="font-display text-lg font-bold tracking-wide text-paper">WELCOME TO {PRODUCT_NAME}</h3>
              </div>
              <button onClick={() => actions.setOnboarding(false)} className="text-steel-600 hover:text-paper" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 p-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-line bg-raise/60">
                      <Icon className="h-3.5 w-3.5 text-system" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-paper">
                        {i + 1}. {s.title}
                      </p>
                      <p className="text-[10px] leading-snug text-steel-500">{s.body}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-line p-3">
              <button
                onClick={() => {
                  actions.setOnboarding(false);
                  actions.setSection('demo');
                }}
                className="tech flex items-center gap-1.5 border border-line px-3 py-2 text-[9px] text-steel-400 transition-colors hover:text-paper"
              >
                <PlayCircle className="h-3 w-3" /> Skip to demo
              </button>
              <button
                onClick={() => actions.setOnboarding(false)}
                className="tech border border-system-line bg-system-dim px-4 py-2 text-[9px] text-system transition-colors hover:bg-system/20"
              >
                Get started
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
