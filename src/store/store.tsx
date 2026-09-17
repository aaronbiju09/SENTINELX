import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type {
  AIAnalysisResult,
  AIState,
  AlertItem,
  AppPhase,
  DemoState,
  Entity,
  Investigation,
  LinkPrediction,
  PredictionVerdict,
  SectionId,
  Toast,
  TraceLogLine,
  TraceState,
} from '../types';
import { ALERTS, ENTITIES } from '../data/mockData';
import { LINK_PREDICTIONS } from '../data/intel';
import { INITIAL_INVESTIGATIONS } from '../data/investigations';

export type IntelTab = 'intel' | 'risk' | 'links' | 'evidence';

export interface AppState {
  phase: AppPhase;
  section: SectionId;
  onboarding: boolean;

  /** Workspace */
  investigations: Investigation[];
  activeInvestigationId: string | null;

  /** Canvas / investigation surfaces */
  focusId: string | null;
  intelTab: IntelTab;
  activeCaseId: string | null;
  openEvidenceId: string | null;
  timelineOpen: boolean;
  spotlightIds: string[] | null;
  canvasEpoch: number;

  /** Global UI */
  paletteOpen: boolean;
  toasts: Toast[];

  /** Engines */
  trace: TraceState;
  ai: AIState;

  /** Pools (mutable in-session) */
  entities: Entity[];
  alerts: AlertItem[];
  predictions: LinkPrediction[];

  /** Demo */
  demo: DemoState;
  summaryOpen: boolean;

  reportGenerating: boolean;
  reportReady: boolean;
}

const initialState: AppState = {
  phase: 'landing',
  section: 'home',
  onboarding: false,

  investigations: INITIAL_INVESTIGATIONS.map((i) => ({ ...i })),
  activeInvestigationId: null,

  focusId: null,
  intelTab: 'intel',
  activeCaseId: null,
  openEvidenceId: null,
  timelineOpen: false,
  spotlightIds: null,
  canvasEpoch: 0,

  paletteOpen: false,
  toasts: [],

  trace: { active: false, rootId: null, highlighted: [], log: [] },
  ai: { running: false, stages: [], result: null, predictionMode: false },

  entities: ENTITIES.map((e) => ({ ...e })),
  alerts: ALERTS.map((a) => ({ ...a })),
  predictions: LINK_PREDICTIONS.map((p) => ({ ...p })),

  demo: { active: false, scenarioId: null, intro: false, guided: false, step: 0 },
  summaryOpen: false,

  reportGenerating: false,
  reportReady: false,
};

export type Action =
  | { type: 'ENTER_PLATFORM'; onboarding?: boolean }
  | { type: 'GO_LANDING' }
  | { type: 'SET_SECTION'; section: SectionId }
  | { type: 'SET_ONBOARDING'; open: boolean }
  | { type: 'OPEN_INVESTIGATION'; id: string }
  | { type: 'CREATE_INVESTIGATION'; investigation: Investigation }
  | { type: 'ARCHIVE_INVESTIGATION'; id: string }
  | { type: 'CLOSE_INVESTIGATION' }
  | { type: 'FOCUS'; id: string | null }
  | { type: 'SET_INTEL_TAB'; tab: IntelTab }
  | { type: 'SET_CASE'; id: string | null }
  | { type: 'OPEN_EVIDENCE'; id: string | null }
  | { type: 'TOGGLE_TIMELINE'; open?: boolean }
  | { type: 'SPOTLIGHT'; ids: string[] | null }
  | { type: 'CANVAS_REPLAY' }
  | { type: 'TOGGLE_PALETTE'; open?: boolean }
  | { type: 'TOAST_PUSH'; toast: Toast }
  | { type: 'TOAST_DISMISS'; id: string }
  | { type: 'TRACE_START'; rootId: string }
  | { type: 'TRACE_REVEAL'; ids: string[]; log?: TraceLogLine }
  | { type: 'TRACE_LOG'; log: TraceLogLine }
  | { type: 'TRACE_RESET' }
  | { type: 'AI_START'; stages: string[] }
  | { type: 'AI_STAGE_DONE'; index: number }
  | { type: 'AI_COMPLETE'; result: AIAnalysisResult }
  | { type: 'AI_RESET' }
  | { type: 'PREDICTION_MODE'; on: boolean }
  | { type: 'PREDICTION_VERDICT'; id: string; verdict: PredictionVerdict }
  | { type: 'ALERT_READ'; id: string }
  | { type: 'ALERT_READ_ALL' }
  | { type: 'FLAG_TOGGLE'; id: string }
  | { type: 'ADD_TO_CASE'; entityId: string; caseId: string }
  | { type: 'DEMO_START'; scenarioId: string; investigationId: string }
  | { type: 'DEMO_INTRO_DONE' }
  | { type: 'DEMO_EXIT' }
  | { type: 'DEMO_GUIDED'; on: boolean }
  | { type: 'DEMO_STEP'; step: number }
  | { type: 'SUMMARY'; open: boolean }
  | { type: 'REPORT_GENERATING'; on: boolean }
  | { type: 'REPORT_READY'; on: boolean }
  | { type: 'RESET_DATA' }
  | { type: 'RESET_WORKSPACE' };

const clearedWorkspace = {
  focusId: null,
  intelTab: 'intel' as IntelTab,
  openEvidenceId: null,
  spotlightIds: null,
  timelineOpen: false,
  trace: { active: false, rootId: null, highlighted: [], log: [] },
  ai: { running: false, stages: [], result: null, predictionMode: false },
  summaryOpen: false,
  reportGenerating: false,
  reportReady: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ENTER_PLATFORM':
      return { ...state, phase: 'platform', section: 'home', onboarding: action.onboarding ?? false };
    case 'GO_LANDING':
      return {
        ...state,
        ...clearedWorkspace,
        phase: 'landing',
        demo: { active: false, scenarioId: null, intro: false, guided: false, step: 0 },
      };
    case 'SET_SECTION':
      return { ...state, section: action.section, paletteOpen: false };
    case 'SET_ONBOARDING':
      return { ...state, onboarding: action.open };

    case 'OPEN_INVESTIGATION': {
      const inv = state.investigations.find((i) => i.id === action.id);
      return {
        ...state,
        ...clearedWorkspace,
        activeInvestigationId: action.id,
        activeCaseId: inv?.caseIds[0] ?? null,
        canvasEpoch: state.canvasEpoch + 1,
      };
    }
    case 'CREATE_INVESTIGATION':
      return {
        ...state,
        investigations: [action.investigation, ...state.investigations],
        activeInvestigationId: action.investigation.id,
        activeCaseId: null,
        ...clearedWorkspace,
      };
    case 'ARCHIVE_INVESTIGATION':
      return {
        ...state,
        investigations: state.investigations.map((i) =>
          i.id === action.id ? { ...i, status: 'ARCHIVED' as const } : i
        ),
        activeInvestigationId: state.activeInvestigationId === action.id ? null : state.activeInvestigationId,
      };
    case 'CLOSE_INVESTIGATION':
      return { ...state, activeInvestigationId: null, activeCaseId: null, ...clearedWorkspace };

    case 'FOCUS':
      return { ...state, focusId: action.id, intelTab: action.id ? state.intelTab : 'intel' };
    case 'SET_INTEL_TAB':
      return { ...state, intelTab: action.tab };
    case 'SET_CASE':
      return { ...state, activeCaseId: action.id };
    case 'OPEN_EVIDENCE':
      return { ...state, openEvidenceId: action.id };
    case 'TOGGLE_TIMELINE':
      return { ...state, timelineOpen: action.open ?? !state.timelineOpen };
    case 'SPOTLIGHT':
      return { ...state, spotlightIds: action.ids };
    case 'CANVAS_REPLAY':
      return { ...state, canvasEpoch: state.canvasEpoch + 1 };

    case 'TOGGLE_PALETTE':
      return { ...state, paletteOpen: action.open ?? !state.paletteOpen };
    case 'TOAST_PUSH':
      return { ...state, toasts: [...state.toasts.slice(-3), action.toast] };
    case 'TOAST_DISMISS':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case 'TRACE_START':
      return { ...state, trace: { active: true, rootId: action.rootId, highlighted: [action.rootId], log: [] } };
    case 'TRACE_REVEAL':
      return {
        ...state,
        trace: {
          ...state.trace,
          highlighted: [...new Set([...state.trace.highlighted, ...action.ids])],
          log: action.log ? [...state.trace.log, action.log] : state.trace.log,
        },
      };
    case 'TRACE_LOG':
      return { ...state, trace: { ...state.trace, log: [...state.trace.log, action.log] } };
    case 'TRACE_RESET':
      return { ...state, trace: { active: false, rootId: null, highlighted: [], log: [] } };

    case 'AI_START':
      return {
        ...state,
        ai: {
          running: true,
          stages: action.stages.map((label, i) => ({ id: `s${i}`, label, done: false })),
          result: null,
          predictionMode: state.ai.predictionMode,
        },
      };
    case 'AI_STAGE_DONE':
      return {
        ...state,
        ai: { ...state.ai, stages: state.ai.stages.map((s, i) => (i === action.index ? { ...s, done: true } : s)) },
      };
    case 'AI_COMPLETE':
      return { ...state, ai: { ...state.ai, running: false, result: action.result } };
    case 'AI_RESET':
      return { ...state, ai: { running: false, stages: [], result: null, predictionMode: false } };
    case 'PREDICTION_MODE':
      return { ...state, ai: { ...state.ai, predictionMode: action.on } };
    case 'PREDICTION_VERDICT':
      return {
        ...state,
        predictions: state.predictions.map((p) => (p.id === action.id ? { ...p, verdict: action.verdict } : p)),
      };

    case 'ALERT_READ':
      return { ...state, alerts: state.alerts.map((a) => (a.id === action.id ? { ...a, read: true } : a)) };
    case 'ALERT_READ_ALL':
      return { ...state, alerts: state.alerts.map((a) => ({ ...a, read: true })) };
    case 'FLAG_TOGGLE':
      return { ...state, entities: state.entities.map((e) => (e.id === action.id ? { ...e, flagged: !e.flagged } : e)) };
    case 'ADD_TO_CASE':
      return {
        ...state,
        entities: state.entities.map((e) =>
          e.id === action.entityId && !e.caseIds.includes(action.caseId)
            ? { ...e, caseIds: [...e.caseIds, action.caseId] }
            : e
        ),
      };

    case 'DEMO_START': {
      const inv = state.investigations.find((i) => i.id === action.investigationId);
      return {
        ...state,
        ...clearedWorkspace,
        phase: 'platform',
        demo: { active: true, scenarioId: action.scenarioId, intro: true, guided: false, step: 0 },
        activeInvestigationId: action.investigationId,
        activeCaseId: inv?.caseIds[0] ?? null,
        section: 'network',
        canvasEpoch: state.canvasEpoch + 1,
      };
    }
    case 'DEMO_INTRO_DONE':
      return { ...state, demo: { ...state.demo, intro: false } };
    case 'DEMO_EXIT':
      return {
        ...state,
        ...clearedWorkspace,
        demo: { active: false, scenarioId: null, intro: false, guided: false, step: 0 },
        section: 'demo',
      };
    case 'DEMO_GUIDED':
      return { ...state, demo: { ...state.demo, guided: action.on, step: 0 } };
    case 'DEMO_STEP':
      return { ...state, demo: { ...state.demo, step: action.step } };

    case 'SUMMARY':
      return { ...state, summaryOpen: action.open };
    case 'REPORT_GENERATING':
      return { ...state, reportGenerating: action.on };
    case 'REPORT_READY':
      return { ...state, reportReady: action.on };

    case 'RESET_DATA':
      return {
        ...state,
        entities: ENTITIES.map((e) => ({ ...e })),
        alerts: ALERTS.map((a) => ({ ...a })),
        predictions: LINK_PREDICTIONS.map((p) => ({ ...p })),
        investigations: INITIAL_INVESTIGATIONS.map((i) => ({ ...i })),
      };
    case 'RESET_WORKSPACE':
      return { ...state, ...clearedWorkspace };
    default:
      return state;
  }
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => state, [state]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('useAppState must be used within StoreProvider');
  return ctx;
}

export function useAppDispatch(): React.Dispatch<Action> {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error('useAppDispatch must be used within StoreProvider');
  return ctx;
}

let counter = 0;
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}
