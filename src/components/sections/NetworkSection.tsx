import { AnimatePresence, motion } from 'framer-motion';
import { Network, PlayCircle, FolderOpen } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useActiveInvestigation, useDataset } from '../../hooks/useDataset';
import { NetworkCanvas } from '../canvas/NetworkCanvas';
import { AITraceOverlay } from '../canvas/AITraceOverlay';
import { EntityIntelligence } from '../intel/EntityIntelligence';
import { InvestigationHeader } from '../shell/InvestigationHeader';
import { EmptyState } from '../shell/SectionPage';

/** The network workspace — canvas plus its docked intelligence surfaces. */
export function NetworkSection() {
  const state = useAppState();
  const actions = useActions();
  const investigation = useActiveInvestigation();
  const data = useDataset();

  if (!investigation) {
    return (
      <div className="flex h-full items-center justify-center p-6 pb-24">
        <div className="w-full max-w-lg">
          <EmptyState
            icon={FolderOpen}
            title="No investigation open"
            body="Open an investigation to map its network, or explore the bundled Operation Nightfall sample."
            actions={
              <>
                <button
                  onClick={() => actions.setSection('investigations')}
                  className="tech border border-line px-3 py-2 text-[9px] text-steel-400 transition-colors hover:text-paper"
                >
                  Browse investigations
                </button>
                <button
                  onClick={() => actions.setSection('demo')}
                  className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-3 py-2 text-[9px] text-system"
                >
                  <PlayCircle className="h-3 w-3" /> Demo Center
                </button>
              </>
            }
          />
        </div>
      </div>
    );
  }

  if (data.entities.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 pb-24">
        <div className="w-full max-w-lg">
          <EmptyState
            icon={Network}
            title={`${investigation.name} is empty`}
            body="This investigation has no entities yet. This prototype has no ingestion backend, so populated networks are available in the bundled sample investigation."
            actions={
              <>
                <button
                  onClick={() => actions.setSection('investigations')}
                  className="tech border border-line px-3 py-2 text-[9px] text-steel-400 transition-colors hover:text-paper"
                >
                  Switch investigation
                </button>
                <button
                  onClick={() => actions.setSection('demo')}
                  className="tech flex items-center gap-1.5 border border-system-line bg-system-dim px-3 py-2 text-[9px] text-system"
                >
                  <PlayCircle className="h-3 w-3" /> Open the sample
                </button>
              </>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="relative h-full w-full"
    >
      <NetworkCanvas />
      <InvestigationHeader />
      <AITraceOverlay />
      <AnimatePresence>{state.focusId && <EntityIntelligence key="intel" />}</AnimatePresence>
    </motion.div>
  );
}
