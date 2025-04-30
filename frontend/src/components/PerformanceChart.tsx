import { Bar, Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { PerformanceMetrics } from '../types';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title, 
  Tooltip, 
  Legend
);

interface PerformanceChartProps {
  frameworks: string[];
  performanceData: Record<string, { performance: PerformanceMetrics }>;
  chartType: 'bar' | 'radar';
  metric: 'avgRunTime' | 'completionRate' | 'apiSuccessRate';
}

const PerformanceChart = ({ frameworks, performanceData, chartType, metric }: PerformanceChartProps) => {
  const labels = frameworks;
  const metricLabels = {
    avgRunTime: 'Average Run Time (s)',
    completionRate: 'Completion Rate (%)',
    apiSuccessRate: 'API Success Rate (%)'
  };

  const getData = () => {
    const data = frameworks.map(framework => {
      if (performanceData[framework]?.performance?.[metric] !== undefined) {
        return performanceData[framework].performance[metric];
      }
      return 0;
    });
    return data;
  };

  const getColors = () => {
    return [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
    ];
  };

  const barData = {
    labels,
    datasets: [
      {
        label: metricLabels[metric],
        data: getData(),
        backgroundColor: getColors(),
        borderColor: getColors().map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: metricLabels[metric],
      },
    },
  };

  const radarData = {
    labels,
    datasets: [
      {
        label: metricLabels[metric],
        data: getData(),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: metricLabels[metric],
      },
    },
  };

  return (
    <div className="h-96 w-full">
      {chartType === 'bar' ? (
        <Bar data={barData} options={barOptions} />
      ) : (
        <Radar data={radarData} options={radarOptions} />
      )}
    </div>
  );
};

export default PerformanceChart;
