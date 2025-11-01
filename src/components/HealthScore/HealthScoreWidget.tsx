import React, { useEffect, useState } from 'react';
import { healthScoreService } from '../../services/healthScoreService';
import { FinancialHealthScore } from '../../types';
import './HealthScore.css';

interface HealthScoreWidgetProps {
  compact?: boolean;
}

const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({ compact = false }) => {
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHealthScore();
  }, []);

  const loadHealthScore = async () => {
    try {
      setLoading(true);
      const data = await healthScoreService.getHealthScore();
      setHealthScore(data);
    } catch (err: any) {
      console.error('[HealthScoreWidget] Error loading health score:', err);
      setError(err.message || 'Failed to load health score');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tính điểm...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!healthScore) {
    return null;
  }

  if (compact) {
    return (
      <div className="health-score-compact" style={{ borderColor: healthScore.healthColor }}>
        <div className="score-circle" style={{ borderColor: healthScore.healthColor }}>
          <span className="score-value" style={{ color: healthScore.healthColor }}>
            {healthScore.score}
          </span>
        </div>
        <div className="score-info">
          <h4>Điểm Sức Khỏe Tài Chính</h4>
          <p style={{ color: healthScore.healthColor }}>{healthScore.healthLevel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="health-score-widget">
      <div className="health-score-header">
        <h3>💚 Điểm Sức Khỏe Tài Chính</h3>
      </div>

      <div className="health-score-main">
        <div className="score-gauge">
          <div className="gauge-circle">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="20"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={healthScore.healthColor}
                strokeWidth="20"
                strokeDasharray={`${(healthScore.score / 100) * 502.4} 502.4`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="score-center">
              <div className="score-number" style={{ color: healthScore.healthColor }}>
                {healthScore.score}
              </div>
              <div className="score-label">/ 100</div>
            </div>
          </div>
          <div className="score-level" style={{ color: healthScore.healthColor }}>
            {healthScore.healthLevel}
          </div>
        </div>

        <div className="score-breakdown">
          <h4>Phân Tích Thành Phần</h4>
          <div className="component-list">
            <div className="component-item">
              <div className="component-header">
                <span>📊 Tuân Thủ Ngân Sách</span>
                <span>{healthScore.components.budgetAdherence.score}/100</span>
              </div>
              <div className="component-bar">
                <div
                  className="component-fill"
                  style={{ width: `${healthScore.components.budgetAdherence.score}%` }}
                ></div>
              </div>
              <span className="component-weight">{healthScore.components.budgetAdherence.weight}</span>
            </div>

            <div className="component-item">
              <div className="component-header">
                <span>💰 Tỷ Lệ Tiết Kiệm</span>
                <span>{healthScore.components.savingsRate.score}/100</span>
              </div>
              <div className="component-bar">
                <div
                  className="component-fill"
                  style={{ width: `${healthScore.components.savingsRate.score}%` }}
                ></div>
              </div>
              <span className="component-weight">{healthScore.components.savingsRate.weight}</span>
            </div>

            <div className="component-item">
              <div className="component-header">
                <span>📈 Tăng Trưởng Tài Sản</span>
                <span>{healthScore.components.netWorthGrowth.score}/100</span>
              </div>
              <div className="component-bar">
                <div
                  className="component-fill"
                  style={{ width: `${healthScore.components.netWorthGrowth.score}%` }}
                ></div>
              </div>
              <span className="component-weight">{healthScore.components.netWorthGrowth.weight}</span>
            </div>

            <div className="component-item">
              <div className="component-header">
                <span>📝 Ghi Chép Đều Đặn</span>
                <span>{healthScore.components.consistency.score}/100</span>
              </div>
              <div className="component-bar">
                <div
                  className="component-fill"
                  style={{ width: `${healthScore.components.consistency.score}%` }}
                ></div>
              </div>
              <span className="component-weight">{healthScore.components.consistency.weight}</span>
            </div>
          </div>
        </div>
      </div>

      {healthScore.recommendations.length > 0 && (
        <div className="health-recommendations">
          <h4>💡 Đề Xuất Cải Thiện</h4>
          <ul>
            {healthScore.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="health-score-footer">
        Cập nhật lúc: {new Date(healthScore.calculatedAt).toLocaleString('vi-VN')}
      </div>
    </div>
  );
};

export default HealthScoreWidget;

