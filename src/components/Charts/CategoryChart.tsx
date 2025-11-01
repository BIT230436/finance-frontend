import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { CategorySummary } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data: CategorySummary[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  console.log('[CategoryChart] Received data:', data);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
        <p>Không có dữ liệu để hiển thị biểu đồ.</p>
      </div>
    );
  }
  
  // Backend đã filter zero amounts và sort by amount descending
  // Null safety: đảm bảo chỉ hiển thị categories có amount > 0
  const incomeData = data
    .filter((d) => d && d.type === 'INCOME' && d.amount != null && d.amount > 0)
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));
  const expenseData = data
    .filter((d) => d && d.type === 'EXPENSE' && d.amount != null && d.amount > 0)
    .sort((a, b) => (b.amount || 0) - (a.amount || 0));
  
  console.log('[CategoryChart] Income data:', incomeData);
  console.log('[CategoryChart] Expense data:', expenseData);

  const incomeChartData = {
    labels: incomeData.map((d) => d?.categoryName || 'Unknown'),
    datasets: [
      {
        label: 'Thu',
        data: incomeData.map((d) => d?.amount || 0),
        backgroundColor: [
          'rgba(5, 150, 105, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(110, 231, 183, 0.8)',
          'rgba(167, 243, 208, 0.8)',
        ],
        borderColor: [
          'rgba(5, 150, 105, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(52, 211, 153, 1)',
          'rgba(110, 231, 183, 1)',
          'rgba(167, 243, 208, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const expenseChartData = {
    labels: expenseData.map((d) => d?.categoryName || 'Unknown'),
    datasets: [
      {
        label: 'Chi',
        data: expenseData.map((d) => d?.amount || 0),
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(252, 165, 165, 0.8)',
          'rgba(254, 202, 202, 0.8)',
        ],
        borderColor: [
          'rgba(220, 38, 38, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(248, 113, 113, 1)',
          'rgba(252, 165, 165, 1)',
          'rgba(254, 202, 202, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            // Null safety: đảm bảo parsed value là số hợp lệ
            const value = context.parsed != null ? context.parsed : 0;
            label += typeof value === 'number' ? value.toLocaleString() : '0';
            label += ' VND';
            return label;
          },
        },
      },
    },
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      {incomeData.length > 0 ? (
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Thu nhập theo thể loại</h3>
          <div style={{ height: '300px' }}>
            <Pie data={incomeChartData} options={options} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Thu nhập theo thể loại</h3>
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            Chưa có dữ liệu thu nhập
          </p>
        </div>
      )}
      {expenseData.length > 0 ? (
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Chi tiêu theo thể loại</h3>
          <div style={{ height: '300px' }}>
            <Pie data={expenseChartData} options={options} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Chi tiêu theo thể loại</h3>
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            Chưa có dữ liệu chi tiêu
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryChart;

