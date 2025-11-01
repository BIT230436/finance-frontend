import React from 'react';
import { UserAchievement } from '../../types';
import './Achievements.css';

interface AchievementCardProps {
  userAchievement: UserAchievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ userAchievement }) => {
  const { achievement, unlockedAt } = userAchievement;

  return (
    <div className="achievement-card unlocked">
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-details">
        <h4 className="achievement-name">{achievement.name}</h4>
        <p className="achievement-description">{achievement.description}</p>
        <div className="achievement-meta">
          <span className="achievement-points">+{achievement.points} points</span>
          <span className={`achievement-difficulty ${achievement.difficulty.toLowerCase()}`}>
            {achievement.difficulty}
          </span>
        </div>
        <div className="achievement-unlock-date">
          Unlocked: {new Date(unlockedAt).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;

