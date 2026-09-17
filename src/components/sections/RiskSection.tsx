import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, ArrowRight } from 'lucide-react';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { RiskDial, RiskBreakdown } from '../intel/RiskDial';
import { explainRisk } from '../../utils/riskFactors';
import { ENTITY_TYPE_META, RISK_COLOR } from '../../utils/entityMeta';
import type { RiskLevel } from '../../types';

const LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function RiskSection() {
  const actions = useActions();
  const data = useDataset();

  const ranked = useMemo(
    () => [...data.entities].filter((e) => e.riskLevel !== 'UNKNOWN').sort((a, b) => b.riskScore - a.riskScore),
    [data.entities]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = ranked.find((e) => e.id === selectedId) ?? ranked[0] ?? null;

  const distribution = LEVELS.map((l) => ({
    level: l,
    count: data.entities.filter((e) => e.riskLevel === l).length,
  }));
  const total = distribution.reduce((s, d) => s + d.count, 0) || 1;

  if (ranked.length === 0) {
    return (
      <SectionPage title="RISK ANALYSIS" subtitle="Distribution and explainable scoring across the active investigation.">
        <EmptyState
          icon={Gauge}
          title="No scored entities"
          body="This investigation contains no entities to score. Open the sample investigation to see explainable risk in action."
          actions={
            <button
              onClick={() => actions.setSection('investigations')}
              className="tech border border-line px-3 py-2 text-[9px] text-steel-400 hover:text-paper"
            >
              Choose an investigation
            </button>
          }
        />
      </SectionPage>
    );
  }

  const connections = selected
    ? data.relationships.filter((r) => r.source === selected.id || r.target === selected.id).length
    : 0;

  return (
    <SectionPage
      title="RISK ANALYSIS"
      subtitle="Every score decomposes into weighted contributing factors — select an entity to see why it scores what it does."
    >
      {/* Distribution */}
      <div className="mb-4 border border-line bg-panel/60 p-4">
        <p className="tech mb-3 text-[9px] text-steel-600">Distribution · {total} scored entities</p>
        <div className="flex h-3 w-full overflow-hidden">
          {distribution.map((d) => (
            <motion.div
              key={d.level}
              initial={{ width: 0 }}
              animate={{ width: `${(d.count / total) * 100}%` }}
              transition={{ duration: 0.6 }}
              style={{ backgroundColor: RISK_COLOR[d.level] }}
              title={`${d.level}: ${d.count}`}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {distribution.map((d) => (
            <div key={d.level} className="flex items-center gap-2 border border-line bg-raise/40 px-2.5 py-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLOR[d.level] }} />
              <span className="tech flex-1 text-[8px] text-steel-500">{d.level}</span>
              <span className="font-display text-sm font-bold text-paper">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Ranking */}
        <div>
          <p className="tech mb-2 text-[9px] text-steel-600">Ranked by score</p>
          <div className="max-h-[26rem] overflow-y-auto scrollbar-thin border border-line">
            {ranked.map((e, i) => {
              const Icon = ENTITY_TYPE_META[e.type].icon;
              const active = selected?.id === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={`flex w-full items-center gap-2.5 border-b border-line/50 px-3 py-2 text-left transition-colors last:border-0 ${
                    active ? 'bg-system-dim' : 'hover:bg-raise/60'
                  }`}
                >
                  <span className="tech w-5 shrink-0 text-[9px] text-steel-700">{String(i + 1).padStart(2, '0')}</span>
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: RISK_COLOR[e.riskLevel] }} />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-paper">{e.name}</span>
                  <span className="h-1 w-16 shrink-0 bg-raise">
                    <span className="block h-full" style={{ width: `${e.riskScore}%`, backgroundColor: RISK_COLOR[e.riskLevel] }} />
                  </span>
                  <span className="w-7 shrink-0 text-right font-mono text-[11px]" style={{ color: RISK_COLOR[e.riskLevel] }}>
                    {e.riskScore}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {selected && (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-line bg-panel/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="tech text-[9px] text-steel-600">{ENTITY_TYPE_META[selected.type].label}</p>
                <h3 className="font-display text-lg font-semibold text-paper">{selected.name}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-steel-500">{selected.summary}</p>
              </div>
              <RiskDial score={selected.riskScore} level={selected.riskLevel} size={104} />
            </div>

            <p className="tech mb-2 mt-4 border-t border-line pt-3 text-[9px] text-steel-600">
              Why this score
            </p>
            <RiskBreakdown factors={explainRisk(selected, connections)} />

            <button
              onClick={() => actions.investigate(selected.id, 'risk')}
              className="tech mt-4 flex w-full items-center justify-center gap-1.5 border border-line px-3 py-2 text-[9px] text-steel-300 transition-colors hover:border-system-line hover:text-system"
            >
              Investigate on network <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </div>
    </SectionPage>
  );
}
