import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CashflowDto } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CashflowChartProps {
  data: CashflowDto[];
}

const CashflowChart: React.FC<CashflowChartProps> = ({ data }) => {
  console.log('[CashflowChart] Received data:', data);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
        <p>Không có dữ liệu để hiển thị biểu đồ.</p>
      </div>
    );
  }
  
  // Backend đã tính cumulative balance (running balance), frontend chỉ cần hiển thị
  // Null safety: đảm bảo tất cả values là số hợp lệ
  const chartData = {
    labels: data.map((d) => {
      if (!d || !d.date) return 'N/A';
      try {
        const date = new Date(d.date);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('vi-VN');
      } catch (e) {
        return 'N/A';
      }
    }),
    datasets: [
      {
        label: 'Thu',
        data: data.map((d) => {
          // Null safety: default to 0 nếu null/undefined
          return d && typeof d.income === 'number' ? d.income : 0;
        }),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Chi',
        data: data.map((d) => {
          // Null safety: default to 0 nếu null/undefined
          return d && typeof d.expense === 'number' ? d.expense : 0;
        }),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Số dư (Cumulative)',
        data: data.map((d) => {
          // Backend đã tính cumulative balance, frontend chỉ hiển thị
          // Null safety: default to 0 nếu null/undefined
          return d && typeof d.balance === 'number' ? d.balance : 0;
        }),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CashflowChart;

