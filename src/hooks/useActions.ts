import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppState, uid, type IntelTab } from '../store/store';
import { useActiveInvestigation, useDataset } from './useDataset';
import { runAnalysis } from '../utils/aiAnalysis';
import { buildAdjacency } from '../utils/graphLayout';
import { DEMO_SCENARIOS } from '../data/investigations';
import type { AlertItem, Investigation, InvestigationPriority, SectionId, Toast, PredictionVerdict } from '../types';

const AI_STAGES = [
  'Scanning entities',
  'Analyzing relationships',
  'Checking transaction patterns',
  'Comparing known network shapes',
  'Predicting hidden links',
  'Calculating risk',
];

export function useActions() {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const data = useDataset();
  const investigation = useActiveInvestigation();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const pushToast = useCallback(
    (message: string, tone: Toast['tone'] = 'info') => {
      const toast: Toast = { id: uid('t'), message, tone, createdAt: Date.now() };
      dispatch({ type: 'TOAST_PUSH', toast });
      after(4200, () => dispatch({ type: 'TOAST_DISMISS', id: toast.id }));
    },
    [dispatch, after]
  );

  // ---- graph helpers scoped to the active investigation --------------------
  const adjacency = useCallback(() => buildAdjacency(data.relationships), [data.relationships]);

  const neighbors = useCallback((id: string) => [...(adjacency().get(id) ?? [])], [adjacency]);

  const shortestPath = useCallback(
    (fromId: string, toId: string): string[] | null => {
      if (fromId === toId) return [fromId];
      const adj = adjacency();
      const seen = new Set([fromId]);
      const parent = new Map<string, string>();
      const queue = [fromId];
      while (queue.length) {
        const cur = queue.shift()!;
        for (const n of adj.get(cur) ?? []) {
          if (seen.has(n)) continue;
          seen.add(n);
          parent.set(n, cur);
          if (n === toId) {
            const path = [toId];
            let p = toId;
            while (parent.has(p)) {
              p = parent.get(p)!;
              path.push(p);
            }
            return path.reverse();
          }
          queue.push(n);
        }
      }
      return null;
    },
    [adjacency]
  );

  // ---- navigation ----------------------------------------------------------
  const enterPlatform = useCallback(
    (onboarding = false) => dispatch({ type: 'ENTER_PLATFORM', onboarding }),
    [dispatch]
  );
  const goLanding = useCallback(() => dispatch({ type: 'GO_LANDING' }), [dispatch]);
  const setSection = useCallback((section: SectionId) => dispatch({ type: 'SET_SECTION', section }), [dispatch]);
  const setOnboarding = useCallback((open: boolean) => dispatch({ type: 'SET_ONBOARDING', open }), [dispatch]);
  const togglePalette = useCallback((open?: boolean) => dispatch({ type: 'TOGGLE_PALETTE', open }), [dispatch]);
  const dismissToast = useCallback((id: string) => dispatch({ type: 'TOAST_DISMISS', id }), [dispatch]);

  // ---- investigations ------------------------------------------------------
  const openInvestigation = useCallback(
    (id: string, section: SectionId = 'network') => {
      dispatch({ type: 'OPEN_INVESTIGATION', id });
      dispatch({ type: 'SET_SECTION', section });
      const inv = state.investigations.find((i) => i.id === id);
      if (inv) pushToast(`Opened ${inv.name}`, 'info');
    },
    [dispatch, pushToast, state.investigations]
  );

  const createInvestigation = useCallback(
    (input: { name: string; description: string; priority: InvestigationPriority; tags: string[] }) => {
      const now = new Date().toISOString().slice(0, 10);
      const inv: Investigation = {
        id: uid('inv'),
        name: input.name.trim(),
        description: input.description.trim(),
        priority: input.priority,
        status: 'ACTIVE',
        tags: input.tags,
        createdAt: now,
        updatedAt: now,
        source: 'USER',
        entityIds: [],
        caseIds: [],
      };
      dispatch({ type: 'CREATE_INVESTIGATION', investigation: inv });
      dispatch({ type: 'SET_SECTION', section: 'network' });
      pushToast(`Investigation created — ${inv.name}`, 'success');
      return inv;
    },
    [dispatch, pushToast]
  );

  const archiveInvestigation = useCallback(
    (id: string) => {
      dispatch({ type: 'ARCHIVE_INVESTIGATION', id });
      pushToast('Investigation archived', 'info');
    },
    [dispatch, pushToast]
  );

  const closeInvestigation = useCallback(() => dispatch({ type: 'CLOSE_INVESTIGATION' }), [dispatch]);

  // ---- canvas surfaces -----------------------------------------------------
  const focus = useCallback((id: string | null) => dispatch({ type: 'FOCUS', id }), [dispatch]);
  const setIntelTab = useCallback((tab: IntelTab) => dispatch({ type: 'SET_INTEL_TAB', tab }), [dispatch]);
  const setCase = useCallback((id: string | null) => dispatch({ type: 'SET_CASE', id }), [dispatch]);
  const openEvidence = useCallback((id: string | null) => dispatch({ type: 'OPEN_EVIDENCE', id }), [dispatch]);
  const toggleTimeline = useCallback((open?: boolean) => dispatch({ type: 'TOGGLE_TIMELINE', open }), [dispatch]);
  const setSpotlight = useCallback((ids: string[] | null) => dispatch({ type: 'SPOTLIGHT', ids }), [dispatch]);
  const resetTrace = useCallback(() => dispatch({ type: 'TRACE_RESET' }), [dispatch]);
  const closeSummary = useCallback(() => dispatch({ type: 'SUMMARY', open: false }), [dispatch]);

  /** Focus an entity on the network canvas, navigating there if needed. */
  const investigate = useCallback(
    (id: string, tab: IntelTab = 'intel') => {
      dispatch({ type: 'SET_SECTION', section: 'network' });
      dispatch({ type: 'FOCUS', id });
      dispatch({ type: 'SET_INTEL_TAB', tab });
      dispatch({ type: 'SPOTLIGHT', ids: null });
    },
    [dispatch]
  );

  const toggleFlag = useCallback(
    (id: string) => {
      const entity = state.entities.find((e) => e.id === id);
      dispatch({ type: 'FLAG_TOGGLE', id });
      pushToast(entity?.flagged ? `Flag cleared — ${entity.name}` : `Entity flagged — ${entity?.name ?? ''}`,
        entity?.flagged ? 'info' : 'warning');
    },
    [dispatch, pushToast, state.entities]
  );

  const addToCase = useCallback(
    (entityId: string) => {
      const caseId = state.activeCaseId ?? investigation?.caseIds[0];
      if (!caseId) {
        pushToast('No case file open to attach this entity to', 'warning');
        return;
      }
      dispatch({ type: 'ADD_TO_CASE', entityId, caseId });
      const entity = state.entities.find((e) => e.id === entityId);
      const c = data.cases.find((x) => x.id === caseId);
      pushToast(`${entity?.name ?? 'Entity'} added to ${c?.code ?? 'case'}`, 'success');
    },
    [dispatch, pushToast, state.activeCaseId, state.entities, investigation, data.cases]
  );

  const markAlertRead = useCallback((id: string) => dispatch({ type: 'ALERT_READ', id }), [dispatch]);
  const markAllRead = useCallback(() => dispatch({ type: 'ALERT_READ_ALL' }), [dispatch]);

  const goToAlert = useCallback(
    (alert: AlertItem) => {
      markAlertRead(alert.id);
      if (alert.entityId) investigate(alert.entityId);
      else if (alert.caseId) {
        dispatch({ type: 'SET_CASE', id: alert.caseId });
        dispatch({ type: 'SET_SECTION', section: 'cases' });
      }
    },
    [markAlertRead, investigate, dispatch]
  );

  // ---- engines -------------------------------------------------------------
  const traceFrom = useCallback(
    (rootId: string) => {
      dispatch({ type: 'SET_SECTION', section: 'network' });
      dispatch({ type: 'FOCUS', id: rootId });
      dispatch({ type: 'TRACE_START', rootId });
      dispatch({ type: 'TRACE_LOG', log: { id: uid('l'), text: 'TRACE INITIATED', tone: 'info' } });

      after(420, () => {
        const visited = new Set([rootId]);
        const hop1 = neighbors(rootId);
        hop1.forEach((i) => visited.add(i));
        dispatch({
          type: 'TRACE_REVEAL',
          ids: hop1,
          log: { id: uid('l'), text: `${hop1.length} direct connections identified`, tone: 'info' },
        });

        after(620, () => {
          const next = new Set<string>();
          for (const id of hop1) for (const n of neighbors(id)) if (!visited.has(n)) next.add(n);
          const hop2 = [...next];
          hop2.forEach((i) => visited.add(i));
          dispatch({
            type: 'TRACE_REVEAL',
            ids: hop2,
            log: { id: uid('l'), text: `${hop2.length} secondary connections identified`, tone: 'info' },
          });

          after(560, () => {
            let hr = 0;
            for (const r of data.relationships) {
              if (!visited.has(r.source) || !visited.has(r.target)) continue;
              const s = data.entities.find((e) => e.id === r.source);
              const t = data.entities.find((e) => e.id === r.target);
              const sev = (lv?: string) => lv === 'CRITICAL' || lv === 'HIGH';
              if (sev(s?.riskLevel) || sev(t?.riskLevel)) hr += 1;
            }
            dispatch({
              type: 'TRACE_LOG',
              log: {
                id: uid('l'),
                text: `${hr} high-risk relationship${hr === 1 ? '' : 's'} detected`,
                tone: hr > 0 ? 'danger' : 'success',
              },
            });
            pushToast('Trace complete', 'success');
          });
        });
      });
    },
    [after, dispatch, neighbors, pushToast, data.relationships, data.entities]
  );

  const expandFrom = useCallback(
    (rootId: string) => {
      const visited = new Set(state.trace.highlighted.length ? state.trace.highlighted : [rootId]);
      const next = new Set<string>();
      for (const id of visited) for (const n of neighbors(id)) if (!visited.has(n)) next.add(n);
      const revealed = [...next];
      if (revealed.length === 0) {
        pushToast('No further connections from this point', 'info');
        return;
      }
      if (!state.trace.active) dispatch({ type: 'TRACE_START', rootId });
      dispatch({
        type: 'TRACE_REVEAL',
        ids: revealed,
        log: { id: uid('l'), text: `Network expanded — ${revealed.length} entities revealed`, tone: 'info' },
      });
      pushToast(`Network expanded: +${revealed.length}`, 'success');
    },
    [dispatch, neighbors, pushToast, state.trace.active, state.trace.highlighted]
  );

  const findHiddenConnection = useCallback(
    (fromId: string, toId: string) => {
      const path = shortestPath(fromId, toId);
      if (!path || path.length < 2) {
        pushToast('No connection found between these entities', 'warning');
        return null;
      }
      clearTimers();
      dispatch({ type: 'SET_SECTION', section: 'network' });
      dispatch({ type: 'FOCUS', id: fromId });
      dispatch({ type: 'TRACE_START', rootId: fromId });
      dispatch({ type: 'TRACE_LOG', log: { id: uid('l'), text: 'TRAVERSING NETWORK…', tone: 'info' } });

      path.slice(1).forEach((id, i) => {
        after(420 + i * 470, () => {
          const ent = data.entities.find((e) => e.id === id);
          dispatch({ type: 'TRACE_REVEAL', ids: [id], log: { id: uid('l'), text: `-> ${ent?.name ?? id}`, tone: 'info' } });
        });
      });
      after(420 + path.length * 470, () => {
        dispatch({ type: 'TRACE_LOG', log: { id: uid('l'), text: 'INDIRECT CONNECTION IDENTIFIED', tone: 'success' } });
        pushToast(`Indirect connection identified — ${path.length - 1} hops`, 'success');
      });
      return path;
    },
    [after, clearTimers, dispatch, pushToast, shortestPath, data.entities]
  );

  const runAI = useCallback(
    (baseDelay = 0) => {
      if (data.entities.length === 0) {
        pushToast('Add entities to this investigation before running analysis', 'warning');
        return;
      }
      dispatch({ type: 'AI_START', stages: AI_STAGES });
      AI_STAGES.forEach((_, i) => after(baseDelay + 300 + i * 320, () => dispatch({ type: 'AI_STAGE_DONE', index: i })));
      after(baseDelay + 300 + AI_STAGES.length * 320 + 180, () => {
        dispatch({ type: 'AI_COMPLETE', result: runAnalysis(data.entities, data.relationships) });
        pushToast('AI analysis complete', 'success');
      });
    },
    [after, dispatch, pushToast, data.entities, data.relationships]
  );

  const enterPredictionMode = useCallback(() => {
    if (data.predictions.length === 0) {
      pushToast('No link predictions available for this investigation', 'warning');
      return;
    }
    dispatch({ type: 'SET_SECTION', section: 'network' });
    dispatch({ type: 'PREDICTION_MODE', on: true });
    pushToast('Prediction mode — showing candidate relationships', 'info');
  }, [dispatch, pushToast, data.predictions.length]);

  const exitPredictionMode = useCallback(() => dispatch({ type: 'PREDICTION_MODE', on: false }), [dispatch]);

  const judgePrediction = useCallback(
    (id: string, verdict: PredictionVerdict) => {
      dispatch({ type: 'PREDICTION_VERDICT', id, verdict });
      const tone = verdict === 'CONFIRMED' ? 'success' : verdict === 'DISMISSED' ? 'info' : 'warning';
      pushToast(`Prediction ${verdict.toLowerCase()}`, tone as Toast['tone']);
    },
    [dispatch, pushToast]
  );

  const generateReport = useCallback(() => {
    if (!investigation) {
      pushToast('Open an investigation first', 'warning');
      return;
    }
    dispatch({ type: 'SET_SECTION', section: 'reports' });
    dispatch({ type: 'REPORT_READY', on: false });
    dispatch({ type: 'REPORT_GENERATING', on: true });
    after(2400, () => {
      dispatch({ type: 'REPORT_GENERATING', on: false });
      dispatch({ type: 'REPORT_READY', on: true });
      pushToast('Intelligence report compiled', 'success');
    });
  }, [after, dispatch, pushToast, investigation]);

  // ---- demo ----------------------------------------------------------------
  const startDemo = useCallback(
    (scenarioId: string) => {
      const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario || !scenario.investigationId) {
        pushToast('This scenario is not available yet', 'warning');
        return;
      }
      clearTimers();
      dispatch({ type: 'DEMO_START', scenarioId, investigationId: scenario.investigationId });
    },
    [clearTimers, dispatch, pushToast]
  );

  const finishDemoIntro = useCallback(() => {
    dispatch({ type: 'DEMO_INTRO_DONE' });
    const scenario = DEMO_SCENARIOS.find((s) => s.id === state.demo.scenarioId);
    if (!scenario) return;
    if (scenario.opening === 'guided') dispatch({ type: 'DEMO_GUIDED', on: true });
    else if (scenario.opening === 'predictions') after(400, () => dispatch({ type: 'PREDICTION_MODE', on: true }));
    else if (scenario.focusEntityId) after(300, () => dispatch({ type: 'FOCUS', id: scenario.focusEntityId! }));
    if (scenario.opening === 'financial' && scenario.focusEntityId) {
      after(320, () => dispatch({ type: 'FOCUS', id: scenario.focusEntityId! }));
    }
  }, [after, dispatch, state.demo.scenarioId]);

  const exitDemo = useCallback(() => {
    clearTimers();
    dispatch({ type: 'DEMO_EXIT' });
    pushToast('Demo mode ended', 'info');
  }, [clearTimers, dispatch, pushToast]);

  const setGuided = useCallback((on: boolean) => dispatch({ type: 'DEMO_GUIDED', on }), [dispatch]);
  const setDemoStep = useCallback((step: number) => dispatch({ type: 'DEMO_STEP', step }), [dispatch]);
  const openSummary = useCallback(() => dispatch({ type: 'SUMMARY', open: true }), [dispatch]);

  const resetAll = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RESET_DATA' });
    dispatch({ type: 'RESET_WORKSPACE' });
    dispatch({ type: 'CANVAS_REPLAY' });
    pushToast('Sample data restored', 'success');
  }, [clearTimers, dispatch, pushToast]);

  return {
    pushToast,
    dismissToast,
    enterPlatform,
    goLanding,
    setSection,
    setOnboarding,
    togglePalette,
    openInvestigation,
    createInvestigation,
    archiveInvestigation,
    closeInvestigation,
    focus,
    setIntelTab,
    investigate,
    setCase,
    openEvidence,
    toggleTimeline,
    setSpotlight,
    resetTrace,
    closeSummary,
    toggleFlag,
    addToCase,
    markAlertRead,
    markAllRead,
    goToAlert,
    traceFrom,
    expandFrom,
    findHiddenConnection,
    runAI,
    enterPredictionMode,
    exitPredictionMode,
    judgePrediction,
    generateReport,
    startDemo,
    finishDemoIntro,
    exitDemo,
    setGuided,
    setDemoStep,
    openSummary,
    resetAll,
  };
}
