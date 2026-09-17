import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BellOff, CheckCheck, ArrowUpRight } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useDataset } from '../../hooks/useDataset';
import { useActions } from '../../hooks/useActions';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { RISK_COLOR, formatDateTime, relativeTime } from '../../utils/entityMeta';
import type { RiskLevel } from '../../types';

const LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function AlertsSection() {
  const state = useAppState();
  const actions = useActions();
  const { goToAlert, markAllRead } = actions;
  const data = useDataset();
  const [filter, setFilter] = useState<RiskLevel | 'ALL'>('ALL');

  const alerts = useMemo(
    () =>
      [...data.alerts]
        .filter((a) => (filter === 'ALL' ? true : a.severity === filter))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [data.alerts, filter]
  );
  const unread = data.alerts.filter((a) => !a.read).length;

  return (
    <SectionPage
      title="ALERT STREAM"
      subtitle={`${unread} unread of ${data.alerts.length} signals in this investigation`}
      actions={
        <button
          onClick={markAllRead}
          className="tech flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] text-steel-500 transition-colors hover:border-edge hover:text-paper"
        >
          <CheckCheck className="h-3 w-3" />
          Mark all read
        </button>
      }
    >
      <div className="mb-3 flex gap-1.5">
        <Chip active={filter === 'ALL'} onClick={() => setFilter('ALL')}>All</Chip>
        {LEVELS.map((l) => (
          <Chip key={l} active={filter === l} onClick={() => setFilter(l)} color={RISK_COLOR[l]}>
            {l}
          </Chip>
        ))}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <BellOff className="h-6 w-6 text-steel-700" />
          <p className="text-sm text-steel-600">No alerts at this severity.</p>
        </div>
      ) : (
        <div className="border border-line">
          {alerts.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => goToAlert(a)}
              className="group flex w-full items-start gap-3 border-b border-line/50 px-3.5 py-3 text-left transition-colors last:border-0 hover:bg-raise/60"
            >
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: RISK_COLOR[a.severity] }} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={`truncate text-[12px] ${a.read ? 'text-steel-400' : 'font-semibold text-paper'}`}>{a.title}</span>
                  {!a.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-system" />}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-steel-500">{a.description}</span>
              </span>
              <span className="tech shrink-0 text-right text-[8px] text-steel-600">
                <span className="block">{relativeTime(a.timestamp)}</span>
                <span className="block text-steel-700">{formatDateTime(a.timestamp)}</span>
              </span>
              <ArrowUpRight className="mt-1 h-3 w-3 shrink-0 text-steel-700 group-hover:text-system" />
            </motion.button>
          ))}
        </div>
      )}
    </SectionPage>
  );
}

function Chip({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
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
