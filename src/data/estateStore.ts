// Client-side estate store. Seeded from the presentation sample data until the
// estate ledger-of-record tables are wired up.
import { useSyncExternalStore } from "react";
import { estates as seedEstates, EstateSummary } from "@/data/estateWorkspace";

let store: EstateSummary[] = [...seedEstates];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const estateStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => store,
  add(estate: EstateSummary) {
    store = [estate, ...store];
    emit();
  },
  get(id?: string) {
    return store.find((e) => e.id === id) ?? store[0];
  },
};

export const useEstateList = () =>
  useSyncExternalStore(estateStore.subscribe, estateStore.getSnapshot, estateStore.getSnapshot);

export const useEstate = (id?: string) => {
  const list = useEstateList();
  return list.find((e) => e.id === id) ?? list[0];
};
