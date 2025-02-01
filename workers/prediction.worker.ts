self.onmessage = (e) => {
  const { amount, days, percentage } = e.data;
  const results = performHeavyCalculations(amount, days, percentage);
  postMessage(results);
};

function performHeavyCalculations(amount: number, days: number, percentage: number) {
  // Optimized calculation logic
  return optimizedResults;
} 