import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Maximize2, Minus, Plus, ScanEye } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { computeLayout, type SimLink } from '../../utils/graphLayout';
import { ENTITY_TYPE_META, RISK_COLOR, SYSTEM_CYAN, type NodeShape } from '../../utils/entityMeta';

const W = 1600;
const H = 1000;

interface Drag {
  mode: 'pan' | 'node';
  nodeId?: string;
  lastX: number;
  lastY: number;
  ratio: number;
  moved: number;
}

function shapePath(shape: NodeShape, r: number): string {
  switch (shape) {
    case 'hex': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
      });
      return `M${pts.join('L')}Z`;
    }
    case 'diamond':
      return `M0,${-r}L${r},0L0,${r}L${-r},0Z`;
    case 'square': {
      const s = r * 0.86;
      return `M${-s},${-s}H${s}V${s}H${-s}Z`;
    }
    default: {
      // circle as a path so every node uses the same primitive
      return `M0,${-r}A${r},${r} 0 1,1 0,${r}A${r},${r} 0 1,1 0,${-r}Z`;
    }
  }
}

/** Particles travelling along a suspicious edge — data in motion. */
function EdgeParticles({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const count = Math.max(2, Math.min(4, Math.round(len / 90)));
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.circle
          key={i}
          r={1.9}
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2.1,
            delay: (i * 2.1) / count,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.12, 0.85, 1],
          }}
        />
      ))}
    </>
  );
}

export function NetworkCanvas() {
  const state = useAppState();
  const { focus, resetTrace, judgePrediction, investigate, exitPredictionMode } = useActions();

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);

  const data = useDataset();
  const layout = useMemo(
    () => computeLayout(data.entities, data.relationships, W, H),
    [data.entities, data.relationships]
  );
  const liveById = useMemo(() => new Map(data.entities.map((e) => [e.id, e])), [data.entities]);
  const posById = useRef<Record<string, { x: number; y: number }>>({});
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Reset node positions whenever the underlying layout changes (new investigation).
  useEffect(() => {
    posById.current = Object.fromEntries(layout.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
    setPositions(posById.current);
  }, [layout]);

  const [camera, setCamera] = useState({ x: 0, y: 0, k: 1 });
  const [isolate, setIsolate] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => setEpoch((e) => e + 1), [state.canvasEpoch]);

  const zoomBy = useCallback((factor: number) => {
    setCamera((cam) => {
      const k = Math.max(0.45, Math.min(2.6, cam.k * factor));
      const cx = W / 2;
      const cy = H / 2;
      const lx = (cx - cam.x) / cam.k;
      const ly = (cy - cam.y) / cam.k;
      return { x: cx - k * lx, y: cy - k * ly, k };
    });
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.11 : 0.9);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  // WOW #4 — camera glides to the focused entity and the network reorganizes around it
  useEffect(() => {
    if (!state.focusId) return;
    const p = posById.current[state.focusId];
    if (!p) return;
    const k = 1.42;
    setCamera({ x: W / 2 - p.x * k, y: H / 2 - p.y * k, k });
  }, [state.focusId]);

  function ratio() {
    const rect = svgRef.current?.getBoundingClientRect();
    return rect && rect.width ? W / rect.width : 1;
  }

  function onPanDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { mode: 'pan', lastX: e.clientX, lastY: e.clientY, ratio: ratio(), moved: 0 };
  }

  function onNodeDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { mode: 'node', nodeId: id, lastX: e.clientX, lastY: e.clientY, ratio: ratio(), moved: 0 };
  }

  function onMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.lastX) * d.ratio;
    const dy = (e.clientY - d.lastY) * d.ratio;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    if (d.mode === 'pan') {
      setCamera((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
    } else if (d.nodeId) {
      const id = d.nodeId;
      const cur = posById.current[id];
      posById.current = { ...posById.current, [id]: { x: cur.x + dx / camera.k, y: cur.y + dy / camera.k } };
      setPositions(posById.current);
    }
  }

  function onUp() {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.moved < 5) {
      if (d.mode === 'node' && d.nodeId) {
        if (state.trace.active && state.trace.rootId !== d.nodeId) resetTrace();
        focus(state.focusId === d.nodeId ? null : d.nodeId);
      } else {
        focus(null);
      }
    }
  }

  const activeCase = data.cases.find((c) => c.id === state.activeCaseId);

  const emphasis = useMemo(() => {
    if (state.spotlightIds?.length) return new Set(state.spotlightIds);
    if (state.trace.active) return new Set(state.trace.highlighted);
    if (state.focusId) {
      const s = new Set([state.focusId]);
      for (const l of layout.links) {
        if (l.source.id === state.focusId) s.add(l.target.id);
        if (l.target.id === state.focusId) s.add(l.source.id);
      }
      return s;
    }
    if (activeCase) return new Set(activeCase.entityIds);
    return null;
  }, [state.spotlightIds, state.trace.active, state.trace.highlighted, state.focusId, activeCase, layout.links]);

  const hasEmph = emphasis !== null && emphasis.size > 0;
  const predMode = state.ai.predictionMode;

  const visibleNodes = useMemo(
    () => (isolate && hasEmph ? layout.nodes.filter((n) => emphasis!.has(n.id)) : layout.nodes),
    [isolate, hasEmph, emphasis, layout.nodes]
  );
  const visibleLinks = useMemo(
    () => (isolate && hasEmph ? layout.links.filter((l) => emphasis!.has(l.source.id) && emphasis!.has(l.target.id)) : layout.links),
    [isolate, hasEmph, emphasis, layout.links]
  );

  function nodeOpacity(id: string) {
    if (predMode) {
      const inPred = data.predictions.some((p) => p.source === id || p.target === id);
      return inPred ? 1 : 0.18;
    }
    if (!hasEmph) return 1;
    return emphasis!.has(id) ? 1 : 0.13;
  }

  function linkOpacity(l: SimLink) {
    if (predMode) return 0.05;
    if (!hasEmph) return 0.5;
    return emphasis!.has(l.source.id) && emphasis!.has(l.target.id) ? 0.95 : 0.05;
  }

  const activePredictions = data.predictions.filter((p) => p.verdict === 'PENDING' || p.verdict === 'INVESTIGATING');

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-grid-coarse bg-gridlg opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-vignette" />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="relative h-full w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <defs>
          <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x={0} y={0} width={W} height={H} fill="transparent" onPointerDown={onPanDown} className="cursor-grab active:cursor-grabbing" />

        <motion.g
          animate={{ x: camera.x, y: camera.y, scale: camera.k }}
          transition={{ type: 'spring', stiffness: 120, damping: 24, mass: 0.7 }}
          style={{ originX: 0, originY: 0 }}
        >
          {/* Confirmed relationships */}
          <g>
            {visibleLinks.map((l) => {
              const p1 = positions[l.source.id] ?? l.source;
              const p2 = positions[l.target.id] ?? l.target;
              const op = linkOpacity(l);
              const suspicious = l.suspicious;
              const color = l.inferred ? SYSTEM_CYAN : suspicious ? RISK_COLOR.MEDIUM : '#3E4757';
              return (
                <g key={l.id} opacity={op}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={color}
                    strokeWidth={suspicious ? 1.8 : 1.1}
                    strokeDasharray={l.inferred ? '5 5' : undefined}
                  />
                  {suspicious && op > 0.3 && <EdgeParticles x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} color={RISK_COLOR.MEDIUM} />}
                </g>
              );
            })}
          </g>

          {/* WOW #3 — predicted links assemble under analysis */}
          <AnimatePresence>
            {predMode &&
              activePredictions.map((p, i) => {
                const a = positions[p.source];
                const b = positions[p.target];
                if (!a || !b) return null;
                const mx = (a.x + b.x) / 2;
                const my = (a.y + b.y) / 2;
                return (
                  <motion.g key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.25 }}>
                    <motion.line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={SYSTEM_CYAN}
                      strokeWidth={1.6}
                      strokeDasharray="6 6"
                      className="animate-dash-travel"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: i * 0.25 }}
                    />
                    <motion.g
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.25 + 0.5 }}
                      style={{ originX: `${mx}px`, originY: `${my}px` }}
                    >
                      <rect x={mx - 26} y={my - 11} width={52} height={22} rx={3} fill="#0E1219" stroke={SYSTEM_CYAN} strokeOpacity={0.5} />
                      <text x={mx} y={my + 4} textAnchor="middle" style={{ fontSize: 11, fill: SYSTEM_CYAN, fontFamily: 'IBM Plex Mono, monospace' }}>
                        {p.confidence}%
                      </text>
                    </motion.g>
                  </motion.g>
                );
              })}
          </AnimatePresence>

          {/* Entities */}
          <g>
            {visibleNodes.map((n, i) => {
              const live = liveById.get(n.id) ?? n;
              const pos = positions[n.id] ?? n;
              const meta = ENTITY_TYPE_META[n.type];
              const Icon = meta.icon;
              const color = RISK_COLOR[live.riskLevel];
              const r = n.type === 'CASE' ? 24 : 19;
              const selected = state.focusId === n.id;
              const hovered = hoverId === n.id;
              const severe = live.riskLevel === 'CRITICAL' || live.riskLevel === 'HIGH';
              const op = nodeOpacity(n.id);

              return (
                <motion.g
                  key={`${n.id}-${epoch}`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: op, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.012, 0.5), type: 'spring', stiffness: 220, damping: 22 }}
                  style={{ x: pos.x, y: pos.y }}
                  className="cursor-pointer"
                  onPointerDown={(e) => onNodeDown(e, n.id)}
                  onPointerEnter={() => setHoverId(n.id)}
                  onPointerLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                >
                  {severe && op > 0.5 && (
                    <path d={shapePath(meta.shape, r + 5)} fill="none" stroke={color} strokeWidth={1} opacity={0.5} className="animate-risk-pulse" />
                  )}
                  {(selected || hovered) && (
                    <path d={shapePath(meta.shape, r + 9)} fill="none" stroke={selected ? SYSTEM_CYAN : color} strokeWidth={1.2} opacity={0.75} />
                  )}
                  <path
                    d={shapePath(meta.shape, r)}
                    fill="#0B0F16"
                    stroke={color}
                    strokeWidth={selected ? 2.2 : 1.5}
                    filter={severe && op > 0.5 ? 'url(#nodeGlow)' : undefined}
                  />
                  <foreignObject x={-9} y={-9} width={18} height={18} className="pointer-events-none">
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon size={13} color={color} strokeWidth={2.2} />
                    </div>
                  </foreignObject>
                  {live.flagged && <circle cx={r - 3} cy={-r + 3} r={3.4} fill={RISK_COLOR.CRITICAL} stroke="#0B0F16" strokeWidth={1} />}

                  <text
                    y={r + 15}
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                    style={{
                      fontSize: 10,
                      fill: selected ? '#E9EDF4' : '#6B7687',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: selected ? 600 : 500,
                    }}
                  >
                    {n.name.length > 24 ? `${n.name.slice(0, 23)}…` : n.name}
                  </text>
                  {(selected || hovered) && live.riskLevel !== 'UNKNOWN' && (
                    <text
                      y={r + 27}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      style={{ fontSize: 9, fill: color, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.1em' }}
                    >
                      {meta.short} · {live.riskScore}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </g>
        </motion.g>
      </svg>

      {/* Canvas controls — bottom right, out of the way */}
      <div className="absolute bottom-24 right-4 flex flex-col gap-1">
        <CanvasBtn onClick={() => zoomBy(1.25)} title="Zoom in"><Plus className="h-3.5 w-3.5" /></CanvasBtn>
        <CanvasBtn onClick={() => zoomBy(0.8)} title="Zoom out"><Minus className="h-3.5 w-3.5" /></CanvasBtn>
        <CanvasBtn onClick={() => setCamera({ x: 0, y: 0, k: 1 })} title="Reset view"><Maximize2 className="h-3.5 w-3.5" /></CanvasBtn>
        <CanvasBtn onClick={() => setIsolate((v) => !v)} active={isolate} disabled={!hasEmph} title="Isolate selection">
          <ScanEye className="h-3.5 w-3.5" />
        </CanvasBtn>
      </div>

      {!state.focusId && !state.trace.active && !predMode && (
        <div className="pointer-events-none absolute bottom-24 left-4 flex items-center gap-1.5 text-[10px] text-steel-600">
          <Crosshair className="h-3 w-3" />
          <span className="tech">Select a node to investigate · drag to reposition · scroll to zoom</span>
        </div>
      )}

      {/* WOW #3 — prediction triage */}
      <AnimatePresence>
        {predMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-20 w-72 space-y-2"
          >
            <div className="cut-tr border border-system-line bg-panel/95 p-3 backdrop-blur">
              <p className="tech text-[10px] text-system">Candidate relationships</p>
              <p className="mt-1 text-[11px] leading-relaxed text-steel-500">
                Predicted links not present in the source records. Triage each before it enters the case.
              </p>
            </div>
            {activePredictions.map((p) => {
              const a = data.entities.find((e) => e.id === p.source);
              const b = data.entities.find((e) => e.id === p.target);
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="cut-tr border border-line bg-panel/95 p-3 backdrop-blur"
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-lg font-bold text-system">{p.confidence}%</p>
                    <span className="tech text-[9px] text-steel-600">{p.verdict}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-paper">
                    {a?.name} <span className="text-steel-600">↔</span> {b?.name}
                  </p>
                  <ul className="mt-1.5 space-y-0.5">
                    {p.reasons.map((r) => (
                      <li key={r} className="flex gap-1.5 text-[10px] leading-snug text-steel-500">
                        <span className="text-steel-700">·</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    <TriageBtn tone="verify" onClick={() => judgePrediction(p.id, 'CONFIRMED')}>Confirm</TriageBtn>
                    <TriageBtn
                      tone="warn"
                      onClick={() => {
                        judgePrediction(p.id, 'INVESTIGATING');
                        exitPredictionMode();
                        investigate(p.target);
                      }}
                    >
                      Investigate
                    </TriageBtn>
                    <TriageBtn tone="steel" onClick={() => judgePrediction(p.id, 'DISMISSED')}>Dismiss</TriageBtn>
                  </div>
                </motion.div>
              );
            })}
            {activePredictions.length === 0 && (
              <div className="cut-tr border border-line bg-panel/95 p-4 text-center text-[11px] text-steel-500 backdrop-blur">
                All candidates triaged.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CanvasBtn({
  children,
  onClick,
  title,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`border p-2 backdrop-blur transition-colors disabled:opacity-25 ${
        active ? 'border-system-line bg-system-dim text-system' : 'border-line bg-panel/80 text-steel-500 hover:text-paper'
      }`}
    >
      {children}
    </button>
  );
}

function TriageBtn({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: 'verify' | 'warn' | 'steel';
}) {
  const cls =
    tone === 'verify'
      ? 'border-verify/40 text-verify hover:bg-verify/10'
      : tone === 'warn'
      ? 'border-warn/40 text-warn hover:bg-warn/10'
      : 'border-line text-steel-500 hover:text-paper';
  return (
    <button onClick={onClick} className={`tech border px-1 py-1.5 text-[9px] transition-colors ${cls}`}>
      {children}
    </button>
  );
}
