import { useMemo } from 'react';
import { useAppState } from '../store/store';
import { selectDataset, type Dataset } from '../data/investigations';
import type { Investigation } from '../types';

/** The active investigation, or null when none is open. */
export function useActiveInvestigation(): Investigation | null {
  const state = useAppState();
  return useMemo(
    () => state.investigations.find((i) => i.id === state.activeInvestigationId) ?? null,
    [state.investigations, state.activeInvestigationId]
  );
}

/**
 * Everything the current investigation contains. Screens read from here rather
 * than importing the sample data, so an empty investigation renders empty.
 */
export function useDataset(): Dataset {
  const state = useAppState();
  const investigation = useActiveInvestigation();
  return useMemo(
    () => selectDataset(investigation, state.entities, state.alerts, state.predictions),
    [investigation, state.entities, state.alerts, state.predictions]
  );
}
