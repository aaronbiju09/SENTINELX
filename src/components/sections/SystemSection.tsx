import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, RotateCcw, Network, Brain, Gauge, Search } from 'lucide-react';
import { useActions } from '../../hooks/useActions';
import { SectionPage } from '../shell/SectionPage';
import { PRODUCT_NAME, PRODUCT_TAGLINE, TEAM_NAME, TEAM_MEMBERS, TECH_STACK, SIH_INFO } from '../../data/product';

const SHORTCUTS = [
  { k: '/', d: 'Open search' },
  { k: 'Cmd / Ctrl + K', d: 'Command palette' },
  { k: 'D', d: 'Open Demo Center' },
  { k: 'N', d: 'Open network graph' },
  { k: 'A', d: 'Run AI analysis' },
  { k: 'H', d: 'Trace hidden connections' },
  { k: 'T', d: 'Trace focused entity' },
  { k: 'L', d: 'Toggle timeline' },
  { k: 'R', d: 'Generate report' },
  { k: 'Esc', d: 'Close panel, then return home' },
];

const PITCH = [
  {
    icon: AlertTriangle,
    q: 'The problem',
    a: 'Criminal networks hide in fragmented records. Phones, accounts, wallets, devices and locations each sit in a separate system, so the relationship between them is only visible to an investigator who already knows to look for it.',
  },
  {
    icon: Network,
    q: 'What SENTINELX does',
    a: 'It fuses fragmented investigation data into a single relationship graph, so an entire network — people, organizations, infrastructure and money — can be read at a glance rather than reconstructed by hand.',
  },
  {
    icon: Brain,
    q: 'What makes it different',
    a: 'Graph analytics and link prediction surface relationships that were never recorded anywhere, each with a confidence score and the reasoning behind it, which the investigator then confirms, investigates or dismisses.',
  },
  {
    icon: Gauge,
    q: 'Why it matters',
    a: 'Every risk score is explainable down to its contributing factors, so an investigator can defend a decision rather than just act on a number — and reach the hidden connection in minutes instead of weeks.',
  },
];

export function SystemSection() {
  const { resetAll } = useActions();
  const [confirm, setConfirm] = useState(false);

  return (
    <SectionPage title="SYSTEM" subtitle="Project identity, capability summary and workspace controls">
      <div className="space-y-4">
        {/* Identity */}
        <div className="border border-line bg-panel/70 p-5 cut-tr">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="tech text-[9px] text-steel-600">Product</p>
              <h2 className="font-display text-4xl font-bold tracking-[0.1em] text-paper">{PRODUCT_NAME}</h2>
              <p className="mt-1 text-xs text-steel-500">{PRODUCT_TAGLINE}</p>
            </div>
            <div className="text-right">
              <p className="tech text-[9px] text-steel-600">Team</p>
              <p className="font-display text-xl font-bold tracking-tech text-system">{TEAM_NAME}</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 border border-warn/30 bg-warn-dim p-3">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-warn" />
            <p className="text-[11px] leading-relaxed text-steel-400">
              Frontend prototype running entirely on simulated data. Every entity, relationship, transaction and event is
              fictional. The system performs no surveillance, tracking, scraping or collection of real personal data.
            </p>
          </div>
        </div>

        {/* The pitch — communicated by the UI, not a PDF */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {PITCH.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.q}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="border border-line bg-panel/60 p-4"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-system" />
                  <p className="tech text-[9px] text-system">{p.q}</p>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-steel-300">{p.a}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* Submission */}
          <div className="border border-line bg-panel/60 p-4">
            <p className="tech mb-2 border-b border-line pb-1.5 text-[9px] text-steel-600">Submission</p>
            <Row label="Problem ID" value={SIH_INFO.id} />
            <Row label="Title" value={SIH_INFO.title} />
            <Row label="Ministry" value={SIH_INFO.ministry} />
            <Row label="Theme" value={SIH_INFO.theme} />
          </div>

          {/* Team members — placeholders to fill in */}
          <div className="border border-line bg-panel/60 p-4">
            <p className="tech mb-2 border-b border-line pb-1.5 text-[9px] text-steel-600">Team members</p>
            <div className="grid grid-cols-1 gap-1.5">
              {TEAM_MEMBERS.map((m, i) => (
                <div key={i} className="border border-dashed border-edge px-2 py-1.5">
                  <p className="truncate text-[11px] text-steel-400">{m.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div className="border border-line bg-panel/60 p-4">
            <p className="tech mb-2 border-b border-line pb-1.5 text-[9px] text-steel-600">Technology</p>
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map((t) => (
                <span key={t} className="border border-line px-2 py-1 text-[10px] text-steel-400">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Shortcuts + reset */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="border border-line bg-panel/60 p-4">
            <p className="tech mb-2 flex items-center gap-1.5 border-b border-line pb-1.5 text-[9px] text-steel-600">
              <Search className="h-3 w-3" /> Keyboard shortcuts
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {SHORTCUTS.map((s) => (
                <div key={s.k} className="flex items-center justify-between gap-2 border-b border-line/40 py-1 last:border-0">
                  <span className="text-[11px] text-steel-400">{s.d}</span>
                  <kbd className="border border-line px-1.5 py-0.5 font-mono text-[9px] text-steel-500">{s.k}</kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-line bg-panel/60 p-4">
            <p className="tech mb-2 border-b border-line pb-1.5 text-[9px] text-steel-600">Workspace</p>
            <p className="mb-3 text-[11px] leading-relaxed text-steel-500">
              Restore the sample data — flags, case assignments, alert states and prediction verdicts — and remove
              investigations created in this session. Useful between presentations.
            </p>
            {confirm ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    resetAll();
                    setConfirm(false);
                  }}
                  className="tech flex items-center gap-1.5 border border-crit/50 bg-crit-dim px-2.5 py-1.5 text-[9px] text-crit"
                >
                  <Check className="h-3 w-3" /> Confirm
                </button>
                <button onClick={() => setConfirm(false)} className="tech border border-line px-2.5 py-1.5 text-[9px] text-steel-500">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(true)}
                className="tech flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] text-steel-400 transition-colors hover:border-edge hover:text-paper"
              >
                <RotateCcw className="h-3 w-3" /> Reset workspace
              </button>
            )}
          </div>
        </div>
      </div>
    </SectionPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line/40 py-1.5 last:border-0">
      <span className="tech shrink-0 text-[8px] text-steel-700">{label}</span>
      <span className="text-right text-[11px] text-steel-300">{value}</span>
    </div>
  );
}
