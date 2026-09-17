import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { ENTITY_TYPE_META, RISK_COLOR } from '../../utils/entityMeta';
import type { EntityType, RiskLevel } from '../../types';

const RISKS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function RegistrySection() {
  const state = useAppState();
  const actions = useActions();
  const { investigate } = actions;
  const data = useDataset();
  const [q, setQ] = useState('');
  const [type, setType] = useState<EntityType | 'ALL'>('ALL');
  const [risk, setRisk] = useState<RiskLevel | 'ALL'>('ALL');

  const types = useMemo(() => {
    const present = new Set(data.entities.map((e) => e.type));
    return (Object.keys(ENTITY_TYPE_META) as EntityType[]).filter((t) => present.has(t));
  }, [data.entities]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.entities
      .filter((e) => (type === 'ALL' ? true : e.type === type))
      .filter((e) => (risk === 'ALL' ? true : e.riskLevel === risk))
      .filter((e) => (needle ? e.name.toLowerCase().includes(needle) || e.aliases.some((a) => a.toLowerCase().includes(needle)) : true))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [data.entities, q, type, risk]);

  return (
    <SectionPage title="ENTITY REGISTRY" subtitle={`${data.entities.length} entities in the active investigation`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-600" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter registry…"
            className="w-full border border-line bg-panel py-1.5 pl-8 pr-3 text-[12px] text-paper placeholder:text-steel-600 outline-none focus:border-system-line"
          />
        </div>
        <Chip active={type === 'ALL'} onClick={() => setType('ALL')}>All types</Chip>
        {types.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
            {ENTITY_TYPE_META[t].short}
          </Chip>
        ))}
        <span className="mx-1 h-4 w-px bg-line" />
        <Chip active={risk === 'ALL'} onClick={() => setRisk('ALL')}>All risk</Chip>
        {RISKS.map((r) => (
          <Chip key={r} active={risk === r} onClick={() => setRisk(r)} color={RISK_COLOR[r]}>
            {r}
          </Chip>
        ))}
      </div>

      {data.entities.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No entities in this investigation"
          body="Open the bundled sample investigation to browse a populated registry."
          actions={
            <button
              onClick={() => actions.setSection('investigations')}
              className="tech border border-line px-3 py-2 text-[9px] text-steel-400 hover:text-paper"
            >
              Choose an investigation
            </button>
          }
        />
      ) : rows.length === 0 ? (
        <p className="py-20 text-center text-sm text-steel-600">No entities match these filters.</p>
      ) : (
        <div className="border border-line">
          <div className="tech grid grid-cols-[1fr_88px_88px_64px_72px] gap-2 border-b border-line bg-raise/40 px-3 py-2 text-[8px] text-steel-600">
            <span>Entity</span>
            <span>Type</span>
            <span>Risk</span>
            <span className="text-right">Links</span>
            <span className="text-right">Status</span>
          </div>
          {rows.map((e, i) => {
            const meta = ENTITY_TYPE_META[e.type];
            const Icon = meta.icon;
            const links = data.relationships.filter((r) => r.source === e.id || r.target === e.id).length;
            return (
              <motion.button
                key={e.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.012, 0.3) }}
                onClick={() => investigate(e.id)}
                className="grid w-full grid-cols-[1fr_88px_88px_64px_72px] items-center gap-2 border-b border-line/50 px-3 py-2 text-left transition-colors last:border-0 hover:bg-raise/60"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: RISK_COLOR[e.riskLevel] }} />
                  <span className="truncate text-[12px] text-paper">{e.name}</span>
                  {e.flagged && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-crit" />}
                </span>
                <span className="tech text-[9px] text-steel-500">{meta.short}</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-8 bg-raise">
                    <span className="block h-full" style={{ width: `${e.riskScore}%`, backgroundColor: RISK_COLOR[e.riskLevel] }} />
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: RISK_COLOR[e.riskLevel] }}>
                    {e.riskLevel === 'UNKNOWN' ? '—' : e.riskScore}
                  </span>
                </span>
                <span className="text-right font-mono text-[10px] text-steel-400">{links}</span>
                <span className="tech text-right text-[8px] text-steel-600">{e.status}</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </SectionPage>
  );
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`tech flex items-center gap-1 border px-2 py-1 text-[8px] transition-colors ${
        active ? 'border-system-line bg-system-dim text-system' : 'border-line text-steel-500 hover:text-paper'
      }`}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </button>
  );
}
