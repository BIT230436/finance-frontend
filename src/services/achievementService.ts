import api from './api';
import { AchievementResponse } from '../types';

export const achievementService = {
  /**
   * Get user's unlocked achievements and progress
   */
  getMyAchievements: async (): Promise<AchievementResponse> => {
    const { data } = await api.get<AchievementResponse>('/achievements/my');
    return data;
  },
};

