import { onMounted } from "vue";
import { loadExchangeRates } from "@/data/exchangeRates";
import { loadFuelPrices } from "@/data/fuelPrices";

export function useCardFuelPrices(): void {
  onMounted(() => {
    void loadFuelPrices();
  });
}

export function useCardExchangeRates(): void {
  onMounted(() => {
    void loadExchangeRates();
  });
}
