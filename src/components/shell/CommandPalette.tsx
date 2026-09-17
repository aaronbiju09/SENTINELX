import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Network,
  Sparkles,
  Gauge,
  Briefcase,
  Archive,
  Bell,
  FileText,
  Users,
  Settings2,
  PlayCircle,
  Plus,
  GitBranch,
  Crosshair,
  Route,
  CornerDownLeft,
  History,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { ENTITY_TYPE_META, RISK_COLOR } from '../../utils/entityMeta';

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  run: () => void;
}

export function CommandPalette({ onNewInvestigation }: { onNewInvestigation?: () => void }) {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!state.paletteOpen) setQuery('');
    setActive(0);
  }, [state.paletteOpen]);
  useEffect(() => setActive(0), [query]);

  const primarySubject = useMemo(
    () => [...data.entities].sort((a, b) => b.riskScore - a.riskScore)[0] ?? null,
    [data.entities]
  );

  const commands = useMemo<Cmd[]>(() => {
    const list: Cmd[] = [
      { id: 'home', group: 'Go to', label: 'Home workspace', icon: LayoutDashboard, run: () => actions.setSection('home') },
      { id: 'inv', group: 'Go to', label: 'Investigations', icon: FolderKanban, run: () => actions.setSection('investigations') },
      { id: 'net', group: 'Go to', label: 'Network graph', icon: Network, run: () => actions.setSection('network') },
      { id: 'ai', group: 'Go to', label: 'AI intelligence', icon: Sparkles, run: () => actions.setSection('intelligence') },
      { id: 'risk', group: 'Go to', label: 'Risk analysis', icon: Gauge, run: () => actions.setSection('risk') },
      { id: 'reg', group: 'Go to', label: 'Entity registry', icon: Users, run: () => actions.setSection('registry') },
      { id: 'cases', group: 'Go to', label: 'Case files', icon: Briefcase, run: () => actions.setSection('cases') },
      { id: 'ev', group: 'Go to', label: 'Evidence vault', icon: Archive, run: () => actions.setSection('evidence') },
      { id: 'alerts', group: 'Go to', label: 'Alerts', icon: Bell, run: () => actions.setSection('alerts') },
      { id: 'reports', group: 'Go to', label: 'Reports', icon: FileText, run: () => actions.setSection('reports') },
      { id: 'sys', group: 'Go to', label: 'System & project info', icon: Settings2, run: () => actions.setSection('system') },
      { id: 'demo', group: 'Demo', label: 'Open Demo Center', hint: 'D', icon: PlayCircle, run: () => actions.setSection('demo') },
      { id: 'demostart', group: 'Demo', label: 'Start Operation Nightfall demo', icon: PlayCircle, run: () => actions.startDemo('nightfall') },
      {
        id: 'newinv',
        group: 'Actions',
        label: 'Create new investigation',
        icon: Plus,
        run: () => (onNewInvestigation ? onNewInvestigation() : actions.setSection('investigations')),
      },
      { id: 'runai', group: 'Actions', label: 'Run AI network analysis', hint: 'A', icon: Sparkles, run: () => actions.runAI() },
      { id: 'pred', group: 'Actions', label: 'Trace hidden connections', hint: 'H', icon: GitBranch, run: actions.enterPredictionMode },
      { id: 'report', group: 'Actions', label: 'Generate intelligence report', hint: 'R', icon: FileText, run: actions.generateReport },
      { id: 'tl', group: 'Actions', label: 'Toggle investigation timeline', hint: 'L', icon: History, run: () => actions.toggleTimeline() },
      {
        id: 'trace',
        group: 'Actions',
        label: state.focusId ? 'Trace connections of focused entity' : 'Trace connections (focus an entity first)',
        hint: 'T',
        icon: Crosshair,
        run: () => (state.focusId ? actions.traceFrom(state.focusId) : actions.pushToast('Focus an entity first', 'info')),
      },
      {
        id: 'path',
        group: 'Actions',
        label: 'Find path from focused entity to the highest-risk entity',
        icon: Route,
        run: () =>
          state.focusId && primarySubject
            ? actions.findHiddenConnection(state.focusId, primarySubject.id)
            : actions.pushToast('Focus an entity first', 'info'),
      },
    ];

    if (state.demo.active) {
      list.unshift({ id: 'exitdemo', group: 'Demo', label: 'Exit demo mode', icon: LogOut, run: actions.exitDemo });
    }

    // Open investigations become commands too, so switching is one search away.
    state.investigations
      .filter((i) => i.status !== 'ARCHIVED')
      .forEach((inv) =>
        list.push({
          id: `open-${inv.id}`,
          group: 'Investigations',
          label: `Open investigation — ${inv.name}`,
          icon: FolderKanban,
          run: () => actions.openInvestigation(inv.id),
        })
      );

    return list;
  }, [actions, state.focusId, state.investigations, state.demo.active, onNewInvestigation, primarySubject]);

  const entityResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return data.entities
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.aliases.some((a) => a.toLowerCase().includes(q)) ||
          ENTITY_TYPE_META[e.type].label.toLowerCase().includes(q) ||
          e.tags.some((t) => t.includes(q)) ||
          Object.values(e.meta ?? {}).some((v) => v.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query, data.entities]);

  const cmdResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.filter((c) => c.group !== 'Investigations').slice(0, 10);
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [commands, query]);

  const total = entityResults.length + cmdResults.length;

  function runAt(i: number) {
    if (i < entityResults.length) actions.investigate(entityResults[i].id);
    else cmdResults[i - entityResults.length]?.run();
    actions.togglePalette(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(active);
    }
  }

  let lastGroup = '';

  return (
    <AnimatePresence>
      {state.paletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[170] flex items-start justify-center bg-void/75 pt-[10vh] backdrop-blur-sm"
          onClick={() => actions.togglePalette(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl border border-edge bg-panel shadow-2xl shadow-black/70 cut-tr"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Search entities, phones, wallets, cases — or run a command"
              className="w-full border-b border-line bg-transparent px-4 py-3.5 text-sm text-paper placeholder:text-steel-600 outline-none"
            />

            <div className="max-h-[56vh] overflow-y-auto scrollbar-thin">
              {total === 0 && <p className="px-4 py-10 text-center text-xs text-steel-600">No matches for “{query}”</p>}

              {entityResults.length > 0 && (
                <div>
                  <p className="tech px-4 pb-1 pt-3 text-[8px] text-steel-700">Entities</p>
                  {entityResults.map((e, i) => {
                    const meta = ENTITY_TYPE_META[e.type];
                    const Icon = meta.icon;
                    const links = data.relationships.filter((r) => r.source === e.id || r.target === e.id).length;
                    const sel = active === i;
                    return (
                      <button
                        key={e.id}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => runAt(i)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${sel ? 'bg-system-dim' : ''}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: RISK_COLOR[e.riskLevel] }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-paper">{e.name}</span>
                          <span className="tech block text-[9px] text-steel-600">
                            {meta.label} · {links} link{links === 1 ? '' : 's'} · {e.caseIds.length} case
                            {e.caseIds.length === 1 ? '' : 's'}
                          </span>
                        </span>
                        {e.riskLevel !== 'UNKNOWN' && (
                          <span className="tech shrink-0 text-[9px]" style={{ color: RISK_COLOR[e.riskLevel] }}>
                            {e.riskLevel} {e.riskScore}
                          </span>
                        )}
                        {sel && <ArrowRight className="h-3 w-3 shrink-0 text-system" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {cmdResults.map((c, j) => {
                const i = entityResults.length + j;
                const sel = active === i;
                const Icon = c.icon;
                const header = c.group !== lastGroup ? c.group : null;
                lastGroup = c.group;
                return (
                  <div key={c.id}>
                    {header && <p className="tech px-4 pb-1 pt-3 text-[8px] text-steel-700">{header}</p>}
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => runAt(i)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors ${
                        sel ? 'bg-system-dim text-paper' : 'text-steel-400'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && <kbd className="border border-line px-1.5 py-0.5 font-mono text-[9px] text-steel-600">{c.hint}</kbd>}
                      {sel && <CornerDownLeft className="h-3 w-3 text-steel-600" />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border-t border-line px-4 py-2">
              <span className="tech text-[8px] text-steel-700">↑↓ navigate · ↵ select · esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
