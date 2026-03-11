import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DCC_MARKUP, getCurrencyQueryValue, getExchangeRate, parseCurrencyQueryValue } from "@/data/exchangeRates";
import { OVERSEAS_CARDS } from "@/data/overseasCards";
import { buildQuery, isSameQuery, parseQueryFloat, queryFirst } from "@/lib/routeState";
import {
  sanitizeCurrency,
  sanitizeDccMarkup,
  sanitizeForeignAmount,
} from "@/lib/validators";
import {
  calculateAllOverseasCards,
  type OverseasCalcInput,
  type OverseasCalcResult,
} from "@/utils/overseasCalculator";

export type OverseasSortKey = "totalCost" | "feeRate" | "benefit";

function parseQueryCurrency(value: unknown) {
  return sanitizeCurrency(parseCurrencyQueryValue(queryFirst(value)));
}

function parseQueryAmount(value: unknown) {
  return sanitizeForeignAmount(parseQueryFloat(value));
}

function parseQueryDcc(value: unknown) {
  const parsed = parseQueryFloat(value);
  const decimal = parsed == null ? null : parsed / 100;
  return sanitizeDccMarkup(decimal, DCC_MARKUP.defaultRate);
}

export function useOverseasCalc() {
  const route = useRoute();
  const router = useRouter();

  const currency = ref(parseQueryCurrency(route.query.currency));
  const foreignAmount = ref(parseQueryAmount(route.query.amount));
  const dccMarkupRate = ref(parseQueryDcc(route.query.dcc));
  const sortKey = ref<OverseasSortKey>("totalCost");

  const rateEntry = computed(() => getExchangeRate(currency.value));

  const calcInput = computed<OverseasCalcInput>(() => ({
    currency: currency.value,
    foreignAmount: foreignAmount.value,
    dccMarkupRate: dccMarkupRate.value,
  }));

  const allResults = computed(() =>
    calculateAllOverseasCards(OVERSEAS_CARDS, calcInput.value, rateEntry.value)
  );

  const sortedResults = computed(() => {
    const sorted = [...allResults.value];

    switch (sortKey.value) {
      case "feeRate":
        sorted.sort((a, b) => a.cardFeeRate - b.cardFeeRate || a.localCurrencyNet - b.localCurrencyNet);
        break;
      case "benefit":
        sorted.sort((a, b) => b.benefitAmount - a.benefitAmount || a.localCurrencyNet - b.localCurrencyNet);
        break;
      case "totalCost":
      default:
        sorted.sort((a, b) => a.localCurrencyNet - b.localCurrencyNet);
        break;
    }

    return sorted;
  });

  const topCards = computed(() => sortedResults.value.slice(0, 3));
  const bestCard = computed<OverseasCalcResult | null>(() => sortedResults.value[0] ?? null);
  const avgDccExtra = computed(() => {
    if (allResults.value.length === 0) return 0;
    const total = allResults.value.reduce((sum, result) => sum + result.dccDifference, 0);
    return Math.round(total / allResults.value.length);
  });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    [currency, foreignAmount, dccMarkupRate],
    () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const nextQuery = buildQuery({
          currency:
            currency.value !== "USD" ? getCurrencyQueryValue(currency.value) : undefined,
          amount: foreignAmount.value !== 100 ? foreignAmount.value : undefined,
          dcc:
            Math.abs(dccMarkupRate.value - DCC_MARKUP.defaultRate) > 0.0001
              ? Math.round(dccMarkupRate.value * 1000) / 10
              : undefined,
        });

        if (!isSameQuery(route.query, nextQuery)) {
          router.replace({ query: nextQuery });
        }
      }, 300);
    },
    { flush: "post" }
  );

  watch(
    () => route.query,
    (query) => {
      currency.value = parseQueryCurrency(query.currency);
      foreignAmount.value = parseQueryAmount(query.amount);
      dccMarkupRate.value = parseQueryDcc(query.dcc);
    }
  );

  return {
    currency,
    foreignAmount,
    dccMarkupRate,
    sortKey,
    rateEntry,
    allResults,
    sortedResults,
    topCards,
    bestCard,
    avgDccExtra,
  };
}
