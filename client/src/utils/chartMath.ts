export function positiveBarWidth(value: number | null, maximum: number): number {
  if (value === null || !Number.isFinite(value) || value <= 0 || maximum <= 0) return 0;
  return Math.min(100, (value / maximum) * 100);
}

export function divergingBarWidth(value: number, maximumMagnitude: number): number {
  if (!Number.isFinite(value) || maximumMagnitude <= 0) return 0;
  return Math.min(50, (Math.abs(value) / maximumMagnitude) * 50);
}

export function progressBarWidth(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return Math.min(100, rate * 100);
}

export function normalizeSegments(values: readonly number[]): number[] {
  const safeValues = values.map((value) => Number.isFinite(value) && value > 0 ? value : 0);
  const total = safeValues.reduce((sum, value) => sum + value, 0);
  return total > 0 ? safeValues.map((value) => value / total) : safeValues;
}
