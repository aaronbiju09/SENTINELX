import { motion } from 'framer-motion';

/** Standard page chrome for every platform section. */
export function SectionPage({
  title,
  subtitle,
  actions,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="h-full overflow-y-auto scrollbar-thin"
    >
      <div className={`mx-auto px-4 pb-24 pt-6 ${wide ? 'max-w-[1500px]' : 'max-w-6xl'}`}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-paper">{title}</h1>
            {subtitle && <p className="mt-0.5 max-w-2xl text-[11px] leading-relaxed text-steel-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </motion.div>
  );
}

/** Shared empty state — real products have them, so this one does too. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  actions,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-edge bg-panel/30 px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center border border-line bg-raise/50">
        <Icon className="h-5 w-5 text-steel-600" />
      </span>
      <div>
        <p className="font-display text-base font-semibold text-steel-200">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-steel-500">{body}</p>
      </div>
      {actions && <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
