// ---------------------------------------------------------------------------
// SENTINELX — core data model
// All data in this application is FICTIONAL, generated for demonstration.
// ---------------------------------------------------------------------------

export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'PHONE'
  | 'EMAIL'
  | 'IP_ADDRESS'
  | 'CRYPTO_WALLET'
  | 'BANK_ACCOUNT'
  | 'TRANSACTION'
  | 'SOCIAL_ACCOUNT'
  | 'DEVICE'
  | 'VEHICLE'
  | 'CASE';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type EntityStatus = 'ACTIVE' | 'MONITORING' | 'CLEARED' | 'ARCHIVED';

export type RelationshipType =
  | 'OWNS'
  | 'USES'
  | 'ASSOCIATED_WITH'
  | 'LOCATED_AT'
  | 'CONTACTED'
  | 'TRANSFERRED_FUNDS'
  | 'MEMBER_OF'
  | 'REGISTERED_TO'
  | 'LINKED_TO';

/** A single contributing reason behind an entity's risk score. */
export interface RiskFactor {
  label: string;
  weight: number; // points contributed toward the 0-100 score
  detail: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  status: EntityStatus;
  summary: string;
  notes: string;
  flagged: boolean;
  caseIds: string[];
  tags: string[];
  meta?: Record<string, string>;
  riskFactors?: RiskFactor[];
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  strength: number; // 1-10
  discovered: string; // ISO date
  notes?: string;
  inferred?: boolean; // AI-predicted, unconfirmed
  suspicious?: boolean; // renders with travelling particles
}

export type EvidenceKind =
  | 'TRANSACTION'
  | 'CHAT_RECORD'
  | 'IP_LOG'
  | 'DEVICE_MATCH'
  | 'WALLET_ACTIVITY'
  | 'LOCATION_DATA'
  | 'DOCUMENT';

export interface EvidenceItem {
  id: string;
  ref: string; // e.g. EV-0184
  kind: EvidenceKind;
  title: string;
  collected: string; // ISO date
  entityIds: string[];
  caseId: string;
  summary: string;
  /** Rendered as a key/value readout inside the evidence viewer. */
  fields: Record<string, string>;
  integrity: 'VERIFIED' | 'UNVERIFIED';
}

/** An AI-predicted relationship the investigator can triage. */
export type PredictionVerdict = 'PENDING' | 'CONFIRMED' | 'INVESTIGATING' | 'DISMISSED';

export interface LinkPrediction {
  id: string;
  source: string;
  target: string;
  confidence: number; // 0-100
  reasons: string[];
  verdict: PredictionVerdict;
}

export type TimelineEventType =
  | 'REGISTRATION'
  | 'CONNECTION'
  | 'ALERT'
  | 'CASE_UPDATE'
  | 'ANALYSIS'
  | 'TRANSACTION';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  entityIds: string[];
  evidenceIds?: string[];
  caseId?: string;
  type: TimelineEventType;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  timestamp: string;
  entityId?: string;
  caseId?: string;
  read: boolean;
}

export type CasePriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus = 'OPEN' | 'PENDING' | 'CLOSED';

export interface CaseFile {
  id: string;
  code: string;
  name: string;
  priority: CasePriority;
  status: CaseStatus;
  entityIds: string[];
  openedDate: string;
  leadAnalyst: string;
  summary: string;
  threatLevel: RiskLevel;
}

export interface Toast {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
  createdAt: number;
}

/** Top-level product sections. */
export type SectionId =
  | 'home'
  | 'investigations'
  | 'network'
  | 'intelligence'
  | 'risk'
  | 'cases'
  | 'evidence'
  | 'alerts'
  | 'reports'
  | 'registry'
  | 'demo'
  | 'system';

/** Which shell the user is currently in. */
export type AppPhase = 'landing' | 'platform';

export type InvestigationPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type InvestigationStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

/**
 * An investigation is the unit of work in SENTINELX. It owns a slice of the
 * entity pool, so every screen renders whatever the active investigation
 * contains rather than a hardcoded dataset. A user-created investigation
 * starts empty, which is what drives the empty states.
 */
export interface Investigation {
  id: string;
  name: string;
  description: string;
  priority: InvestigationPriority;
  status: InvestigationStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  /** SAMPLE data ships with the prototype; USER data is created in-session. */
  source: 'SAMPLE' | 'USER';
  entityIds: string[];
  caseIds: string[];
}

/** Guided-demo state for live presentation. */
export interface DemoState {
  active: boolean;
  scenarioId: string | null;
  /** Cinematic intro is playing. */
  intro: boolean;
  guided: boolean;
  step: number;
}

export interface TraceLogLine {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

export interface TraceState {
  active: boolean;
  rootId: string | null;
  highlighted: string[];
  log: TraceLogLine[];
}

export interface AIAnalysisResult {
  entityCount: number;
  relationshipCount: number;
  highRiskCount: number;
  intermediaries: string[];
  unusualPattern: string;
  insight: string;
  generatedAt: string;
}

/** Stages of the cinematic AI trace sequence. */
export interface AIStage {
  id: string;
  label: string;
  done: boolean;
}

export interface AIState {
  running: boolean;
  stages: AIStage[];
  result: AIAnalysisResult | null;
  /** True while the graph is in "prediction triage" mode. */
  predictionMode: boolean;
}
