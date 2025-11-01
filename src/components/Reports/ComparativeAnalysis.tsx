import React, { useEffect, useState } from 'react';
import { comparativeAnalysisService } from '../../services/comparativeAnalysisService';
import { ComparativeAnalysisResponse } from '../../types';
import './ComparativeAnalysis.css';

type AnalysisType = 'month-over-month' | 'vs-average' | 'year-over-year';

const ComparativeAnalysis: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('month-over-month');
  const [analysis, setAnalysis] = useState<ComparativeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalysis();
  }, [analysisType]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      let data: ComparativeAnalysisResponse;
      
      switch (analysisType) {
        case 'month-over-month':
          data = await comparativeAnalysisService.getMonthOverMonth();
          break;
        case 'vs-average':
          data = await comparativeAnalysisService.getVsAverage();
          break;
        case 'year-over-year':
          data = await comparativeAnalysisService.getYearOverYear();
          break;
        default:
          data = await comparativeAnalysisService.getMonthOverMonth();
      }
      
      setAnalysis(data);
    } catch (err: any) {
      console.error('[ComparativeAnalysis] Error loading analysis:', err);
      setError(err.message || 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'increase':
        return '▲';
      case 'decrease':
        return '▼';
      default:
        return '=';
    }
  };

  const getDirectionColor = (direction: string, isExpense: boolean = false) => {
    if (direction === 'unchanged') return '#999';
    
    // For expense, decrease is good (green), increase is bad (red)
    if (isExpense) {
      return direction === 'decrease' ? '#4CAF50' : '#F44336';
    }
    
    // For income/net, increase is good (green), decrease is bad (red)
    return direction === 'increase' ? '#4CAF50' : '#F44336';
  };

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case 'month-over-month':
        return 'So Sánh Tháng Này với Tháng Trước';
      case 'vs-average':
        return 'So Sánh với Trung Bình 3 Tháng';
      case 'year-over-year':
        return 'So Sánh Năm Nay với Năm Ngoái';
      default:
        return 'Phân Tích So Sánh';
    }
  };

  if (loading) {
    return <div className="loading">Đang phân tích...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Don't render if no data available
  if (!analysis || !analysis.currentPeriod || !analysis.previousPeriod) {
    return (
      <div className="comparative-analysis">
        <div className="analysis-header">
          <h3>📈 Phân Tích So Sánh</h3>
        </div>
        <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          Chưa đủ dữ liệu để phân tích. Cần ít nhất 2 tháng dữ liệu giao dịch.
        </p>
      </div>
    );
  }

  return (
    <div className="comparative-analysis">
      <div className="analysis-header">
        <h3>📈 {getAnalysisTitle()}</h3>
        <div className="analysis-type-selector">
          <button
            className={analysisType === 'month-over-month' ? 'active' : ''}
            onClick={() => setAnalysisType('month-over-month')}
          >
            Tháng / Tháng
          </button>
          <button
            className={analysisType === 'vs-average' ? 'active' : ''}
            onClick={() => setAnalysisType('vs-average')}
          >
            vs Trung Bình
          </button>
          <button
            className={analysisType === 'year-over-year' ? 'active' : ''}
            onClick={() => setAnalysisType('year-over-year')}
          >
            Năm / Năm
          </button>
        </div>
      </div>

      <div className="analysis-comparison">
        <div className="period-column">
          <h4>Kỳ Hiện Tại</h4>
          <div className="period-stats">
            <div className="stat-row income">
              <span>Thu Nhập:</span>
              <span>{analysis.currentPeriod.income.toLocaleString()} VND</span>
            </div>
            <div className="stat-row expense">
              <span>Chi Tiêu:</span>
              <span>{analysis.currentPeriod.expense.toLocaleString()} VND</span>
            </div>
            <div className="stat-row net">
              <span>Ròng:</span>
              <span>{analysis.currentPeriod.net.toLocaleString()} VND</span>
            </div>
          </div>
        </div>

        <div className="variance-column">
          <h4>Thay Đổi</h4>
          <div className="variance-stats">
            <div className="variance-row">
              <span
                className="variance-icon"
                style={{ color: getDirectionColor(analysis.variance.income.direction) }}
              >
                {getDirectionIcon(analysis.variance.income.direction)}
              </span>
              <span>{analysis.variance.income.percentage.toFixed(1)}%</span>
              <span className="variance-amount">
                ({analysis.variance.income.absolute >= 0 ? '+' : ''}
                {analysis.variance.income.absolute.toLocaleString()})
              </span>
            </div>

            <div className="variance-row">
              <span
                className="variance-icon"
                style={{ color: getDirectionColor(analysis.variance.expense.direction, true) }}
              >
                {getDirectionIcon(analysis.variance.expense.direction)}
              </span>
              <span>{analysis.variance.expense.percentage.toFixed(1)}%</span>
              <span className="variance-amount">
                ({analysis.variance.expense.absolute >= 0 ? '+' : ''}
                {analysis.variance.expense.absolute.toLocaleString()})
              </span>
            </div>

            <div className="variance-row">
              <span
                className="variance-icon"
                style={{ color: getDirectionColor(analysis.variance.net.direction) }}
              >
                {getDirectionIcon(analysis.variance.net.direction)}
              </span>
              <span>{analysis.variance.net.percentage.toFixed(1)}%</span>
              <span className="variance-amount">
                ({analysis.variance.net.absolute >= 0 ? '+' : ''}
                {analysis.variance.net.absolute.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        <div className="period-column">
          <h4>Kỳ Trước</h4>
          <div className="period-stats">
            <div className="stat-row income">
              <span>Thu Nhập:</span>
              <span>{analysis.previousPeriod.income.toLocaleString()} VND</span>
            </div>
            <div className="stat-row expense">
              <span>Chi Tiêu:</span>
              <span>{analysis.previousPeriod.expense.toLocaleString()} VND</span>
            </div>
            <div className="stat-row net">
              <span>Ròng:</span>
              <span>{analysis.previousPeriod.net.toLocaleString()} VND</span>
            </div>
          </div>
        </div>
      </div>

      {analysis.insights && analysis.insights.length > 0 && (
        <div className="analysis-insights">
          <h4>💡 Nhận Xét</h4>
          <ul>
            {analysis.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComparativeAnalysis;

