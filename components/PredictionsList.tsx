import { FixedSizeList as List } from 'react-window';

interface PredictionResultsProps {
  data: number[];
}

const PredictionResults = ({ data }: PredictionResultsProps) => (
  <List
    height={400}
    itemCount={data.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        Day {index + 1}: {data[index]}
      </div>
    )}
  </List>
); 