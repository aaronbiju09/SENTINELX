import { motion } from 'framer-motion';
import { ArrowRight, Clock, Lock, PlayCircle, Sparkles, Waypoints, Coins } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { DEMO_SCENARIOS, summarize } from '../../data/investigations';
import { SectionPage } from '../shell/SectionPage';

const SCENARIO_ICON: Record<string, typeof PlayCircle> = {
  nightfall: Waypoints,
  financial: Coins,
  hidden: Sparkles,
};

export function DemoCenter() {
  const state = useAppState();
  const actions = useActions();

  return (
    <SectionPage
      title="DEMO CENTER"
      subtitle="Choose an investigation scenario to present. Each runs on the bundled sample data."
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {DEMO_SCENARIOS.map((s, i) => {
          const Icon = SCENARIO_ICON[s.id] ?? PlayCircle;
          const inv = state.investigations.find((x) => x.id === s.investigationId);
          const counts = inv ? summarize(inv) : null;
          const primary = s.id === 'nightfall';

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex flex-col border p-5 cut-tr ${
                primary ? 'border-system-line bg-gradient-to-b from-system-dim to-panel/70' : 'border-line bg-panel/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center border ${
                    primary ? 'border-system-line bg-system-dim' : 'border-line bg-raise/60'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${primary ? 'text-system' : 'text-steel-400'}`} />
                </span>
                {primary && (
                  <span className="tech border border-system-line px-2 py-0.5 text-[8px] text-system">
                    Primary demo
                  </span>
                )}
              </div>

              <h3 className="mt-3 font-display text-lg font-bold tracking-wide text-paper">
                {s.title.toUpperCase()}
              </h3>
              <p className="tech mt-0.5 text-[9px] text-steel-600">{s.subtitle}</p>
              <p className="mt-2.5 flex-1 text-[11px] leading-relaxed text-steel-400">{s.description}</p>

              {counts && primary && (
                <div className="mt-4 grid grid-cols-4 gap-px border border-line bg-line">
                  <Count value={counts.entities} label="Entities" />
                  <Count value={counts.relationships} label="Links" />
                  <Count value={counts.events} label="Events" />
                  <Count value={counts.alerts} label="Alerts" />
                </div>
              )}

              {counts && !primary && (
                <p className="tech mt-4 flex items-center gap-1.5 text-[9px] text-steel-600">
                  <Clock className="h-3 w-3" />
                  Runs on the Operation Nightfall dataset
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!s.available}
                onClick={() => actions.startDemo(s.id)}
                className={`tech mt-4 flex items-center justify-center gap-2 border px-3 py-2.5 text-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  primary
                    ? 'border-system-line bg-system-dim text-system hover:bg-system/20'
                    : 'border-line text-steel-300 hover:border-system-line hover:text-system'
                }`}
              >
                {s.available ? (
                  <>
                    Start demo
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" /> Not implemented
                  </>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 border border-line bg-panel/50 p-4">
        <p className="tech mb-2 text-[9px] text-steel-600">Presenting this?</p>
        <p className="text-[11px] leading-relaxed text-steel-400">
          Operation Nightfall opens with a guided walkthrough — six steps with previous/next controls, so nothing has to
          be found in a menu mid-presentation. You can switch the guide off at any time and drive the platform manually,
          and a demo-mode banner stays visible so the panel always knows they are looking at sample data.
        </p>
      </div>
    </SectionPage>
  );
}

function Count({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-panel py-2 text-center">
      <p className="font-display text-base font-bold text-paper">{value}</p>
      <p className="tech text-[8px] text-steel-600">{label}</p>
    </div>
  );
}
