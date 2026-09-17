// ---------------------------------------------------------------------------
// SENTINELX — investigations and the dataset selector.
//
// The entity pool is global; an investigation owns a slice of it. Screens read
// whatever the ACTIVE investigation contains, so nothing is hardcoded to
// Operation Nightfall and a user-created (empty) investigation renders proper
// empty states.
// ---------------------------------------------------------------------------

import type {
  AlertItem,
  CaseFile,
  Entity,
  EvidenceItem,
  Investigation,
  LinkPrediction,
  Relationship,
  TimelineEvent,
} from '../types';
import { ENTITIES, RELATIONSHIPS, TIMELINE_EVENTS, ALERTS, CASES } from './mockData';
import { EVIDENCE, LINK_PREDICTIONS } from './intel';

/** The bundled sample investigation — the basis of the Operation Nightfall demo. */
export const SAMPLE_INVESTIGATION: Investigation = {
  id: 'inv-nightfall',
  name: 'Operation Nightfall',
  description:
    'Suspected fraud and undisclosed-fund movement through a logistics front company and an affiliated shell holding company. Bundled sample investigation.',
  priority: 'HIGH',
  status: 'ACTIVE',
  tags: ['sample', 'financial-crime', 'network-analysis'],
  createdAt: '2026-07-03',
  updatedAt: '2026-09-02',
  source: 'SAMPLE',
  entityIds: ENTITIES.map((e) => e.id),
  caseIds: CASES.map((c) => c.id),
};

export const INITIAL_INVESTIGATIONS: Investigation[] = [SAMPLE_INVESTIGATION];

export interface Dataset {
  entities: Entity[];
  relationships: Relationship[];
  timeline: TimelineEvent[];
  alerts: AlertItem[];
  evidence: EvidenceItem[];
  predictions: LinkPrediction[];
  cases: CaseFile[];
}

export const EMPTY_DATASET: Dataset = {
  entities: [],
  relationships: [],
  timeline: [],
  alerts: [],
  evidence: [],
  predictions: [],
  cases: [],
};

/**
 * Scope the global pools down to one investigation. `entityPool`, `alertPool`
 * and `predictionPool` come from the store so in-session edits (flags, read
 * state, prediction verdicts) are reflected.
 */
export function selectDataset(
  investigation: Investigation | null,
  entityPool: Entity[],
  alertPool: AlertItem[],
  predictionPool: LinkPrediction[]
): Dataset {
  if (!investigation) return EMPTY_DATASET;

  const ids = new Set(investigation.entityIds);
  const caseIds = new Set(investigation.caseIds);

  const entities = entityPool.filter((e) => ids.has(e.id));
  const relationships = RELATIONSHIPS.filter((r) => ids.has(r.source) && ids.has(r.target));
  const timeline = TIMELINE_EVENTS.filter(
    (t) => t.entityIds.some((id) => ids.has(id)) || (t.caseId ? caseIds.has(t.caseId) : false)
  );
  const alerts = alertPool.filter(
    (a) => (a.entityId ? ids.has(a.entityId) : false) || (a.caseId ? caseIds.has(a.caseId) : false)
  );
  const evidence = EVIDENCE.filter((ev) => ev.entityIds.some((id) => ids.has(id)));
  const predictions = predictionPool.filter((p) => ids.has(p.source) && ids.has(p.target));
  const cases = CASES.filter((c) => caseIds.has(c.id));

  return { entities, relationships, timeline, alerts, evidence, predictions, cases };
}

/** Counts used on investigation cards and the demo center, without a full select. */
export function summarize(investigation: Investigation) {
  const ids = new Set(investigation.entityIds);
  const caseIds = new Set(investigation.caseIds);
  return {
    entities: investigation.entityIds.length,
    relationships: RELATIONSHIPS.filter((r) => ids.has(r.source) && ids.has(r.target)).length,
    events: TIMELINE_EVENTS.filter(
      (t) => t.entityIds.some((id) => ids.has(id)) || (t.caseId ? caseIds.has(t.caseId) : false)
    ).length,
    alerts: ALERTS.filter(
      (a) => (a.entityId ? ids.has(a.entityId) : false) || (a.caseId ? caseIds.has(a.caseId) : false)
    ).length,
    cases: investigation.caseIds.length,
    evidence: EVIDENCE.filter((ev) => ev.entityIds.some((id) => ids.has(id))).length,
  };
}

/** Demo scenarios offered in the Demo Center. */
export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  investigationId: string | null;
  available: boolean;
  /** Where the scenario drops the user, and what it runs on arrival. */
  focusEntityId?: string;
  opening?: 'guided' | 'network' | 'predictions' | 'financial';
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'nightfall',
    title: 'Operation Nightfall',
    subtitle: 'Criminal network investigation',
    description:
      'The full walkthrough: map the network, trace the primary subject, run the intelligence engine, surface a hidden relationship and compile the report.',
    investigationId: SAMPLE_INVESTIGATION.id,
    available: true,
    focusEntityId: 'e01',
    opening: 'guided',
  },
  {
    id: 'financial',
    title: 'Financial Network',
    subtitle: 'Follow suspicious transactions',
    description:
      'Start at the flagged transfer and follow the money through the shell company, the onward transfer and the crypto hops.',
    investigationId: SAMPLE_INVESTIGATION.id,
    available: true,
    focusEntityId: 'e31',
    opening: 'financial',
  },
  {
    id: 'hidden',
    title: 'Hidden Connections',
    subtitle: 'AI-predicted relationships',
    description:
      'Jump straight into prediction triage: candidate relationships that appear in no source record, each with confidence and reasoning.',
    investigationId: SAMPLE_INVESTIGATION.id,
    available: true,
    opening: 'predictions',
  },
];
