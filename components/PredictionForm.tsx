'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';

interface PredictionCalculatorProps {
  onCalculate?: (value: string) => void;
}

const PredictionCalculator = ({ onCalculate }: PredictionCalculatorProps) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue] = useDebounce(inputValue, 300);

  useEffect(() => {
    if (debouncedValue && onCalculate) {
      onCalculate(debouncedValue);
    }
  }, [debouncedValue, onCalculate]);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label 
          htmlFor="prediction-input" 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Enter prediction value
        </label>
        <Input
          id="prediction-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a value..."
          className="w-full"
        />
      </div>
      {debouncedValue && (
        <p className="text-sm text-gray-500">
          Calculating prediction for: {debouncedValue}
        </p>
      )}
    </div>
  );
};

export default PredictionCalculator; 