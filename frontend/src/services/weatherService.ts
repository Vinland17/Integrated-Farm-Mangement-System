import api from './api';
import { WeatherRecordResponse } from '../types';

export const weatherService = {
  getWeather: async (farmId?: string): Promise<WeatherRecordResponse> => {
    try {
      const res = await api.get('/weather', {
        params: farmId ? { farmId } : {}
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch live weather telemetry from backend:', err);
      throw err;
    }
  }
};
