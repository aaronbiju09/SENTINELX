import {
  User,
  Building2,
  MapPin,
  Smartphone,
  AtSign,
  Globe,
  Bitcoin,
  Landmark,
  ArrowLeftRight,
  Share2,
  HardDrive,
  Car,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';
import type { EntityType, RelationshipType, RiskLevel } from '../types';

/**
 * Each entity type carries its own visual identity: icon, node silhouette and
 * a short technical code used in dense readouts.
 */
export type NodeShape = 'circle' | 'hex' | 'diamond' | 'square';

export const ENTITY_TYPE_META: Record<
  EntityType,
  { label: string; icon: LucideIcon; short: string; shape: NodeShape }
> = {
  PERSON: { label: 'Person', icon: User, short: 'PER', shape: 'circle' },
  ORGANIZATION: { label: 'Organization', icon: Building2, short: 'ORG', shape: 'hex' },
  LOCATION: { label: 'Location', icon: MapPin, short: 'LOC', shape: 'diamond' },
  PHONE: { label: 'Phone', icon: Smartphone, short: 'PHN', shape: 'square' },
  EMAIL: { label: 'Email', icon: AtSign, short: 'EML', shape: 'square' },
  IP_ADDRESS: { label: 'IP Address', icon: Globe, short: 'NET', shape: 'square' },
  CRYPTO_WALLET: { label: 'Crypto Wallet', icon: Bitcoin, short: 'WLT', shape: 'hex' },
  BANK_ACCOUNT: { label: 'Bank Account', icon: Landmark, short: 'BNK', shape: 'hex' },
  TRANSACTION: { label: 'Transaction', icon: ArrowLeftRight, short: 'TXN', shape: 'diamond' },
  SOCIAL_ACCOUNT: { label: 'Social Account', icon: Share2, short: 'SOC', shape: 'square' },
  DEVICE: { label: 'Device', icon: HardDrive, short: 'DEV', shape: 'square' },
  VEHICLE: { label: 'Vehicle', icon: Car, short: 'VEH', shape: 'diamond' },
  CASE: { label: 'Case File', icon: FolderOpen, short: 'CSE', shape: 'hex' },
};

export const RELATIONSHIP_TYPE_LABEL: Record<RelationshipType, string> = {
  OWNS: 'owns',
  USES: 'uses',
  ASSOCIATED_WITH: 'associated with',
  LOCATED_AT: 'located at',
  CONTACTED: 'contacted',
  TRANSFERRED_FUNDS: 'transferred funds to',
  MEMBER_OF: 'member of',
  REGISTERED_TO: 'registered to',
  LINKED_TO: 'linked to',
};

export const RISK_COLOR: Record<RiskLevel, string> = {
  CRITICAL: '#F3474F',
  HIGH: '#F0703B',
  MEDIUM: '#F0A93B',
  LOW: '#2FCB86',
  UNKNOWN: '#6B7687',
};

export const RISK_DIM: Record<RiskLevel, string> = {
  CRITICAL: 'rgba(243,71,79,0.14)',
  HIGH: 'rgba(240,112,59,0.14)',
  MEDIUM: 'rgba(240,169,59,0.14)',
  LOW: 'rgba(47,203,134,0.14)',
  UNKNOWN: 'rgba(107,118,135,0.14)',
};

export const SYSTEM_CYAN = '#22D3E0';

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score > 0) return 'LOW';
  return 'UNKNOWN';
}

export function riskLabel(level: RiskLevel): string {
  return level === 'UNKNOWN' ? 'N/A' : level;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export const EVIDENCE_KIND_LABEL: Record<string, string> = {
  TRANSACTION: 'Transaction',
  CHAT_RECORD: 'Chat Record',
  IP_LOG: 'IP Log',
  DEVICE_MATCH: 'Device Match',
  WALLET_ACTIVITY: 'Wallet Activity',
  LOCATION_DATA: 'Location Data',
  DOCUMENT: 'Document',
};
