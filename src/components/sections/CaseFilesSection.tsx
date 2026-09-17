import { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, History, FileText, Users, Link2, ShieldAlert, Archive, UserCheck } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { ENTITY_TYPE_META, RISK_COLOR, formatDate, formatDateShort } from '../../utils/entityMeta';

export function CaseFilesSection() {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();
  const [openId, setOpenId] = useState<string | null>(state.activeCaseId);

  const caseFile = data.cases.find((c) => c.id === openId) ?? data.cases[0] ?? null;
  const entities = caseFile ? data.entities.filter((e) => e.caseIds.includes(caseFile.id)) : [];
  const rels = caseFile
    ? data.relationships.filter((r) => caseFile.entityIds.includes(r.source) && caseFile.entityIds.includes(r.target))
    : [];
  const evidence = caseFile ? data.evidence.filter((e) => e.caseId === caseFile.id) : [];
  const events = caseFile
    ? data.timeline.filter((t) => t.caseId === caseFile.id).sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const suspects = entities.filter((e) => e.type === 'PERSON').sort((a, b) => b.riskScore - a.riskScore);
  const highRisk = entities.filter((e) => e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH');
  const alerts = caseFile
    ? data.alerts.filter((a) => a.caseId === caseFile.id || entities.some((e) => e.id === a.entityId))
    : [];

  if (!caseFile) {
    return (
      <SectionPage title="CASE FILES" subtitle="Digital investigation dossiers">
        <EmptyState
          icon={Archive}
          title="No case files"
          body="This investigation has no case files yet. The bundled sample investigation contains three."
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
    <SectionPage title="CASE FILES" subtitle="Digital investigation dossiers">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[210px_1fr]">
        {/* File spine */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin lg:flex-col lg:overflow-visible">
          {data.cases.map((c) => {
            const active = c.id === caseFile.id;
            return (
              <button
                key={c.id}
                onClick={() => setOpenId(c.id)}
                className={`relative min-w-[180px] shrink-0 border p-3 text-left transition-colors cut-tr ${
                  active ? 'border-system-line bg-system-dim' : 'border-line bg-panel/60 hover:border-edge'
                }`}
              >
                {active && <span className="absolute inset-y-0 left-0 w-[2px] bg-system" />}
                <p className="tech text-[9px] text-steel-600">{c.code}</p>
                <p className="mt-0.5 font-display text-[13px] font-semibold text-paper">{c.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="tech text-[8px]" style={{ color: RISK_COLOR[c.threatLevel] }}>
                    {c.threatLevel}
                  </span>
                  <span className="tech text-[8px] text-steel-600">{c.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dossier */}
        <motion.div key={caseFile.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 space-y-4">
          <div className="border border-line bg-panel/70 p-4 cut-tr">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="tech text-[9px] text-steel-600">{caseFile.code}</p>
                <h2 className="font-display text-xl font-bold tracking-wide text-paper">{caseFile.name.toUpperCase()}</h2>
                <p className="mt-1.5 max-w-lg text-[11px] leading-relaxed text-steel-400">{caseFile.summary}</p>
              </div>
              <div className="text-right">
                <p className="tech text-[8px] text-steel-700">Threat level</p>
                <p className="font-display text-lg font-bold" style={{ color: RISK_COLOR[caseFile.threatLevel] }}>
                  {caseFile.threatLevel}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-2.5">
              <Meta icon={UserCheck} label="Lead" value={caseFile.leadAnalyst} />
              <Meta icon={History} label="Opened" value={formatDate(caseFile.openedDate)} />
              <Meta icon={Archive} label="Status" value={caseFile.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Stat icon={Users} value={entities.length} label="Entities" />
              <Stat icon={Link2} value={rels.length} label="Relations" />
              <Stat icon={ShieldAlert} value={highRisk.length} label="High risk" tone={RISK_COLOR.CRITICAL} />
              <Stat icon={Archive} value={evidence.length} label="Evidence" />
              <Stat icon={History} value={events.length} label="Events" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              <Act icon={Network} label="Open network" onClick={() => { actions.setCase(caseFile.id); actions.setSection('network'); }} />
              <Act
                icon={History}
                label="View timeline"
                onClick={() => {
                  actions.setCase(caseFile.id);
                  actions.setSection('network');
                  actions.toggleTimeline(true);
                }}
              />
              <Act icon={Archive} label="Evidence" onClick={() => actions.setSection('evidence')} />
              <Act icon={FileText} label="Generate report" onClick={actions.generateReport} primary />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Panel title={`Suspects · ${suspects.length}`}>
              {suspects.length === 0 && <Empty text="No persons attached to this file." />}
              {suspects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => actions.investigate(s.id)}
                  className="flex w-full items-center gap-2 border-b border-line/50 py-1.5 text-left last:border-0 hover:bg-raise/50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RISK_COLOR[s.riskLevel] }} />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-paper">{s.name}</span>
                  <span className="font-mono text-[10px]" style={{ color: RISK_COLOR[s.riskLevel] }}>
                    {s.riskScore}
                  </span>
                </button>
              ))}
            </Panel>

            <Panel title={`Evidence · ${evidence.length}`}>
              {evidence.length === 0 && <Empty text="No evidence logged." />}
              {evidence.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => actions.openEvidence(ev.id)}
                  className="flex w-full items-center gap-2 border-b border-line/50 py-1.5 text-left last:border-0 hover:bg-raise/50"
                >
                  <span className="tech shrink-0 text-[9px] text-system">{ev.ref}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-steel-300">{ev.title}</span>
                </button>
              ))}
            </Panel>

            <Panel title={`Alerts · ${alerts.length}`}>
              {alerts.length === 0 && <Empty text="No alerts raised." />}
              {alerts.slice(0, 6).map((a) => (
                <button
                  key={a.id}
                  onClick={() => actions.goToAlert(a)}
                  className="flex w-full items-center gap-2 border-b border-line/50 py-1.5 text-left last:border-0 hover:bg-raise/50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RISK_COLOR[a.severity] }} />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-steel-300">{a.title}</span>
                </button>
              ))}
            </Panel>

            <Panel title={`Timeline · ${events.length}`}>
              {events.length === 0 && <Empty text="No events recorded." />}
              {events.slice(0, 6).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    actions.setCase(caseFile.id);
                    actions.setSection('network');
                    actions.toggleTimeline(true);
                  }}
                  className="flex w-full items-center gap-2 border-b border-line/50 py-1.5 text-left last:border-0 hover:bg-raise/50"
                >
                  <span className="tech shrink-0 text-[8px] text-steel-600">{formatDateShort(t.date)}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-steel-300">{t.title}</span>
                </button>
              ))}
            </Panel>
          </div>

          <Panel title="Connected entities">
            <div className="flex flex-wrap gap-1.5 pt-1">
              {entities.map((e) => {
                const Icon = ENTITY_TYPE_META[e.type].icon;
                return (
                  <button
                    key={e.id}
                    onClick={() => actions.investigate(e.id)}
                    className="flex items-center gap-1.5 border border-line px-2 py-1 text-[10px] text-steel-400 transition-colors hover:border-system-line hover:text-paper"
                  >
                    <Icon className="h-3 w-3" style={{ color: RISK_COLOR[e.riskLevel] }} />
                    {e.name}
                  </button>
                );
              })}
            </div>
          </Panel>
        </motion.div>
      </div>
    </SectionPage>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-steel-700" />
      <span className="tech text-[8px] text-steel-700">{label}</span>
      <span className="text-[11px] text-steel-300">{value}</span>
    </span>
  );
}

function Stat({ icon: Icon, value, label, tone }: { icon: typeof Users; value: number; label: string; tone?: string }) {
  return (
    <div className="border border-line bg-raise/40 p-2 text-center">
      <Icon className="mx-auto mb-1 h-3 w-3" style={{ color: tone ?? '#525C6D' }} />
      <p className="font-display text-base font-bold" style={{ color: tone ?? '#E9EDF4' }}>
        {value}
      </p>
      <p className="tech text-[8px] text-steel-600">{label}</p>
    </div>
  );
}

function Act({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: typeof Network;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`tech flex items-center justify-center gap-1.5 border px-2 py-2 text-[9px] transition-colors ${
        primary
          ? 'border-system-line bg-system-dim text-system hover:bg-system/20'
          : 'border-line text-steel-400 hover:border-edge hover:text-paper'
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </motion.button>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-panel/60 p-3">
      <p className="tech mb-1.5 border-b border-line pb-1.5 text-[9px] text-steel-600">{title}</p>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-center text-[11px] text-steel-700">{text}</p>;
}
