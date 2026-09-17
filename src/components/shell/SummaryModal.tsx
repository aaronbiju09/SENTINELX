import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset, useActiveInvestigation } from '../../hooks/useDataset';
import { countConnectedComponents } from '../../utils/graphLayout';
import { PRODUCT_NAME } from '../../data/product';
import { RISK_COLOR } from '../../utils/entityMeta';

export function SummaryModal() {
  const state = useAppState();
  const { closeSummary } = useActions();
  const data = useDataset();
  const investigation = useActiveInvestigation();

  const entities = data.entities;
  const highRisk = entities.filter((e) => e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH').length;
  const clusters = countConnectedComponents(entities, data.relationships);
  const bridges = entities.filter((e) => e.tags.includes('bridge-candidate'));
  const predicted = data.predictions.length;

  const stats = [
    { v: entities.length, l: 'Entities analyzed' },
    { v: data.relationships.length, l: 'Relationships mapped' },
    { v: highRisk, l: 'High-risk entities', c: RISK_COLOR.CRITICAL },
    { v: predicted, l: 'Predicted links', c: '#22D3E0' },
    { v: clusters, l: 'Network clusters' },
    { v: Math.max(bridges.length, 1), l: 'Bridge entities', c: '#2FCB86' },
  ];

  return (
    <AnimatePresence>
      {state.summaryOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-void/85 p-4 backdrop-blur"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="w-full max-w-lg border border-system-line bg-panel shadow-2xl shadow-black/80 cut-both"
          >
            <div className="border-b border-line bg-gradient-to-b from-system-dim to-transparent p-6 text-center">
              <ShieldCheck className="mx-auto mb-2 h-7 w-7 text-system" />
              <p className="tech text-[9px] text-system">Investigation summary</p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-wide text-paper">
                {(investigation?.name ?? 'Investigation').toUpperCase()}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 p-5">
              {stats.map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="border border-line bg-raise/40 py-2.5 text-center"
                >
                  <p className="font-display text-xl font-bold" style={{ color: s.c ?? '#E9EDF4' }}>
                    {s.v}
                  </p>
                  <p className="tech mt-0.5 text-[8px] leading-tight text-steel-600">{s.l}</p>
                </motion.div>
              ))}
            </div>

            {bridges[0] && (
              <div className="mx-5 mb-5 border-l-2 border-system bg-raise/40 p-3">
                <p className="tech text-[9px] text-steel-600">Key finding</p>
                <p className="mt-1 text-[11px] leading-relaxed text-steel-300">
                  {bridges[0].name} bridges the operational and financial clusters — the shortest path between the
                  primary subject and the shell company runs through this entity.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-line p-4">
              <p className="tech text-[8px] text-steel-700">{PRODUCT_NAME} · simulated data</p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={closeSummary}
                className="tech flex items-center gap-2 border border-system-line bg-system-dim px-4 py-2.5 text-[10px] text-system transition-colors hover:bg-system/20"
              >
                Enter investigation
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
