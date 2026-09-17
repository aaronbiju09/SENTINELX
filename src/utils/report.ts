import type { AIAnalysisResult, CaseFile, Entity, Relationship, TimelineEvent } from '../types';
import { PRODUCT_NAME, TEAM_NAME, SIH_INFO } from '../data/product';
import { formatDate } from './entityMeta';

export function buildReportText(
  caseFile: CaseFile,
  entities: Entity[],
  relationships: Relationship[],
  timelineEvents: TimelineEvent[],
  analysis: AIAnalysisResult
): string {
  const lines: string[] = [];
  lines.push(`${PRODUCT_NAME} — INTELLIGENCE REPORT`);
  lines.push(`Team ${TEAM_NAME} · ${SIH_INFO.id} · ${SIH_INFO.ministry}`);
  lines.push('SIMULATED / DEMO DATA — for prototype demonstration only');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push('CASE INFORMATION');
  lines.push(`  Case: ${caseFile.code} — ${caseFile.name}`);
  lines.push(`  Status: ${caseFile.status}   Priority: ${caseFile.priority}`);
  lines.push(`  Lead analyst: ${caseFile.leadAnalyst}`);
  lines.push(`  Opened: ${formatDate(caseFile.openedDate)}`);
  lines.push('');
  lines.push('INVESTIGATION SUMMARY');
  lines.push(`  ${caseFile.summary}`);
  lines.push('');
  lines.push('NETWORK STATISTICS');
  lines.push(`  Entities analyzed: ${analysis.entityCount}`);
  lines.push(`  Relationships mapped: ${analysis.relationshipCount}`);
  lines.push(`  High-risk entities: ${analysis.highRiskCount}`);
  lines.push(`  Potential intermediaries: ${analysis.intermediaries.length}`);
  lines.push('');
  lines.push('RISK ASSESSMENT');
  const highRisk = entities.filter((e) => e.riskLevel === 'HIGH').sort((a, b) => b.riskScore - a.riskScore);
  for (const e of highRisk) lines.push(`  [HIGH ${e.riskScore}] ${e.name} (${e.type})`);
  lines.push('');
  lines.push('KEY ENTITIES');
  for (const id of caseFile.entityIds.slice(0, 12)) {
    const e = entities.find((x) => x.id === id);
    if (e) lines.push(`  - ${e.name} — ${e.type} — risk ${e.riskLevel}${e.riskLevel !== 'UNKNOWN' ? ` (${e.riskScore})` : ''}`);
  }
  lines.push('');
  lines.push('TIMELINE');
  for (const t of timelineEvents.filter((t) => t.caseId === caseFile.id).sort((a, b) => a.date.localeCompare(b.date))) {
    lines.push(`  ${formatDate(t.date)} — ${t.title}`);
  }
  lines.push('');
  lines.push('KEY FINDINGS (SIMULATED AI ANALYSIS)');
  lines.push(`  - ${analysis.insight}`);
  lines.push(`  - ${analysis.unusualPattern}`);
  lines.push('');
  lines.push('-'.repeat(60));
  lines.push(`Generated ${new Date(analysis.generatedAt).toLocaleString('en-IN')}`);
  lines.push(`${PRODUCT_NAME} is a frontend prototype. All entities and events are fictional.`);
  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
