import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Download, FileText, Printer, Sparkles } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset, useActiveInvestigation } from '../../hooks/useDataset';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { runAnalysis } from '../../utils/aiAnalysis';
import { buildReportText, downloadTextFile } from '../../utils/report';
import { formatDate, RISK_COLOR } from '../../utils/entityMeta';
import { PRODUCT_NAME, TEAM_NAME, SIH_INFO } from '../../data/product';

const STEPS = ['Collecting case data', 'Analyzing network', 'Compiling evidence', 'Generating intelligence summary'];

export function ReportSection() {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();
  const investigation = useActiveInvestigation();
  const [caseId, setCaseId] = useState<string | null>(state.activeCaseId);
  const [step, setStep] = useState(0);

  const caseFile = data.cases.find((c) => c.id === caseId) ?? data.cases[0] ?? null;

  const caseEntities = useMemo(
    () => (caseFile ? data.entities.filter((e) => caseFile.entityIds.includes(e.id)) : []),
    [data.entities, caseFile]
  );
  const caseRels = useMemo(
    () =>
      caseFile
        ? data.relationships.filter((r) => caseFile.entityIds.includes(r.source) && caseFile.entityIds.includes(r.target))
        : [],
    [caseFile, data.relationships]
  );
  const analysis = useMemo(() => runAnalysis(caseEntities, caseRels), [caseEntities, caseRels]);
  const evidence = caseFile ? data.evidence.filter((e) => e.caseId === caseFile.id) : [];
  const events = caseFile
    ? data.timeline.filter((t) => t.caseId === caseFile.id).sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const highRisk = caseEntities.filter((e) => e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH').sort((a, b) => b.riskScore - a.riskScore);

  // Drive the compile animation while the store reports generating.
  useEffect(() => {
    if (!state.reportGenerating) return;
    setStep(0);
    const timers = STEPS.map((_, i) => setTimeout(() => setStep(i + 1), 550 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [state.reportGenerating]);

  function download() {
    if (!caseFile) return;
    const text = buildReportText(caseFile, caseEntities, caseRels, data.timeline, analysis);
    downloadTextFile(`${caseFile.code}-intelligence-report.txt`, text);
  }

  return (
    <SectionPage
      title="INTELLIGENCE REPORT"
      subtitle="Compiled from live case data"
      actions={
        state.reportReady ? (
          <>
            <HeaderBtn icon={Printer} label="Print" onClick={() => window.print()} />
            <HeaderBtn icon={Download} label="Download" onClick={download} />
          </>
        ) : null
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 no-print">
        {data.cases.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCaseId(c.id);
              actions.generateReport();
            }}
            className={`tech border px-2.5 py-1.5 text-[9px] transition-colors ${
              c.id === caseFile?.id ? 'border-system-line bg-system-dim text-system' : 'border-line text-steel-500 hover:text-paper'
            }`}
          >
            {c.code}
          </button>
        ))}
        {!state.reportGenerating && !state.reportReady && (
          <button
            onClick={actions.generateReport}
            className="tech ml-auto flex items-center gap-1.5 border border-system-line bg-system-dim px-3 py-1.5 text-[9px] text-system transition-colors hover:bg-system/20"
          >
            <FileText className="h-3 w-3" />
            Compile report
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {state.reportGenerating && (
          <motion.div
            key="compiling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-24"
          >
            <div className="relative h-16 w-16">
              <motion.div
                className="absolute inset-0 border border-system-line"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 border border-system/50"
                animate={{ rotate: -360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
              <FileText className="absolute inset-0 m-auto h-5 w-5 text-system" />
            </div>
            <div className="w-64 space-y-1.5">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${
                      step > i ? 'border-system bg-system-dim' : 'border-steel-700'
                    }`}
                  >
                    {step > i && <Check className="h-2 w-2 text-system" strokeWidth={3} />}
                  </span>
                  <span className={`font-mono text-[10px] ${step > i ? 'text-steel-400' : 'text-steel-700'}`}>
                    {s.toUpperCase()}
                    {step === i && <span className="animate-caret-blink">_</span>}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!state.reportGenerating && !state.reportReady && (
          <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center text-sm text-steel-600">
            Select a case and compile to preview the intelligence report.
          </motion.p>
        )}

        {state.reportReady && (
          <motion.div
            key="report"
            id="print-report"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 border border-line bg-panel/80 p-6"
          >
            <div className="border-b border-line pb-4">
              <p className="tech text-[9px] text-system">{PRODUCT_NAME} · Intelligence Report</p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-wide text-paper">
                {caseFile.code} — {caseFile.name}
              </h2>
              <p className="tech mt-1 text-[9px] text-warn">
                Simulated / demo data · Team {TEAM_NAME} · {SIH_INFO.id}
              </p>
            </div>

            <Sec title="Case information">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Status" value={caseFile.status} />
                <Field label="Priority" value={caseFile.priority} />
                <Field label="Threat" value={caseFile.threatLevel} tone={RISK_COLOR[caseFile.threatLevel]} />
                <Field label="Lead analyst" value={caseFile.leadAnalyst} />
              </div>
            </Sec>

            <Sec title="Investigation summary">
              <p className="text-[12px] leading-relaxed text-steel-300">{caseFile.summary}</p>
            </Sec>

            <Sec title="Network statistics">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Entities" value={String(analysis.entityCount)} />
                <Field label="Relationships" value={String(analysis.relationshipCount)} />
                <Field label="High risk" value={String(analysis.highRiskCount)} />
                <Field label="Intermediaries" value={String(analysis.intermediaries.length)} />
              </div>
            </Sec>

            <Sec title="Risk assessment">
              {highRisk.length === 0 ? (
                <p className="text-[12px] text-steel-500">No high-risk entities attached to this case.</p>
              ) : (
                <div className="space-y-1">
                  {highRisk.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 border-b border-line/50 pb-1 last:border-0">
                      <span className="flex-1 truncate text-[12px] text-steel-300">{e.name}</span>
                      <span className="h-1 w-20 bg-raise">
                        <span className="block h-full" style={{ width: `${e.riskScore}%`, backgroundColor: RISK_COLOR[e.riskLevel] }} />
                      </span>
                      <span className="w-8 text-right font-mono text-[11px]" style={{ color: RISK_COLOR[e.riskLevel] }}>
                        {e.riskScore}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Sec>

            <Sec title="Key entities">
              <div className="flex flex-wrap gap-1.5">
                {caseEntities.slice(0, 14).map((e) => (
                  <span key={e.id} className="border border-line px-2 py-1 text-[11px] text-steel-300">
                    {e.name}
                  </span>
                ))}
              </div>
            </Sec>

            <Sec title={`Evidence · ${evidence.length} items`}>
              <div className="space-y-1">
                {evidence.map((ev) => (
                  <p key={ev.id} className="text-[12px] text-steel-400">
                    <span className="tech mr-2 text-[9px] text-system">{ev.ref}</span>
                    {ev.title}
                    <span className="tech ml-2 text-[9px] text-steel-700">{ev.integrity}</span>
                  </p>
                ))}
                {evidence.length === 0 && <p className="text-[12px] text-steel-500">No evidence logged for this case.</p>}
              </div>
            </Sec>

            <Sec title="Timeline">
              <div className="space-y-0.5">
                {events.map((t) => (
                  <p key={t.id} className="text-[12px] text-steel-400">
                    <span className="tech mr-2 text-[9px] text-steel-600">{formatDate(t.date)}</span>
                    {t.title}
                  </p>
                ))}
              </div>
            </Sec>

            <Sec title="Key findings">
              <div className="flex gap-2 border-l-2 border-system pl-3">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-system" />
                <div className="space-y-1.5">
                  <p className="text-[12px] leading-relaxed text-steel-300">{analysis.insight}</p>
                  <p className="text-[12px] leading-relaxed text-steel-400">{analysis.unusualPattern}</p>
                  <p className="tech text-[9px] text-steel-700">Simulated AI analysis · demo data only</p>
                </div>
              </div>
            </Sec>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionPage>
  );
}

function HeaderBtn({ icon: Icon, label, onClick }: { icon: typeof Printer; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tech flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] text-steel-500 transition-colors hover:border-system-line hover:text-system"
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="tech mb-2 text-[9px] text-steel-600">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="tech text-[8px] text-steel-700">{label}</p>
      <p className="text-[12px]" style={{ color: tone ?? '#CBD3DE' }}>
        {value}
      </p>
    </div>
  );
}
