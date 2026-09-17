import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppState } from './store/store';
import { useActions } from './hooks/useActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { LandingScreen } from './components/landing/LandingScreen';
import { TopBar } from './components/shell/TopBar';
import { CommandDock } from './components/shell/CommandDock';
import { CommandPalette } from './components/shell/CommandPalette';
import { TimelineRail } from './components/shell/TimelineRail';
import { Toasts } from './components/shell/Toasts';
import { SummaryModal } from './components/shell/SummaryModal';
import { OnboardingOverlay } from './components/shell/OnboardingOverlay';
import { EvidenceViewer } from './components/intel/EvidenceViewer';

import { DemoIntro } from './components/demo/DemoIntro';
import { DemoBanner, GuidedDemo } from './components/demo/GuidedDemo';
import { DemoCenter } from './components/demo/DemoCenter';

import { HomeSection } from './components/sections/HomeSection';
import { InvestigationsSection, CreateInvestigationModal } from './components/sections/InvestigationsSection';
import { NetworkSection } from './components/sections/NetworkSection';
import { IntelligenceSection } from './components/sections/IntelligenceSection';
import { RiskSection } from './components/sections/RiskSection';
import { RegistrySection } from './components/sections/RegistrySection';
import { CaseFilesSection } from './components/sections/CaseFilesSection';
import { EvidenceSection } from './components/sections/EvidenceSection';
import { AlertsSection } from './components/sections/AlertsSection';
import { ReportSection } from './components/sections/ReportSection';
import { SystemSection } from './components/sections/SystemSection';

function Sections({
  createOpen,
  openCreate,
  closeCreate,
}: {
  createOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
}) {
  const { section } = useAppState();
  switch (section) {
    case 'home':
      return <HomeSection key="home" onNewInvestigation={openCreate} />;
    case 'investigations':
      return (
        <InvestigationsSection key="investigations" createOpen={createOpen} onOpenCreate={openCreate} onCloseCreate={closeCreate} />
      );
    case 'network':
      return <NetworkSection key="network" />;
    case 'intelligence':
      return <IntelligenceSection key="intelligence" />;
    case 'risk':
      return <RiskSection key="risk" />;
    case 'registry':
      return <RegistrySection key="registry" />;
    case 'cases':
      return <CaseFilesSection key="cases" />;
    case 'evidence':
      return <EvidenceSection key="evidence" />;
    case 'alerts':
      return <AlertsSection key="alerts" />;
    case 'reports':
      return <ReportSection key="reports" />;
    case 'demo':
      return <DemoCenter key="demo" />;
    case 'system':
      return <SystemSection key="system" />;
    default:
      return null;
  }
}

export default function App() {
  const state = useAppState();
  const actions = useActions();
  const [createOpen, setCreateOpen] = useState(false);
  useKeyboardShortcuts();

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  if (state.phase === 'landing') {
    return (
      <>
        <AnimatePresence mode="wait">
          <LandingScreen key="landing" />
        </AnimatePresence>
        <Toasts />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-void">
      <TopBar onNewInvestigation={openCreate} />
      <DemoBanner />

      <main className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <Sections key={state.section} createOpen={createOpen} openCreate={openCreate} closeCreate={closeCreate} />
        </AnimatePresence>

        <TimelineRail />
        <GuidedDemo />
        <CommandDock />
      </main>

      {/* Global layers */}
      <CommandPalette onNewInvestigation={openCreate} />
      <EvidenceViewer />
      <SummaryModal />
      <OnboardingOverlay />
      <Toasts />

      {/* The create modal is reachable from anywhere, not just the investigations page */}
      {state.section !== 'investigations' && <CreateInvestigationModal open={createOpen} onClose={closeCreate} />}

      {/* Demo startup cinematic */}
      <AnimatePresence>{state.demo.active && state.demo.intro && <DemoIntro key="demo-intro" />}</AnimatePresence>
    </div>
  );
}
