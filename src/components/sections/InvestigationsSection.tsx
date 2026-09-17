import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowRight, Archive, FolderOpen, PlayCircle } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { summarize } from '../../data/investigations';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { RISK_COLOR, formatDate } from '../../utils/entityMeta';
import type { InvestigationPriority } from '../../types';

export function InvestigationsSection({
  createOpen,
  onOpenCreate,
  onCloseCreate,
}: {
  createOpen: boolean;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
}) {
  const state = useAppState();
  const actions = useActions();
  const [showArchived, setShowArchived] = useState(false);

  const list = state.investigations.filter((i) => (showArchived ? true : i.status !== 'ARCHIVED'));

  return (
    <>
      <SectionPage
        title="INVESTIGATIONS"
        subtitle="Every investigation owns its own entities, cases and evidence. Screens render whichever one is open."
        actions={
          <>
            <button
              onClick={() => setShowArchived((v) => !v)}
              className={`tech border px-2.5 py-1.5 text-[9px] transition-colors ${
                showArchived ? 'border-system-line bg-system-dim text-system' : 'border-line text-steel-500 hover:text-paper'
              }`}
            >
              {showArchived ? 'Showing archived' : 'Show archived'}
            </button>
            <button
              onClick={onOpenCreate}
              className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-3 py-1.5 text-[9px] text-system transition-colors hover:bg-system/20"
            >
              <Plus className="h-3 w-3" /> New investigation
            </button>
          </>
        }
      >
        {list.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No investigations"
            body="Create an investigation to start mapping a network, or explore the bundled Operation Nightfall sample from the Demo Center."
            actions={
              <>
                <button
                  onClick={onOpenCreate}
                  className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-3 py-2 text-[9px] text-system"
                >
                  <Plus className="h-3 w-3" /> Create investigation
                </button>
                <button
                  onClick={() => actions.setSection('demo')}
                  className="tech flex items-center gap-1.5 border border-line px-3 py-2 text-[9px] text-steel-400 hover:text-paper"
                >
                  <PlayCircle className="h-3 w-3" /> Explore demo
                </button>
              </>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {list.map((inv, i) => {
              const counts = summarize(inv);
              const active = inv.id === state.activeInvestigationId;
              const archived = inv.status === 'ARCHIVED';
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex flex-col border p-4 ${
                    active ? 'border-system-line bg-system-dim/30' : 'border-line bg-panel/60'
                  } ${archived ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-display text-[15px] font-semibold text-paper">{inv.name}</h3>
                        {inv.source === 'SAMPLE' && (
                          <span className="tech border border-system-line px-1.5 py-0.5 text-[8px] text-system">Sample</span>
                        )}
                      </div>
                      <p className="tech mt-0.5 text-[8px] text-steel-600">
                        {inv.status} · created {formatDate(inv.createdAt)}
                      </p>
                    </div>
                    <span
                      className="tech shrink-0 border px-1.5 py-0.5 text-[8px]"
                      style={{
                        color:
                          inv.priority === 'HIGH' ? RISK_COLOR.CRITICAL : inv.priority === 'MEDIUM' ? RISK_COLOR.MEDIUM : RISK_COLOR.LOW,
                        borderColor: 'currentColor',
                      }}
                    >
                      {inv.priority}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 flex-1 text-[11px] leading-relaxed text-steel-500">
                    {inv.description || 'No description provided.'}
                  </p>

                  {inv.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {inv.tags.map((t) => (
                        <span key={t} className="border border-line px-1.5 py-0.5 text-[9px] text-steel-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-4 gap-px border border-line bg-line">
                    <Count v={counts.entities} l="Entities" />
                    <Count v={counts.relationships} l="Links" />
                    <Count v={counts.cases} l="Cases" />
                    <Count v={counts.evidence} l="Evidence" />
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    <button
                      onClick={() => actions.openInvestigation(inv.id)}
                      className="tech flex flex-1 items-center justify-center gap-1.5 border border-line px-2 py-2 text-[9px] text-steel-300 transition-colors hover:border-system-line hover:text-system"
                    >
                      {active ? 'Reopen' : 'Open'} <ArrowRight className="h-3 w-3" />
                    </button>
                    {!archived && inv.source === 'USER' && (
                      <button
                        onClick={() => actions.archiveInvestigation(inv.id)}
                        title="Archive this investigation"
                        className="flex items-center justify-center border border-line px-2.5 text-steel-500 transition-colors hover:text-crit"
                      >
                        <Archive className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionPage>

      <CreateInvestigationModal open={createOpen} onClose={onCloseCreate} />
    </>
  );
}

function Count({ v, l }: { v: number; l: string }) {
  return (
    <div className="bg-panel py-1.5 text-center">
      <p className="font-display text-[13px] font-bold text-paper">{v}</p>
      <p className="tech text-[7px] text-steel-600">{l}</p>
    </div>
  );
}

const PRIORITIES: InvestigationPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

export function CreateInvestigationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const actions = useActions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<InvestigationPriority>('MEDIUM');
  const [tagInput, setTagInput] = useState('');

  function submit() {
    if (!name.trim()) return;
    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6);
    actions.createInvestigation({ name, description, priority, tags });
    setName('');
    setDescription('');
    setPriority('MEDIUM');
    setTagInput('');
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md border border-edge bg-panel shadow-2xl shadow-black/70 cut-tr"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="tech text-[9px] text-system">New investigation</p>
                <h3 className="font-display text-base font-semibold text-paper">Create a workspace</h3>
              </div>
              <button onClick={onClose} className="text-steel-600 hover:text-paper" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <Field label="Investigation name" required>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="e.g. Operation Blue Harbour"
                  className="w-full border border-line bg-carbon px-3 py-2 text-[12px] text-paper placeholder:text-steel-700 outline-none focus:border-system-line"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What is being investigated?"
                  className="w-full resize-none border border-line bg-carbon px-3 py-2 text-[12px] text-paper placeholder:text-steel-700 outline-none focus:border-system-line"
                />
              </Field>

              <Field label="Priority">
                <div className="flex gap-1.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`tech flex-1 border px-2 py-2 text-[9px] transition-colors ${
                        priority === p ? 'border-system-line bg-system-dim text-system' : 'border-line text-steel-500 hover:text-paper'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Tags (comma separated)">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="fraud, coastal, financial"
                  className="w-full border border-line bg-carbon px-3 py-2 text-[12px] text-paper placeholder:text-steel-700 outline-none focus:border-system-line"
                />
              </Field>

              <p className="border border-line bg-raise/40 px-3 py-2 text-[10px] leading-relaxed text-steel-500">
                New investigations start empty. In this prototype the platform has no ingestion backend, so populated
                data is only available in the bundled sample investigation.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-line p-3">
              <button
                onClick={onClose}
                className="tech border border-line px-3 py-2 text-[9px] text-steel-400 transition-colors hover:text-paper"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!name.trim()}
                className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-4 py-2 text-[9px] text-system transition-colors hover:bg-system/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3 w-3" /> Create investigation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="tech mb-1 block text-[8px] text-steel-600">
        {label}
        {required && <span className="ml-1 text-crit">*</span>}
      </span>
      {children}
    </label>
  );
}
