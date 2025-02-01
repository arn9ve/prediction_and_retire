import { useDebounce } from 'use-debounce';

const PredictionCalculator = () => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue] = useDebounce(inputValue, 300); // 300ms delay

  useEffect(() => {
    if (debouncedValue) {
      // Trigger calculation
    }
  }, [debouncedValue]);
}; 