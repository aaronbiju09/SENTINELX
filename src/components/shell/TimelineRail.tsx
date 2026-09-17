import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, X, Paperclip } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import { useDataset } from '../../hooks/useDataset';
import { formatDateShort } from '../../utils/entityMeta';
import type { TimelineEventType } from '../../types';

const TYPE_COLOR: Record<TimelineEventType, string> = {
  REGISTRATION: '#6B7687',
  CONNECTION: '#22D3E0',
  ALERT: '#F3474F',
  CASE_UPDATE: '#8C97A8',
  ANALYSIS: '#2FCB86',
  TRANSACTION: '#F0A93B',
};

export function TimelineRail() {
  const state = useAppState();
  const actions = useActions();
  const data = useDataset();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const events = useMemo(
    () => [...data.timeline].sort((a, b) => a.date.localeCompare(b.date)),
    [data.timeline]
  );

  // Keep the cursor valid when the investigation changes.
  useEffect(() => {
    setIndex((i) => (i >= events.length ? 0 : i));
  }, [events.length]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setIndex((i) => {
        if (i >= events.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 1500);
    return () => clearInterval(t);
  }, [playing, events.length]);

  const current = events[index];

  // Timeline drives the canvas: selecting an event spotlights its entities.
  useEffect(() => {
    if (state.timelineOpen && current) actions.setSpotlight(current.entityIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, state.timelineOpen]);

  useEffect(() => {
    if (!state.timelineOpen) actions.setSpotlight(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timelineOpen]);

  useEffect(() => {
    const node = scrollerRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`);
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  const evidenceForCurrent = current?.evidenceIds?.map((id) => data.evidence.find((e) => e.id === id)).filter(Boolean) ?? [];

  return (
    <AnimatePresence>
      {state.timelineOpen && (
        <motion.div
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="pointer-events-auto absolute inset-x-0 bottom-20 z-30 mx-3 border border-line bg-panel/93 backdrop-blur-md cut-both"
        >
          <div className="flex items-center gap-3 border-b border-line px-3 py-2">
            <span className="tech text-[9px] text-system">Investigation timeline</span>
            <div className="flex items-center gap-1">
              <Transport icon={SkipBack} onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} />
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex h-6 w-6 items-center justify-center border border-system-line bg-system-dim text-system"
              >
                {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 translate-x-[1px]" />}
              </button>
              <Transport
                icon={SkipForward}
                onClick={() => setIndex((i) => Math.min(events.length - 1, i + 1))}
                disabled={index === events.length - 1}
              />
            </div>
            <span className="tech text-[9px] text-steel-600">
              {index + 1} / {events.length}
            </span>
            {current && (
              <span className="hidden truncate text-[11px] text-paper md:block">
                <span className="tech mr-2 text-steel-600">{formatDateShort(current.date)}</span>
                {current.title}
              </span>
            )}
            {evidenceForCurrent.length > 0 && (
              <div className="ml-auto hidden items-center gap-1 lg:flex">
                {evidenceForCurrent.map((ev) => (
                  <button
                    key={ev!.id}
                    onClick={() => actions.openEvidence(ev!.id)}
                    className="tech flex items-center gap-1 border border-line px-1.5 py-1 text-[8px] text-steel-400 transition-colors hover:border-system-line hover:text-system"
                  >
                    <Paperclip className="h-2.5 w-2.5" />
                    {ev!.ref}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => actions.toggleTimeline(false)}
              className={`text-steel-600 hover:text-paper ${evidenceForCurrent.length > 0 ? 'lg:ml-0' : 'ml-auto'}`}
              aria-label="Close timeline"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div ref={scrollerRef} className="relative overflow-x-auto scrollbar-thin">
            <div className="relative flex min-w-max items-start gap-0 px-6 py-4">
              <div className="absolute left-6 right-6 top-[30px] h-px bg-line" />
              {events.map((e, i) => {
                const active = i === index;
                const past = i < index;
                const color = TYPE_COLOR[e.type];
                return (
                  <button
                    key={e.id}
                    data-idx={i}
                    onClick={() => {
                      setIndex(i);
                      setPlaying(false);
                    }}
                    className="relative flex w-[132px] shrink-0 flex-col items-center px-1 text-center"
                  >
                    <span className="tech mb-2 text-[8px] text-steel-600">{formatDateShort(e.date)}</span>
                    <span className="relative flex h-3 w-3 items-center justify-center">
                      {active && (
                        <motion.span
                          layoutId="tl-active"
                          className="absolute h-3 w-3 rounded-full"
                          style={{ backgroundColor: color, opacity: 0.35 }}
                        />
                      )}
                      <span
                        className="h-1.5 w-1.5 rounded-full transition-transform"
                        style={{
                          backgroundColor: active || past ? color : '#2A3342',
                          transform: active ? 'scale(1.6)' : 'scale(1)',
                        }}
                      />
                    </span>
                    <motion.span
                      animate={{ opacity: active ? 1 : 0.55 }}
                      className={`mt-2 text-[10px] leading-tight ${active ? 'text-paper' : 'text-steel-500'}`}
                    >
                      {e.title}
                    </motion.span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Transport({ icon: Icon, onClick, disabled }: { icon: typeof SkipBack; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center border border-line text-steel-500 transition-colors hover:text-paper disabled:opacity-25"
    >
      <Icon className="h-3 w-3" />
    </button>
  );
}
