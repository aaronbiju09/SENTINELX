import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronDown, Briefcase } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useActiveInvestigation, useDataset } from '../../hooks/useDataset';
import { RISK_COLOR } from '../../utils/entityMeta';

/** Case context and live telemetry, docked to the top edge of the canvas. */
export function InvestigationHeader() {
  const state = useAppState();
  const actions = useActions();
  const investigation = useActiveInvestigation();
  const data = useDataset();
  const [open, setOpen] = useState(false);

  const activeCase = data.cases.find((c) => c.id === state.activeCaseId) ?? data.cases[0] ?? null;
  const unread = data.alerts.filter((a) => !a.read).length;
  const threat = activeCase ? RISK_COLOR[activeCase.threatLevel] : '#6B7687';

  const aiLabel = state.ai.running ? 'ANALYZING' : state.ai.result ? 'COMPLETE' : 'IDLE';
  const aiColor = state.ai.running ? '#22D3E0' : state.ai.result ? '#2FCB86' : '#525C6D';

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3">
      <div className="pointer-events-auto relative">
        <button
          onClick={() => activeCase && setOpen((v) => !v)}
          title={activeCase ? 'Switch case file' : 'No case files in this investigation'}
          className="flex items-start gap-2.5 border border-line bg-panel/85 px-3 py-2 backdrop-blur cut-tr transition-colors hover:border-edge"
        >
          <span className="mt-1 flex h-2 w-2 shrink-0 items-center justify-center">
            <span className="absolute h-2 w-2 rounded-full opacity-60 animate-risk-pulse" style={{ backgroundColor: threat }} />
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: threat }} />
          </span>
          <span className="text-left">
            <span className="tech flex items-center gap-2 text-[9px] text-steel-600">
              {activeCase ? activeCase.code : 'NO CASE FILE'}
              {activeCase && (
                <>
                  <span className="text-steel-700">/</span>
                  <span style={{ color: threat }}>THREAT {activeCase.threatLevel}</span>
                </>
              )}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5">
              <span className="font-display text-sm font-semibold tracking-wide text-paper">
                {(activeCase?.name ?? investigation?.name ?? 'Workspace').toUpperCase()}
              </span>
              {activeCase && <ChevronDown className={`h-3 w-3 text-steel-600 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </span>
          </span>
        </button>

        {open && activeCase && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 top-[calc(100%+4px)] z-20 w-64 border border-line bg-panel/95 backdrop-blur cut-tr"
            >
              <p className="tech border-b border-line px-3 py-1.5 text-[8px] text-steel-600">Case files in this investigation</p>
              {data.cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    actions.setCase(c.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 border-b border-line/60 px-3 py-2 text-left last:border-0 transition-colors hover:bg-raise ${
                    c.id === activeCase.id ? 'bg-system-dim' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="tech block text-[9px] text-steel-600">{c.code}</span>
                    <span className="block truncate text-[11px] text-paper">{c.name}</span>
                  </span>
                  <span className="tech shrink-0 text-[8px]" style={{ color: RISK_COLOR[c.threatLevel] }}>
                    {c.status}
                  </span>
                </button>
              ))}
              <button
                onClick={() => {
                  actions.setSection('cases');
                  setOpen(false);
                }}
                className="tech w-full border-t border-line px-3 py-2 text-left text-[9px] text-system transition-colors hover:bg-system-dim"
              >
                Open case dossiers →
              </button>
            </motion.div>
          </>
        )}
      </div>

      <div className="pointer-events-auto flex items-stretch border border-line bg-panel/85 backdrop-blur cut-tl">
        <Metric value={data.entities.length} label="Entities" />
        <Metric value={data.relationships.length} label="Links" />
        <Metric value={unread} label="Alerts" tone={unread > 0 ? '#F0A93B' : undefined} />
        <div className="flex items-center gap-1.5 border-l border-line px-3">
          <Activity className="h-3 w-3" style={{ color: aiColor }} />
          <span className="tech text-[9px]" style={{ color: aiColor }}>
            AI {aiLabel}
          </span>
        </div>
        <button
          onClick={() => actions.setSection('cases')}
          title="Open case dossiers"
          className="hidden items-center gap-1.5 border-l border-line px-3 text-steel-600 transition-colors hover:text-paper lg:flex"
        >
          <Briefcase className="h-3 w-3" />
          <span className="tech text-[9px]">{data.cases.length} cases</span>
        </button>
      </div>
    </div>
  );
}

function Metric({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <div className="flex min-w-[54px] flex-col items-center justify-center border-l border-line px-3 py-1.5 first:border-l-0">
      <span className="font-display text-sm font-bold tabular-nums" style={{ color: tone ?? '#E9EDF4' }}>
        {value}
      </span>
      <span className="tech text-[8px] text-steel-600">{label}</span>
    </div>
  );
}
