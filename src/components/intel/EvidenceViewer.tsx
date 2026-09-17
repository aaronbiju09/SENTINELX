import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ShieldAlert, Crosshair, FolderPlus, Fingerprint } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { ENTITY_TYPE_META, RISK_COLOR, EVIDENCE_KIND_LABEL, formatDate } from '../../utils/entityMeta';

export function EvidenceViewer() {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();
  const item = data.evidence.find((e) => e.id === state.openEvidenceId);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
          onClick={() => actions.openEvidence(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl border border-edge bg-panel shadow-2xl shadow-black/70 cut-tr"
          >
            <div className="flex items-start gap-3 border-b border-line p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-system-line bg-system-dim">
                <Fingerprint className="h-4 w-4 text-system" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="tech text-[9px] text-system">{item.ref}</span>
                  <span className="tech text-[9px] text-steel-700">{EVIDENCE_KIND_LABEL[item.kind]}</span>
                  <span
                    className={`tech flex items-center gap-1 text-[9px] ${
                      item.integrity === 'VERIFIED' ? 'text-verify' : 'text-warn'
                    }`}
                  >
                    {item.integrity === 'VERIFIED' ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                    {item.integrity}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base font-semibold text-paper">{item.title}</h3>
                <p className="tech mt-0.5 text-[9px] text-steel-600">
                  Collected {formatDate(item.collected)} · {data.cases.find((c) => c.id === item.caseId)?.code}
                </p>
              </div>
              <button onClick={() => actions.openEvidence(null)} className="shrink-0 text-steel-600 hover:text-paper">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-4">
              <p className="text-[12px] leading-relaxed text-steel-300">{item.summary}</p>

              <div className="mt-4 border border-line">
                {Object.entries(item.fields).map(([k, v], i) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.035 }}
                    className="flex gap-3 border-b border-line/60 px-3 py-2 last:border-0 odd:bg-raise/30"
                  >
                    <span className="tech w-44 shrink-0 text-[9px] text-steel-600">{k}</span>
                    <span className="font-mono text-[11px] text-paper">{v}</span>
                  </motion.div>
                ))}
              </div>

              <p className="tech mt-3 text-[9px] text-steel-700">Linked entities</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.entityIds.map((id) => {
                  const ent = data.entities.find((e) => e.id === id);
                  if (!ent) return null;
                  const Icon = ENTITY_TYPE_META[ent.type].icon;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        actions.openEvidence(null);
                        actions.investigate(id);
                      }}
                      className="flex items-center gap-1.5 border border-line px-2 py-1 text-[10px] text-steel-300 transition-colors hover:border-system-line hover:text-paper"
                    >
                      <Icon className="h-3 w-3" style={{ color: RISK_COLOR[ent.riskLevel] }} />
                      {ent.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-px border-t border-line bg-line">
              <ViewerAct
                icon={Crosshair}
                label="Trace related entities"
                onClick={() => {
                  actions.openEvidence(null);
                  if (item.entityIds[0]) actions.traceFrom(item.entityIds[0]);
                }}
              />
              <ViewerAct
                icon={FolderPlus}
                label="Link to active case"
                onClick={() => {
                  item.entityIds.forEach((id) => actions.addToCase(id));
                  actions.openEvidence(null);
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ViewerAct({ icon: Icon, label, onClick }: { icon: typeof Crosshair; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="tech flex flex-1 items-center justify-center gap-2 bg-panel py-2.5 text-[9px] text-steel-400 transition-colors hover:bg-raise hover:text-paper"
    >
      <Icon className="h-3 w-3" />
      {label}
    </motion.button>
  );
}
