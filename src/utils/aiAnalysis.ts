import type { AIAnalysisResult, Entity, EntityType, Relationship } from '../types';

const FINANCIAL_TYPES = new Set<EntityType>(['BANK_ACCOUNT', 'ORGANIZATION']);

/**
 * Flags entities whose immediate neighbors span both the "financial" side of
 * the network (bank accounts / organizations) and the "operational" side
 * (people, phones, vehicles, locations, social, case) — a lightweight,
 * real, deterministic stand-in for a bridge/betweenness signal. This is a
 * SIMULATED analysis for demo purposes, not a production graph algorithm.
 */
function computeIntermediaries(entities: Entity[], relationships: Relationship[]): string[] {
  const entityById = new Map(entities.map((e) => [e.id, e]));
  const groupsByNode = new Map<string, Set<'financial' | 'operational'>>();

  const touch = (nodeId: string, neighborId: string) => {
    const neighbor = entityById.get(neighborId);
    if (!neighbor) return;
    const group: 'financial' | 'operational' = FINANCIAL_TYPES.has(neighbor.type)
      ? 'financial'
      : 'operational';
    if (!groupsByNode.has(nodeId)) groupsByNode.set(nodeId, new Set());
    groupsByNode.get(nodeId)!.add(group);
  };

  for (const r of relationships) {
    touch(r.source, r.target);
    touch(r.target, r.source);
  }

  return entities
    .filter((e) => (groupsByNode.get(e.id)?.size ?? 0) === 2)
    .map((e) => e.id);
}

function describeFundFlow(entities: Entity[], relationships: Relationship[]): string {
  const nameOf = (id: string) => entities.find((e) => e.id === id)?.name ?? id;
  const transfers = relationships
    .filter((r) => r.type === 'TRANSFERRED_FUNDS')
    .sort((a, b) => a.discovered.localeCompare(b.discovered));

  if (transfers.length === 0) return 'No fund-transfer pattern detected in the current dataset.';

  const chainParts = [nameOf(transfers[0].source)];
  for (const t of transfers) chainParts.push(nameOf(t.target));

  if (transfers.length >= 2) {
    const first = new Date(transfers[0].discovered).getTime();
    const last = new Date(transfers[transfers.length - 1].discovered).getTime();
    const days = Math.round((last - first) / 86400000);
    return `Funds moved through a ${transfers.length}-step chain (${chainParts.join(' → ')}) over ${days} days — consistent with layering behaviour.`;
  }
  return `A single flagged transfer was detected: ${chainParts.join(' → ')}.`;
}

export function runAnalysis(entities: Entity[], relationships: Relationship[]): AIAnalysisResult {
  const highRiskCount = entities.filter((e) => e.riskLevel === 'HIGH').length;
  const intermediaries = computeIntermediaries(entities, relationships);

  const bridgeCandidate = entities.find((e) => e.tags.includes('bridge-candidate'));
  const insight = bridgeCandidate
    ? `${bridgeCandidate.name} appears to function as a bridge between two otherwise disconnected clusters — the operational cluster around the primary subject, and the financial cluster around the shell holding company.`
    : intermediaries.length > 0
    ? `${entities.find((e) => e.id === intermediaries[0])?.name ?? 'One entity'} shows the strongest cross-cluster connectivity in the current network.`
    : 'No clear bridge entity identified with the current data.';

  return {
    entityCount: entities.length,
    relationshipCount: relationships.length,
    highRiskCount,
    intermediaries,
    unusualPattern: describeFundFlow(entities, relationships),
    insight,
    generatedAt: new Date().toISOString(),
  };
}
