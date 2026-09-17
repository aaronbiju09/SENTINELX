import { motion } from 'framer-motion';
import {
  ArrowRight,
  Plus,
  PlayCircle,
  Search,
  Network,
  FolderKanban,
  Bell,
  ShieldAlert,
  FileText,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useActiveInvestigation, useDataset } from '../../hooks/useDataset';
import { summarize } from '../../data/investigations';
import { SectionPage, EmptyState } from '../shell/SectionPage';
import { ENTITY_TYPE_META, RISK_COLOR, formatDate, relativeTime } from '../../utils/entityMeta';

export function HomeSection({ onNewInvestigation }: { onNewInvestigation: () => void }) {
  const state = useAppState();
  const actions = useActions();
  const investigation = useActiveInvestigation();
  const data = useDataset();

  const open = state.investigations.filter((i) => i.status !== 'ARCHIVED');
  const unread = data.alerts.filter((a) => !a.read);
  const highRisk = [...data.entities]
    .filter((e) => e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6);

  return (
    <SectionPage
      title="WORKSPACE"
      subtitle={
        investigation
          ? `Active investigation: ${investigation.name}`
          : 'No investigation is currently open. Open one, create one, or explore the demo.'
      }
      actions={
        <>
          <button
            onClick={onNewInvestigation}
            className="tech flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] text-steel-400 transition-colors hover:border-edge hover:text-paper"
          >
            <Plus className="h-3 w-3" /> New investigation
          </button>
          <button
            onClick={() => actions.setSection('demo')}
            className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-2.5 py-1.5 text-[9px] text-system transition-colors hover:bg-system/20"
          >
            <PlayCircle className="h-3 w-3" /> Demo Center
          </button>
        </>
      }
    >
      {/* Quick actions */}
      <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Quick
          icon={Search}
          label="Search entity"
          hint="Find a person, phone, wallet or case"
          onClick={() => actions.togglePalette(true)}
        />
        <Quick
          icon={Network}
          label="Open network"
          hint="Interactive intelligence graph"
          onClick={() => actions.setSection('network')}
          disabled={!investigation}
        />
        <Quick
          icon={Sparkles}
          label="AI intelligence"
          hint="Link prediction and findings"
          onClick={() => actions.setSection('intelligence')}
          disabled={!investigation}
        />
        <Quick
          icon={FileText}
          label="Generate report"
          hint="Compile an intelligence report"
          onClick={actions.generateReport}
          disabled={!investigation}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Investigations */}
        <div>
          <SectionLabel icon={FolderKanban} text="Investigations" />
          {open.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No active investigations"
              body="Start by creating an investigation, or explore the bundled Operation Nightfall sample."
              actions={
                <>
                  <MiniBtn onClick={onNewInvestigation} primary>
                    <Plus className="h-3 w-3" /> Create investigation
                  </MiniBtn>
                  <MiniBtn onClick={() => actions.setSection('demo')}>
                    <PlayCircle className="h-3 w-3" /> Explore demo
                  </MiniBtn>
                </>
              }
            />
          ) : (
            <div className="space-y-2">
              {open.map((inv, i) => {
                const counts = summarize(inv);
                const active = inv.id === state.activeInvestigationId;
                const empty = counts.entities === 0;
                return (
                  <motion.button
                    key={inv.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => actions.openInvestigation(inv.id, empty ? 'network' : 'network')}
                    className={`group flex w-full items-start gap-3 border p-3.5 text-left transition-colors ${
                      active ? 'border-system-line bg-system-dim/40' : 'border-line bg-panel/60 hover:border-edge'
                    }`}
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          inv.priority === 'HIGH' ? RISK_COLOR.CRITICAL : inv.priority === 'MEDIUM' ? RISK_COLOR.MEDIUM : RISK_COLOR.LOW,
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[14px] font-semibold text-paper">{inv.name}</span>
                        <span className="tech border border-line px-1.5 py-0.5 text-[8px] text-steel-500">
                          {inv.status}
                        </span>
                        {inv.source === 'SAMPLE' && (
                          <span className="tech border border-system-line px-1.5 py-0.5 text-[8px] text-system">
                            Sample data
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block line-clamp-2 text-[11px] leading-snug text-steel-500">
                        {inv.description || 'No description provided.'}
                      </span>
                      <span className="tech mt-1.5 block text-[8px] text-steel-600">
                        {empty
                          ? 'Empty — no entities yet'
                          : `${counts.entities} entities · ${counts.relationships} links · ${counts.cases} case files`}
                        {' · updated '}
                        {formatDate(inv.updatedAt)}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-steel-700 group-hover:text-system" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <div>
            <SectionLabel icon={Bell} text={`Alerts${unread.length ? ` · ${unread.length} unread` : ''}`} />
            {data.alerts.length === 0 ? (
              <p className="border border-dashed border-edge bg-panel/30 px-4 py-8 text-center text-[11px] text-steel-600">
                No alerts in this investigation.
              </p>
            ) : (
              <div className="border border-line">
                {data.alerts.slice(0, 5).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => actions.goToAlert(a)}
                    className="flex w-full items-start gap-2 border-b border-line/50 px-3 py-2 text-left transition-colors last:border-0 hover:bg-raise/60"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: RISK_COLOR[a.severity] }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[11px] ${a.read ? 'text-steel-400' : 'text-paper'}`}>
                        {a.title}
                      </span>
                      <span className="tech block text-[8px] text-steel-600">{relativeTime(a.timestamp)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionLabel icon={ShieldAlert} text="High-risk entities" />
            {highRisk.length === 0 ? (
              <p className="border border-dashed border-edge bg-panel/30 px-4 py-8 text-center text-[11px] text-steel-600">
                No high-risk entities yet.
              </p>
            ) : (
              <div className="border border-line">
                {highRisk.map((e) => {
                  const Icon = ENTITY_TYPE_META[e.type].icon;
                  return (
                    <button
                      key={e.id}
                      onClick={() => actions.investigate(e.id)}
                      className="flex w-full items-center gap-2 border-b border-line/50 px-3 py-2 text-left transition-colors last:border-0 hover:bg-raise/60"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: RISK_COLOR[e.riskLevel] }} />
                      <span className="min-w-0 flex-1 truncate text-[11px] text-steel-300">{e.name}</span>
                      <span className="font-mono text-[10px]" style={{ color: RISK_COLOR[e.riskLevel] }}>
                        {e.riskScore}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionPage>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <p className="tech mb-2 flex items-center gap-1.5 text-[9px] text-steel-600">
      <Icon className="h-3 w-3" />
      {text}
    </p>
  );
}

function Quick({
  icon: Icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? 'Open an investigation first' : hint}
      className="group flex items-center gap-3 border border-line bg-panel/60 p-3 text-left transition-colors hover:border-system-line disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-line bg-raise/60 group-hover:border-system-line">
        <Icon className="h-3.5 w-3.5 text-steel-400 group-hover:text-system" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-medium text-paper">{label}</span>
        <span className="block truncate text-[10px] text-steel-600">{hint}</span>
      </span>
    </motion.button>
  );
}

function MiniBtn({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`tech flex items-center gap-1.5 border px-3 py-2 text-[9px] transition-colors ${
        primary
          ? 'border-system-line bg-system-dim text-system hover:bg-system/20'
          : 'border-line text-steel-400 hover:border-edge hover:text-paper'
      }`}
    >
      {children}
    </button>
  );
}
