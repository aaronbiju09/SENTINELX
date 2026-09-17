import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crosshair,
  Radar,
  History,
  FolderPlus,
  Flag,
  Sparkles,
  FileText,
  ChevronRight,
  ShieldAlert,
  Route,
} from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { RiskDial, RiskBreakdown } from './RiskDial';
import {
  ENTITY_TYPE_META,
  RELATIONSHIP_TYPE_LABEL,
  RISK_COLOR,
  EVIDENCE_KIND_LABEL,
  formatDateShort,
} from '../../utils/entityMeta';
import { explainRisk } from '../../utils/riskFactors';

type Tab = 'intel' | 'risk' | 'links' | 'evidence';

const TABS: { id: Tab; label: string }[] = [
  { id: 'intel', label: 'Intel' },
  { id: 'risk', label: 'Risk' },
  { id: 'links', label: 'Links' },
  { id: 'evidence', label: 'Evidence' },
];

export function EntityIntelligence() {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();
  const tab = state.intelTab;
  const setTab = actions.setIntelTab;

  const entity = data.entities.find((e) => e.id === state.focusId);

  const connections = useMemo(() => {
    if (!entity) return [];
    return data.relationships.filter((r) => r.source === entity.id || r.target === entity.id).map((r) => {
      const otherId = r.source === entity.id ? r.target : r.source;
      const other = data.entities.find((e) => e.id === otherId);
      const outbound = r.source === entity.id;
      return { rel: r, other, outbound };
    });
  }, [entity, data.relationships, data.entities]);

  const evidence = useMemo(
    () => (entity ? data.evidence.filter((ev) => ev.entityIds.includes(entity.id)) : []),
    [entity, data.evidence]
  );

  const events = useMemo(
    () => (entity ? data.timeline.filter((t) => t.entityIds.includes(entity.id)) : []),
    [entity, data.timeline]
  );

  if (!entity) return null;

  const meta = ENTITY_TYPE_META[entity.type];
  const Icon = meta.icon;
  const color = RISK_COLOR[entity.riskLevel];
  const factors = explainRisk(entity, connections.length);
  const entityCases = data.cases.filter((c) => entity.caseIds.includes(c.id));
  // The highest-scoring entity in THIS investigation, not a hardcoded id.
  const primarySubject = [...data.entities].sort((a, b) => b.riskScore - a.riskScore)[0] ?? null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="pointer-events-auto absolute right-3 top-16 bottom-24 z-30 flex w-[22rem] flex-col border border-line bg-panel/92 backdrop-blur-md cut-tr"
    >
      {/* Identity */}
      <div className="border-b border-line p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border" style={{ borderColor: `${color}55`, backgroundColor: `${color}12` }}>
            <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate font-display text-base font-semibold text-paper">{entity.name}</h2>
              {entity.flagged && <Flag className="h-3 w-3 shrink-0 fill-crit text-crit" />}
            </div>
            <p className="tech mt-0.5 text-[9px] text-steel-600">
              {meta.short} · {entity.id.toUpperCase()} · {entity.status}
            </p>
          </div>
          <button onClick={() => actions.focus(null)} className="shrink-0 text-steel-600 hover:text-paper" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {entity.aliases.length > 0 && (
          <p className="mt-2 text-[11px] text-steel-500">
            <span className="tech text-[9px] text-steel-700">AKA </span>
            {entity.aliases.join(' · ')}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`tech relative flex-1 py-2 text-[9px] transition-colors ${
              tab === t.id ? 'text-system' : 'text-steel-600 hover:text-steel-400'
            }`}
          >
            {t.label}
            {tab === t.id && <motion.span layoutId="tabline" className="absolute inset-x-0 bottom-0 h-px bg-system" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {tab === 'intel' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <RiskDial score={entity.riskScore} level={entity.riskLevel} size={120} />
                </div>
                <Section label="Assessment">
                  <p className="text-[11px] leading-relaxed text-steel-300">{entity.summary}</p>
                </Section>
                <Section label="Analyst notes">
                  <p className="text-[11px] leading-relaxed text-steel-500">{entity.notes}</p>
                </Section>
                {entity.meta && (
                  <Section label="Identifiers">
                    <div className="space-y-1">
                      {Object.entries(entity.meta).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 border-b border-line/60 pb-1">
                          <span className="tech text-[9px] text-steel-600">{k}</span>
                          <span className="truncate font-mono text-[10px] text-steel-300">{v}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
                {entityCases.length > 0 && (
                  <Section label="Case association">
                    <div className="flex flex-wrap gap-1.5">
                      {entityCases.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => actions.setCase(c.id)}
                          className="tech border border-line px-2 py-1 text-[9px] text-steel-400 transition-colors hover:border-system-line hover:text-system"
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}

            {tab === 'risk' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border border-line bg-raise/50 p-3">
                  <ShieldAlert className="h-4 w-4 shrink-0" style={{ color }} />
                  <p className="text-[11px] leading-snug text-steel-400">
                    Score of <span className="font-mono" style={{ color }}>{entity.riskScore}</span> derived from{' '}
                    {factors.length} contributing factor{factors.length === 1 ? '' : 's'}.
                  </p>
                </div>
                <RiskBreakdown factors={factors} />
              </div>
            )}

            {tab === 'links' && (
              <div className="space-y-1.5">
                {primarySubject && entity.id !== primarySubject.id && (
                  <button
                    onClick={() => actions.findHiddenConnection(entity.id, primarySubject.id)}
                    className="tech mb-2 flex w-full items-center justify-center gap-1.5 border border-system-line bg-system-dim px-2 py-2 text-[9px] text-system transition-colors hover:bg-system/20"
                  >
                    <Route className="h-3 w-3" />
                    Path to highest-risk entity
                  </button>
                )}
                {connections.length === 0 && <Empty text="No recorded relationships." />}
                {connections.map(({ rel, other, outbound }) => {
                  if (!other) return null;
                  const oMeta = ENTITY_TYPE_META[other.type];
                  const OIcon = oMeta.icon;
                  return (
                    <button
                      key={rel.id}
                      onClick={() => actions.investigate(other.id)}
                      className="group flex w-full items-center gap-2.5 border border-line/70 bg-raise/40 p-2 text-left transition-colors hover:border-system-line"
                    >
                      <OIcon className="h-3.5 w-3.5 shrink-0" style={{ color: RISK_COLOR[other.riskLevel] }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] text-paper">{other.name}</span>
                        <span className="tech block truncate text-[9px] text-steel-600">
                          {outbound ? '' : '← '}
                          {RELATIONSHIP_TYPE_LABEL[rel.type]}
                          {rel.inferred ? ' · predicted' : ''}
                        </span>
                      </span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-steel-700 group-hover:text-system" />
                    </button>
                  );
                })}
              </div>
            )}

            {tab === 'evidence' && (
              <div className="space-y-2">
                {evidence.length === 0 && <Empty text="No evidence linked to this entity." />}
                {evidence.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => actions.openEvidence(ev.id)}
                    className="group w-full border border-line/70 bg-raise/40 p-2.5 text-left transition-colors hover:border-system-line"
                  >
                    <div className="flex items-center justify-between">
                      <span className="tech text-[9px] text-system">{ev.ref}</span>
                      <span className={`tech text-[8px] ${ev.integrity === 'VERIFIED' ? 'text-verify' : 'text-warn'}`}>
                        {ev.integrity}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-paper">{ev.title}</p>
                    <p className="tech mt-1 text-[9px] text-steel-600">{EVIDENCE_KIND_LABEL[ev.kind]}</p>
                  </button>
                ))}
                {events.length > 0 && (
                  <div className="pt-2">
                    <p className="tech mb-1.5 text-[9px] text-steel-700">Timeline appearances</p>
                    {events.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          actions.setSpotlight(t.entityIds);
                          actions.toggleTimeline(true);
                        }}
                        className="flex w-full gap-2 py-1 text-left"
                      >
                        <span className="tech shrink-0 text-[9px] text-steel-600">{formatDateShort(t.date)}</span>
                        <span className="truncate text-[10px] text-steel-400 hover:text-paper">{t.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions — all functional */}
      <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
        <Act icon={Crosshair} label="Trace" onClick={() => actions.traceFrom(entity.id)} />
        <Act icon={Radar} label="Expand" onClick={() => actions.expandFrom(entity.id)} />
        <Act icon={Sparkles} label="Analyze" onClick={() => actions.runAI()} />
        <Act icon={History} label="Timeline" onClick={() => { actions.setSpotlight(events.flatMap((e) => e.entityIds)); actions.toggleTimeline(true); }} />
        <Act icon={FolderPlus} label="To case" onClick={() => actions.addToCase(entity.id)} />
        <Act icon={Flag} label={entity.flagged ? 'Unflag' : 'Flag'} onClick={() => actions.toggleFlag(entity.id)} active={entity.flagged} />
      </div>
      <button
        onClick={actions.generateReport}
        className="tech flex items-center justify-center gap-1.5 border-t border-line bg-raise/60 py-2.5 text-[9px] text-steel-400 transition-colors hover:bg-system-dim hover:text-system"
      >
        <FileText className="h-3 w-3" />
        Generate intelligence report
      </button>
    </motion.aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="tech mb-1.5 text-[9px] text-steel-700">{label}</p>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-[11px] text-steel-600">{text}</p>;
}

function Act({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Crosshair;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`tech flex flex-col items-center gap-1 bg-panel py-2.5 text-[8px] transition-colors ${
        active ? 'text-crit' : 'text-steel-500 hover:bg-raise hover:text-paper'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.button>
  );
}
