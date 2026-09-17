import { motion } from 'framer-motion';
import {
  Sparkles,
  GitBranch,
  Radar,
  Check,
  X,
  Search,
  Network,
  ShieldQuestion,
  Fingerprint,
  Coins,
  Share2,
} from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { ENTITY_TYPE_META, RISK_COLOR } from '../../utils/entityMeta';

export function IntelligenceSection() {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();

  const pending = data.predictions.filter((p) => p.verdict === 'PENDING');
  const triaged = data.predictions.filter((p) => p.verdict !== 'PENDING');
  const inferred = data.relationships.filter((r) => r.inferred);
  const suspicious = data.relationships.filter((r) => r.suspicious);
  const shared = data.entities.filter((e) => e.tags.includes('shared-infrastructure'));
  const bridges = data.entities.filter((e) => e.tags.includes('bridge-candidate'));

  if (data.entities.length === 0) {
    return (
      <SectionPage title="AI INTELLIGENCE" subtitle="Link prediction, pattern detection and engine findings.">
        <EmptyState
          icon={Sparkles}
          title="Nothing to analyze yet"
          body="This investigation has no entities. Open the sample investigation or add data before running the intelligence engine."
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

  return (
    <SectionPage
      title="AI INTELLIGENCE"
      subtitle="Simulated analysis over the active investigation. Every prediction carries its reasoning and awaits your verdict."
      actions={
        <>
          <button
            onClick={() => actions.runAI()}
            disabled={state.ai.running}
            className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-3 py-1.5 text-[9px] text-system transition-colors hover:bg-system/20 disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {state.ai.running ? 'Analyzing…' : 'Run analysis'}
          </button>
          <button
            onClick={actions.enterPredictionMode}
            className="tech flex items-center gap-1.5 border border-line px-3 py-1.5 text-[9px] text-steel-400 transition-colors hover:border-system-line hover:text-system"
          >
            <GitBranch className="h-3 w-3" /> Show on graph
          </button>
        </>
      }
    >
      {/* Findings */}
      <div className="mb-4 border border-line bg-panel/60 p-4">
        <p className="tech mb-2 flex items-center gap-1.5 text-[9px] text-steel-600">
          <Radar className="h-3 w-3" /> Engine findings
        </p>
        {state.ai.running && (
          <div className="space-y-1.5">
            {state.ai.stages.map((s) => (
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
        {!state.ai.running && !state.ai.result && (
          <p className="text-[11px] text-steel-500">
            No analysis has been run on this investigation yet. Run the engine to produce findings.
          </p>
        )}
        {!state.ai.running && state.ai.result && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat v={state.ai.result.entityCount} l="Entities" />
              <Stat v={state.ai.result.relationshipCount} l="Relationships" />
              <Stat v={state.ai.result.highRiskCount} l="High risk" tone={RISK_COLOR.CRITICAL} />
              <Stat v={state.ai.result.intermediaries.length} l="Intermediaries" tone="#2FCB86" />
            </div>
            <div className="border-l-2 border-system pl-3">
              <p className="text-[12px] leading-relaxed text-paper">{state.ai.result.insight}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-steel-400">{state.ai.result.unusualPattern}</p>
            </div>
            <p className="tech text-[8px] text-steel-700">Simulated analysis · demo data only</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Link prediction */}
        <div>
          <p className="tech mb-2 flex items-center gap-1.5 text-[9px] text-steel-600">
            <GitBranch className="h-3 w-3" /> Link prediction · {pending.length} awaiting triage
          </p>
          {data.predictions.length === 0 ? (
            <p className="border border-dashed border-edge bg-panel/30 px-4 py-10 text-center text-[11px] text-steel-600">
              No candidate relationships for this investigation.
            </p>
          ) : (
            <div className="space-y-2">
              {[...pending, ...triaged].map((p, i) => {
                const a = data.entities.find((e) => e.id === p.source);
                const b = data.entities.find((e) => e.id === p.target);
                const AIcon = a ? ENTITY_TYPE_META[a.type].icon : Network;
                const BIcon = b ? ENTITY_TYPE_META[b.type].icon : Network;
                const done = p.verdict !== 'PENDING';
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border p-3.5 ${done ? 'border-line bg-panel/40 opacity-70' : 'border-system-line bg-panel/70'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[12px] text-paper">
                          <span className="flex items-center gap-1.5">
                            <AIcon className="h-3.5 w-3.5" style={{ color: a ? RISK_COLOR[a.riskLevel] : '#6B7687' }} />
                            {a?.name}
                          </span>
                          <span className="text-steel-600">↔</span>
                          <span className="flex items-center gap-1.5">
                            <BIcon className="h-3.5 w-3.5" style={{ color: b ? RISK_COLOR[b.riskLevel] : '#6B7687' }} />
                            {b?.name}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-0.5">
                          {p.reasons.map((r) => (
                            <li key={r} className="flex gap-1.5 text-[10px] leading-snug text-steel-500">
                              <span className="text-steel-700">·</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-2xl font-bold text-system">{p.confidence}%</p>
                        <p className="tech text-[8px] text-steel-600">confidence</p>
                      </div>
                    </div>

                    <div className="mt-2 h-1 w-full bg-raise">
                      <motion.div
                        className="h-full bg-system"
                        initial={{ width: 0 }}
                        animate={{ width: `${p.confidence}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </div>

                    {done ? (
                      <p className="tech mt-2.5 text-[9px] text-steel-500">Verdict — {p.verdict}</p>
                    ) : (
                      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                        <Triage tone="verify" onClick={() => actions.judgePrediction(p.id, 'CONFIRMED')}>
                          <Check className="h-3 w-3" /> Confirm
                        </Triage>
                        <Triage
                          tone="warn"
                          onClick={() => {
                            actions.judgePrediction(p.id, 'INVESTIGATING');
                            actions.investigate(p.target);
                          }}
                        >
                          <Search className="h-3 w-3" /> Investigate
                        </Triage>
                        <Triage tone="steel" onClick={() => actions.judgePrediction(p.id, 'DISMISSED')}>
                          <X className="h-3 w-3" /> Dismiss
                        </Triage>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pattern detection */}
        <div>
          <p className="tech mb-2 flex items-center gap-1.5 text-[9px] text-steel-600">
            <ShieldQuestion className="h-3 w-3" /> Pattern detection
          </p>
          <div className="space-y-2">
            <Pattern
              icon={Fingerprint}
              title="Shared infrastructure"
              count={shared.length}
              body="Entities where one piece of infrastructure authenticates or registers more than one identity."
              items={shared.map((e) => e.name)}
              onClick={(idx) => shared[idx] && actions.investigate(shared[idx].id)}
            />
            <Pattern
              icon={Coins}
              title="Suspicious value movement"
              count={suspicious.length}
              body="Relationships flagged for anomalous transfer, routing or movement behaviour."
              items={suspicious.slice(0, 5).map((r) => {
                const a = data.entities.find((e) => e.id === r.source)?.name ?? r.source;
                const b = data.entities.find((e) => e.id === r.target)?.name ?? r.target;
                return `${a} → ${b}`;
              })}
            />
            <Pattern
              icon={Share2}
              title="Network bridges"
              count={bridges.length}
              body="Entities that are the sole path between otherwise separate clusters."
              items={bridges.map((e) => e.name)}
              onClick={(idx) => bridges[idx] && actions.investigate(bridges[idx].id)}
            />
            <Pattern
              icon={GitBranch}
              title="Inferred relationships in graph"
              count={inferred.length}
              body="Links already drawn on the canvas as predicted rather than recorded."
              items={inferred.map((r) => {
                const a = data.entities.find((e) => e.id === r.source)?.name ?? r.source;
                const b = data.entities.find((e) => e.id === r.target)?.name ?? r.target;
                return `${a} ↔ ${b}`;
              })}
            />
          </div>
        </div>
      </div>
    </SectionPage>
  );
}

function Stat({ v, l, tone }: { v: number; l: string; tone?: string }) {
  return (
    <div className="border border-line bg-raise/40 py-2 text-center">
      <p className="font-display text-lg font-bold" style={{ color: tone ?? '#22D3E0' }}>
        {v}
      </p>
      <p className="tech text-[8px] text-steel-600">{l}</p>
    </div>
  );
}

function Triage({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: 'verify' | 'warn' | 'steel';
}) {
  const cls =
    tone === 'verify'
      ? 'border-verify/40 text-verify hover:bg-verify/10'
      : tone === 'warn'
      ? 'border-warn/40 text-warn hover:bg-warn/10'
      : 'border-line text-steel-500 hover:text-paper';
  return (
    <button onClick={onClick} className={`tech flex items-center justify-center gap-1 border px-2 py-1.5 text-[9px] transition-colors ${cls}`}>
      {children}
    </button>
  );
}

function Pattern({
  icon: Icon,
  title,
  count,
  body,
  items,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  body: string;
  items: string[];
  onClick?: (idx: number) => void;
}) {
  return (
    <div className="border border-line bg-panel/60 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-system" />
        <p className="flex-1 text-[12px] font-medium text-paper">{title}</p>
        <span className="font-mono text-[11px] text-system">{count}</span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-steel-600">{body}</p>
      {items.length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border-line/60 pt-2">
          {items.map((t, i) =>
            onClick ? (
              <button
                key={t + i}
                onClick={() => onClick(i)}
                className="block w-full truncate text-left text-[10px] text-steel-400 transition-colors hover:text-system"
              >
                {t}
              </button>
            ) : (
              <p key={t + i} className="truncate text-[10px] text-steel-400">
                {t}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
