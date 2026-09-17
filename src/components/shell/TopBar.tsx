import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, PlayCircle, Plus, HelpCircle, Check, FolderOpen } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useActiveInvestigation, useDataset } from '../../hooks/useDataset';
import { PRODUCT_NAME } from '../../data/product';
import { RISK_COLOR } from '../../utils/entityMeta';

export function TopBar({ onNewInvestigation }: { onNewInvestigation: () => void }) {
  const state = useAppState();
  const actions = useActions();
  const investigation = useActiveInvestigation();
  const data = useDataset();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const unread = data.alerts.filter((a) => !a.read).length;
  const open = state.investigations.filter((i) => i.status !== 'ARCHIVED');

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-carbon px-3">
      {/* Brand */}
      <button
        onClick={() => actions.setSection('home')}
        title="SENTINELX home"
        className="flex shrink-0 items-center gap-2 pr-1"
      >
        <span className="flex h-7 w-7 items-center justify-center border border-system-line bg-system-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-system" />
        </span>
        <span className="hidden font-display text-sm font-bold tracking-[0.18em] text-paper sm:block">
          {PRODUCT_NAME}
        </span>
      </button>

      <span className="hidden h-6 w-px bg-line sm:block" />

      {/* Investigation switcher */}
      <div className="relative shrink-0">
        <button
          onClick={() => setSwitcherOpen((v) => !v)}
          title="Switch investigation"
          className="flex max-w-[15rem] items-center gap-2 border border-line bg-panel px-2.5 py-1.5 text-left transition-colors hover:border-edge"
        >
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-steel-500" />
          <span className="min-w-0">
            <span className="tech block text-[8px] text-steel-600">Investigation</span>
            <span className="block truncate text-[11px] text-paper">
              {investigation ? investigation.name : 'None open'}
            </span>
          </span>
          <ChevronDown className={`h-3 w-3 shrink-0 text-steel-600 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {switcherOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSwitcherOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 top-[calc(100%+6px)] z-20 w-72 border border-edge bg-panel shadow-2xl shadow-black/60"
              >
                <p className="tech border-b border-line px-3 py-2 text-[8px] text-steel-600">Open investigation</p>
                {open.length === 0 && (
                  <p className="px-3 py-4 text-[11px] text-steel-600">No investigations yet.</p>
                )}
                {open.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      actions.openInvestigation(inv.id, state.section === 'home' ? 'home' : state.section);
                      setSwitcherOpen(false);
                    }}
                    className="flex w-full items-start gap-2 border-b border-line/50 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-raise"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RISK_COLOR[inv.priority === 'HIGH' ? 'CRITICAL' : inv.priority === 'MEDIUM' ? 'MEDIUM' : 'LOW'] }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-paper">{inv.name}</span>
                      <span className="tech block text-[8px] text-steel-600">
                        {inv.source === 'SAMPLE' ? 'Sample data' : 'User created'} · {inv.entityIds.length} entities
                      </span>
                    </span>
                    {inv.id === state.activeInvestigationId && <Check className="mt-0.5 h-3 w-3 shrink-0 text-system" />}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSwitcherOpen(false);
                    onNewInvestigation();
                  }}
                  className="tech flex w-full items-center gap-2 border-t border-line px-3 py-2.5 text-[9px] text-system transition-colors hover:bg-system-dim"
                >
                  <Plus className="h-3 w-3" /> New investigation
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Global search */}
      <button
        onClick={() => actions.togglePalette(true)}
        title="Search entities, cases and commands (/ or Ctrl+K)"
        className="group flex min-w-0 flex-1 items-center gap-2 border border-line bg-panel px-3 py-1.5 text-left transition-colors hover:border-system-line"
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-steel-600 group-hover:text-system" />
        <span className="truncate text-[11px] text-steel-600">
          Search entities, phones, wallets, cases — or run a command
        </span>
        <kbd className="ml-auto hidden shrink-0 border border-line px-1.5 py-0.5 font-mono text-[9px] text-steel-600 sm:block">
          Ctrl K
        </kbd>
      </button>

      {/* Actions */}
      <button
        onClick={onNewInvestigation}
        title="Create a new investigation"
        className="tech hidden shrink-0 items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] text-steel-400 transition-colors hover:border-edge hover:text-paper lg:flex"
      >
        <Plus className="h-3 w-3" /> New
      </button>

      <button
        onClick={() => actions.setSection('demo')}
        title="Open the Demo Center"
        className="tech flex shrink-0 items-center gap-1.5 border border-system-line bg-system-dim px-3 py-1.5 text-[9px] text-system transition-colors hover:bg-system/20"
      >
        <PlayCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Demo Center</span>
      </button>

      <button
        onClick={() => actions.setOnboarding(true)}
        title="How to use SENTINELX"
        className="shrink-0 text-steel-600 transition-colors hover:text-paper"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {unread > 0 && (
        <button
          onClick={() => actions.setSection('alerts')}
          title={`${unread} unread alerts`}
          className="tech shrink-0 border border-warn/40 bg-warn-dim px-2 py-1 text-[9px] text-warn"
        >
          {unread}
        </button>
      )}
    </header>
  );
}
