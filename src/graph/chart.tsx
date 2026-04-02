// components/BarChart.tsx

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register required chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the props if you want to make it reusable
interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

const BarChart: React.FC<BarChartProps> = ({ data, options }) => {
  return  <div className="w-full h-full">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false, // Important for full height
          ...options,
        }}
      />
    </div>
};

export default BarChart;
