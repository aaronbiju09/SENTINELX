import type { Entity, RiskFactor } from '../types';

/**
 * Returns the reasons behind an entity's risk score. Authored factors are used
 * where present; otherwise a structural fallback is derived so every entity can
 * answer "why is this risk score what it is?" rather than only asserting it.
 */
export function explainRisk(entity: Entity, connectionCount: number): RiskFactor[] {
  if (entity.riskFactors && entity.riskFactors.length > 0) return entity.riskFactors;
  const factors: RiskFactor[] = [];
  if (connectionCount > 0) {
    factors.push({
      label: 'Network connectivity',
      weight: Math.min(30, connectionCount * 6),
      detail: `${connectionCount} recorded relationship${connectionCount === 1 ? '' : 's'} in the current network.`,
    });
  }
  if (entity.flagged) {
    factors.push({ label: 'Analyst flag', weight: 20, detail: 'Manually flagged for review by an investigator.' });
  }
  if (factors.length === 0) {
    factors.push({ label: 'Baseline', weight: entity.riskScore, detail: 'No specific escalating indicators recorded.' });
  }
  return factors;
}
