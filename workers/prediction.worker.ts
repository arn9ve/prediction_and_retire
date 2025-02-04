self.onmessage = (e) => {
  const { amount, days, percentage } = e.data;
  const results = performHeavyCalculations(amount, days, percentage);
  postMessage(results);
};

function performHeavyCalculations(amount: number, days: number, percentage: number) {
  const dailyRate = percentage / 100 / 365;
  const optimizedResults = {
    projections: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      value: amount * Math.pow(1 + dailyRate, i + 1)
    })),
    metadata: {
      initialAmount: amount,
      totalDays: days,
      annualPercentage: percentage,
      finalValue: amount * Math.pow(1 + dailyRate, days)
    }
  };
  return optimizedResults;
} 