import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import type { Entity, Relationship } from '../types';

export interface SimNode extends Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
  index?: number;
}

export interface SimLink extends Omit<Relationship, 'source' | 'target'> {
  source: SimNode;
  target: SimNode;
}

export interface GraphLayout {
  nodes: SimNode[];
  links: SimLink[];
  width: number;
  height: number;
}

/** Deterministic PRNG so the converged layout is identical on every load. */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function computeLayout(
  entities: Entity[],
  relationships: Relationship[],
  width = 1600,
  height = 1000
): GraphLayout {
  const rand = seededRandom(1337);

  const nodes: SimNode[] = entities.map((e, i) => {
    const angle = (i / entities.length) * Math.PI * 2;
    const radius = 220 + rand() * 300;
    return {
      ...e,
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    };
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));

  const links: SimLink[] = relationships
    .map((r) => {
      const source = byId.get(r.source);
      const target = byId.get(r.target);
      if (!source || !target) return null;
      const { source: _s, target: _t, ...rest } = r;
      return { ...rest, source, target } as SimLink;
    })
    .filter((l): l is SimLink => l !== null);

  const sim = forceSimulation(nodes)
    .force(
      'link',
      forceLink<SimNode, SimLink>(links)
        .id((d) => d.id)
        .distance((l) => 190 - Math.min(l.strength, 10) * 7)
        .strength((l) => 0.2 + Math.min(l.strength, 10) * 0.025)
    )
    .force('charge', forceManyBody().strength(-420))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide<SimNode>().radius((d) => (d.type === 'CASE' ? 46 : 38)))
    .force('x', forceX(width / 2).strength(0.028))
    .force('y', forceY(height / 2).strength(0.028))
    .stop();

  for (let i = 0; i < 420; i++) sim.tick();

  const pad = 70;
  for (const n of nodes) {
    n.x = Math.max(pad, Math.min(width - pad, n.x));
    n.y = Math.max(pad, Math.min(height - pad, n.y));
  }

  return { nodes, links, width, height };
}

/** Adjacency map for traversal helpers. */
export function buildAdjacency(relationships: Relationship[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const touch = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const r of relationships) {
    touch(r.source, r.target);
    touch(r.target, r.source);
  }
  return adj;
}

export function countConnectedComponents(entities: Entity[], relationships: Relationship[]): number {
  const adj = buildAdjacency(relationships);
  const seen = new Set<string>();
  let components = 0;
  for (const e of entities) {
    if (seen.has(e.id)) continue;
    components += 1;
    const queue = [e.id];
    seen.add(e.id);
    while (queue.length) {
      const cur = queue.shift()!;
      for (const n of adj.get(cur) ?? []) {
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
  }
  return components;
}
