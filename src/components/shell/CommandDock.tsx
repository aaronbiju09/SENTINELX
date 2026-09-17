import { motion } from 'framer-motion';
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
  PlayCircle,
  Settings2,
  History,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import type { SectionId } from '../../types';

interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  tip: string;
}

/** Primary navigation — every section is one click from anywhere. */
const PRIMARY: NavItem[] = [
  { id: 'home', label: 'Home', icon: LayoutDashboard, tip: 'Workspace overview and quick actions' },
  { id: 'investigations', label: 'Cases', icon: FolderKanban, tip: 'All investigations — open, create, archive' },
  { id: 'network', label: 'Network', icon: Network, tip: 'Interactive intelligence graph' },
  { id: 'intelligence', label: 'AI', icon: Sparkles, tip: 'Link prediction, pattern detection and findings' },
  { id: 'risk', label: 'Risk', icon: Gauge, tip: 'Risk distribution and explainable scoring' },
  { id: 'registry', label: 'Entities', icon: Users, tip: 'Searchable entity registry' },
  { id: 'cases', label: 'Files', icon: Briefcase, tip: 'Case dossiers inside this investigation' },
  { id: 'evidence', label: 'Evidence', icon: Archive, tip: 'Evidence vault' },
  { id: 'alerts', label: 'Alerts', icon: Bell, tip: 'Alert stream' },
  { id: 'reports', label: 'Reports', icon: FileText, tip: 'Generate and export intelligence reports' },
];

export function CommandDock() {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();
  const unread = data.alerts.filter((a) => !a.read).length;

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 28 }}
      aria-label="Primary"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3"
    >
      <div className="pointer-events-auto flex max-w-full items-stretch gap-px overflow-x-auto scrollbar-thin border border-line bg-panel/92 backdrop-blur-md shadow-2xl shadow-black/60">
        {PRIMARY.map((item) => {
          const Icon = item.icon;
          const active = state.section === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => actions.setSection(item.id)}
              title={item.tip}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex min-w-[58px] shrink-0 flex-col items-center justify-center gap-1 px-3 py-2.5 transition-colors ${
                active ? 'text-paper' : 'text-steel-500 hover:bg-raise/60 hover:text-steel-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dock-active"
                  className="absolute inset-x-1 top-0 h-[2px] bg-system"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="h-4 w-4" strokeWidth={active ? 2.2 : 1.8} />
              <span className="tech text-[8px]">{item.label}</span>
              {item.id === 'alerts' && unread > 0 && (
                <span className="absolute right-1 top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-crit px-1 font-mono text-[8px] font-bold text-white">
                  {unread}
                </span>
              )}
            </motion.button>
          );
        })}

        <span className="w-px shrink-0 bg-line" />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => actions.toggleTimeline()}
          title="Toggle the investigation timeline (L)"
          className={`flex shrink-0 flex-col items-center justify-center gap-1 px-3 transition-colors ${
            state.timelineOpen ? 'bg-system-dim text-system' : 'text-steel-500 hover:text-paper'
          }`}
        >
          <History className="h-4 w-4" />
          <span className="tech text-[8px]">Timeline</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => actions.setSection('demo')}
          title="Demo Center — presentation scenarios"
          className={`flex shrink-0 flex-col items-center justify-center gap-1 px-3 transition-colors ${
            state.section === 'demo' ? 'bg-system-dim text-system' : 'text-system/80 hover:bg-system-dim hover:text-system'
          }`}
        >
          <PlayCircle className="h-4 w-4" />
          <span className="tech text-[8px]">Demo</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => actions.setSection('system')}
          title="System, project and team information"
          className={`flex shrink-0 flex-col items-center justify-center gap-1 px-3 transition-colors ${
            state.section === 'system' ? 'text-paper' : 'text-steel-500 hover:text-paper'
          }`}
        >
          <Settings2 className="h-4 w-4" />
          <span className="tech text-[8px]">System</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
