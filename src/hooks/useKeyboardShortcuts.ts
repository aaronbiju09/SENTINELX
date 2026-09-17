import { useEffect, useRef } from 'react';
import { useAppState } from '../store/store';
import { useActions } from './useActions';

export function useKeyboardShortcuts() {
  const state = useAppState();
  const actions = useActions();
  const stateRef = useRef(state);
  const actionsRef = useRef(actions);
  stateRef.current = state;
  actionsRef.current = actions;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      const s = stateRef.current;
      const a = actionsRef.current;

      // Landing screen: Enter goes into the platform.
      if (s.phase === 'landing') {
        if (e.key === 'Enter') a.enterPlatform(true);
        return;
      }

      // Demo intro: Esc / Enter / Space skip straight to the investigation.
      if (s.demo.intro) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          a.finishDemoIntro();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        a.togglePalette();
        return;
      }

      if (e.key === 'Escape') {
        if (s.paletteOpen) a.togglePalette(false);
        else if (s.onboarding) a.setOnboarding(false);
        else if (s.openEvidenceId) a.openEvidence(null);
        else if (s.summaryOpen) a.closeSummary();
        else if (s.ai.predictionMode) a.exitPredictionMode();
        else if (s.trace.active) a.resetTrace();
        else if (s.focusId) a.focus(null);
        else if (s.timelineOpen) a.toggleTimeline(false);
        else if (s.section !== 'home') a.setSection('home');
        return;
      }

      if (e.key === '/' && !typing) {
        e.preventDefault();
        a.togglePalette(true);
        return;
      }

      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'd':
          a.setSection('demo');
          break;
        case 'a':
          a.runAI();
          break;
        case 'h':
          a.enterPredictionMode();
          break;
        case 'l':
          a.toggleTimeline();
          break;
        case 'r':
          a.generateReport();
          break;
        case 'n':
          a.setSection('network');
          break;
        case 't':
          if (s.focusId) a.traceFrom(s.focusId);
          else a.pushToast('Focus an entity first', 'info');
          break;
        default:
          break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
