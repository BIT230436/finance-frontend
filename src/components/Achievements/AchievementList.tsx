import React, { useEffect, useState } from 'react';
import { achievementService } from '../../services/achievementService';
import { AchievementResponse } from '../../types';
import AchievementCard from './AchievementCard';
import './Achievements.css';

const AchievementList: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await achievementService.getMyAchievements();
      setAchievements(data);
    } catch (err: any) {
      console.error('[AchievementList] Error loading achievements:', err);
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải thành tựu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!achievements) {
    return null;
  }

  return (
    <div className="achievement-list-container">
      <div className="achievement-summary">
        <h2>🏆 Thành Tựu</h2>
        <div className="achievement-stats">
          <div className="stat-item">
            <span className="stat-label">Đã Mở Khóa:</span>
            <span className="stat-value">{achievements.unlockedCount}/{achievements.totalCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tổng Điểm:</span>
            <span className="stat-value">{achievements.totalPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tiến Độ:</span>
            <span className="stat-value">{achievements.completionPercentage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${achievements.completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="achievement-grid">
        {achievements.unlocked.length === 0 ? (
          <div className="no-achievements">
            <p>Chưa có thành tựu nào! Hãy bắt đầu giao dịch để mở khóa.</p>
          </div>
        ) : (
          achievements.unlocked.map((userAchievement) => (
            <AchievementCard key={userAchievement.id} userAchievement={userAchievement} />
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementList;

