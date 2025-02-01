const dailyRate = percentage / 100 / 365;
const results = Array.from({ length: days }, (_, i) => 
  amount * Math.pow(1 + dailyRate, i + 1)
); 