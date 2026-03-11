import { computed, shallowRef } from "vue";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export interface RecentCalcEntry<T> {
  id: string;
  label: string;
  value: T;
  createdAt: string;
}

interface UseRecentCalcsOptions<T> {
  storageKey: string;
  maxItems?: number;
  equals?: (a: RecentCalcEntry<T>, b: RecentCalcEntry<T>) => boolean;
}

export function useRecentCalcs<T>(options: UseRecentCalcsOptions<T>) {
  const maxItems = options.maxItems ?? 5;

  const items = shallowRef<RecentCalcEntry<T>[]>(readItems());

  function readItems(): RecentCalcEntry<T>[] {
    if (!isBrowser()) return [];

    const raw = window.localStorage.getItem(options.storageKey);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persist(next: RecentCalcEntry<T>[]) {
    items.value = next;
    if (!isBrowser()) return;
    window.localStorage.setItem(options.storageKey, JSON.stringify(next));
  }

  function add(entry: Omit<RecentCalcEntry<T>, "createdAt">) {
    const normalized: RecentCalcEntry<T> = {
      ...entry,
      createdAt: new Date().toISOString(),
    };

    const deduped = items.value.filter((item) =>
      options.equals
        ? !options.equals(item, normalized)
        : item.id !== normalized.id
    );

    persist([normalized, ...deduped].slice(0, maxItems));
  }

  function remove(id: string) {
    persist(items.value.filter((item) => item.id !== id));
  }

  function clear() {
    persist([]);
  }

  return {
    items: computed(() => items.value),
    hasItems: computed(() => items.value.length > 0),
    add,
    remove,
    clear,
  };
}
