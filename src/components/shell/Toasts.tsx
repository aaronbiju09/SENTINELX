import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useAppState } from '../../store/store';
import { useActions } from '../../hooks/useActions';
import type { Toast } from '../../types';

const TONE: Record<Toast['tone'], { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: '#22D3E0' },
  success: { icon: CheckCircle2, color: '#2FCB86' },
  warning: { icon: AlertTriangle, color: '#F0A93B' },
  danger: { icon: XCircle, color: '#F3474F' },
};

export function Toasts() {
  const state = useAppState();
  const { dismissToast } = useActions();

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[150] flex w-72 flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {state.toasts.map((t) => {
          const cfg = TONE[t.tone];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="pointer-events-auto flex items-start gap-2 border border-line bg-panel/95 px-3 py-2.5 backdrop-blur cut-tr"
              style={{ borderLeftColor: cfg.color, borderLeftWidth: 2 }}
            >
              <Icon className="mt-px h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
              <p className="flex-1 text-[11px] leading-snug text-steel-300">{t.message}</p>
              <button onClick={() => dismissToast(t.id)} className="shrink-0 text-steel-700 hover:text-paper">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
