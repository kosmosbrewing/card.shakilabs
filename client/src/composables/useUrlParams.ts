import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { buildQuery, isSameQuery, normalizeQuery } from "@/lib/routeState";

type QueryPrimitive = string | number | boolean | null | undefined;

export function useUrlParams() {
  const route = useRoute();
  const router = useRouter();

  const params = computed(() => normalizeQuery(route.query));

  async function replaceParams(input: Record<string, QueryPrimitive>): Promise<void> {
    const nextQuery = buildQuery(input);
    if (isSameQuery(route.query, nextQuery)) return;
    await router.replace({ query: nextQuery });
  }

  async function mergeParams(input: Record<string, QueryPrimitive>): Promise<void> {
    const nextQuery = buildQuery({
      ...normalizeQuery(route.query),
      ...input,
    });
    if (isSameQuery(route.query, nextQuery)) return;
    await router.replace({ query: nextQuery });
  }

  async function clearParams(keys?: string[]): Promise<void> {
    if (!keys || keys.length === 0) {
      if (Object.keys(route.query).length === 0) return;
      await router.replace({ query: {} });
      return;
    }

    const next = { ...normalizeQuery(route.query) };
    for (const key of keys) {
      delete next[key];
    }

    if (isSameQuery(route.query, next)) return;
    await router.replace({ query: next });
  }

  return {
    params,
    replaceParams,
    mergeParams,
    clearParams,
  };
}
