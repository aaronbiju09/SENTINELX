import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { EVIDENCE_KIND_LABEL, formatDate, ENTITY_TYPE_META, RISK_COLOR } from '../../utils/entityMeta';

export function EvidenceSection() {
  const state = useAppState();
  const actions = useActions();
  const { openEvidence } = actions;
  const data = useDataset();
  const [kind, setKind] = useState<string>('ALL');

  const kinds = useMemo(() => [...new Set(data.evidence.map((e) => e.kind))], [data.evidence]);
  const items = useMemo(
    () => (kind === 'ALL' ? data.evidence : data.evidence.filter((e) => e.kind === kind)),
    [kind, data.evidence]
  );

  return (
    <SectionPage title="EVIDENCE VAULT" subtitle={`${data.evidence.length} items collected in the active investigation`}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Chip active={kind === 'ALL'} onClick={() => setKind('ALL')}>All</Chip>
        {kinds.map((k) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
            {EVIDENCE_KIND_LABEL[k]}
          </Chip>
        ))}
      </div>

      {data.evidence.length === 0 && (
        <EmptyState
          icon={ShieldAlert}
          title="No evidence collected"
          body="Evidence appears here once an investigation contains items. The sample investigation ships with a populated vault."
          actions={
            <button
              onClick={() => actions.setSection('investigations')}
              className="tech border border-line px-3 py-2 text-[9px] text-steel-400 hover:text-paper"
            >
              Choose an investigation
            </button>
          }
        />
      )}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((ev, i) => (
          <motion.button
            key={ev.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
            onClick={() => openEvidence(ev.id)}
            className="group border border-line bg-panel/70 p-3.5 text-left transition-colors hover:border-system-line cut-tr"
          >
            <div className="flex items-center gap-2">
              <span className="tech text-[9px] text-system">{ev.ref}</span>
              <span className="tech text-[9px] text-steel-700">{EVIDENCE_KIND_LABEL[ev.kind]}</span>
              <span className={`tech ml-auto flex items-center gap-1 text-[8px] ${ev.integrity === 'VERIFIED' ? 'text-verify' : 'text-warn'}`}>
                {ev.integrity === 'VERIFIED' ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldAlert className="h-2.5 w-2.5" />}
                {ev.integrity}
              </span>
            </div>
            <p className="mt-1.5 font-display text-[13px] font-semibold text-paper">{ev.title}</p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-steel-500">{ev.summary}</p>
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-line/60 pt-2">
              {ev.entityIds.slice(0, 4).map((id) => {
                const ent = data.entities.find((e) => e.id === id);
                if (!ent) return null;
                const Icon = ENTITY_TYPE_META[ent.type].icon;
                return <Icon key={id} className="h-3 w-3" style={{ color: RISK_COLOR[ent.riskLevel] }} />;
              })}
              <span className="tech ml-auto text-[8px] text-steel-600">
                {data.cases.find((c) => c.id === ev.caseId)?.code} · {formatDate(ev.collected)}
              </span>
              <ArrowUpRight className="h-3 w-3 text-steel-700 group-hover:text-system" />
            </div>
          </motion.button>
        ))}
      </div>
    </SectionPage>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`tech border px-2 py-1 text-[8px] transition-colors ${
        active ? 'border-system-line bg-system-dim text-system' : 'border-line text-steel-500 hover:text-paper'
      }`}
    >
      {children}
    </button>
  );
}
