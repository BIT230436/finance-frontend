import React, { useEffect, useState } from 'react';
import { cashflowForecastService } from '../../services/cashflowForecastService';
import { CashflowForecast } from '../../types';
import './CashflowForecast.css';

interface CashflowForecastWidgetProps {
  days?: number;
}

const CashflowForecastWidget: React.FC<CashflowForecastWidgetProps> = ({ days = 30 }) => {
  const [forecast, setForecast] = useState<CashflowForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadForecast();
  }, [days]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const data = await cashflowForecastService.getForecast(days);
      setForecast(data);
    } catch (err: any) {
      console.error('[CashflowForecastWidget] Error loading forecast:', err);
      setError(err.message || 'Failed to load forecast');
    } finally {
      setLoading(false);
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'GREEN':
        return '#4CAF50';
      case 'YELLOW':
        return '#FFC107';
      case 'RED':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'GREEN':
        return '🟢';
      case 'YELLOW':
        return '🟡';
      case 'RED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return <div className="loading">Đang tính toán dự báo...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!forecast) {
    return null;
  }

  return (
    <div className="cashflow-forecast-widget">
      <div className="forecast-header">
        <h3>📊 Dự Báo Tiền Mặt ({days} Ngày)</h3>
        <div className="forecast-current-balance">
          Số dư hiện tại: <strong>{forecast.currentBalance.toLocaleString()} VND</strong>
        </div>
      </div>

      {forecast.hasWarnings && (
        <div className="forecast-warnings">
          <h4>⚠️ Cảnh Báo</h4>
          <p>Số dư dự kiến thấp vào các ngày: {forecast.warningDays.join(', ')}</p>
          <p>Số dư thấp nhất dự kiến: <strong>{forecast.minPredictedBalance.toLocaleString()} VND</strong></p>
        </div>
      )}

      <div className="forecast-stats">
        <div className="stat-box">
          <span className="stat-label">Chi tiêu TB/ngày</span>
          <span className="stat-value">{forecast.avgDailySpending.toLocaleString()} VND</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Số dư thấp nhất</span>
          <span className="stat-value" style={{ color: forecast.minPredictedBalance < 1000000 ? '#F44336' : '#4CAF50' }}>
            {forecast.minPredictedBalance.toLocaleString()} VND
          </span>
        </div>
      </div>

      <div className="forecast-timeline">
        {forecast.dailyForecast.map((day, index) => {
          const date = new Date(day.date);
          const isToday = index === 0;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div key={day.date} className={`forecast-day ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''}`}>
              <div className="day-date">
                <span className="day-number">{date.getDate()}</span>
                <span className="day-month">{date.getMonth() + 1}/{date.getFullYear()}</span>
              </div>
              <div className="day-zone" style={{ backgroundColor: getZoneColor(day.zone) }}>
                {getZoneIcon(day.zone)}
              </div>
              <div className="day-balance">
                {day.predictedBalance.toLocaleString()}
              </div>
              <div className="day-changes">
                {day.expectedIncome > 0 && (
                  <span className="income">+{day.expectedIncome.toLocaleString()}</span>
                )}
                {day.expectedExpense > 0 && (
                  <span className="expense">-{day.expectedExpense.toLocaleString()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="forecast-legend">
        <div className="legend-item">
          🟢 <span>Vùng An Toàn ({'>'}5M)</span>
        </div>
        <div className="legend-item">
          🟡 <span>Vùng Cảnh Báo (1-5M)</span>
        </div>
        <div className="legend-item">
          🔴 <span>Vùng Nguy Hiểm ({'<'}1M)</span>
        </div>
      </div>
    </div>
  );
};

export default CashflowForecastWidget;

