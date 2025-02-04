export interface DailyGrowthResult {
  day: number;
  value: number;
}

export function calculateDailyGrowth(
  amount: number, 
  days: number, 
  percentage: number
): DailyGrowthResult[] {
  const dailyRate = percentage / 100 / 365;
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    value: amount * Math.pow(1 + dailyRate, i + 1)
  }));
}

export function calculateTotalGrowth(
  amount: number,
  days: number,
  percentage: number
): number {
  const dailyRate = percentage / 100 / 365;
  return amount * Math.pow(1 + dailyRate, days);
}

export function calculateAnnualizedReturn(
  startValue: number,
  endValue: number,
  daysHeld: number
): number {
  return ((endValue / startValue) ** (365 / daysHeld) - 1) * 100;
} 