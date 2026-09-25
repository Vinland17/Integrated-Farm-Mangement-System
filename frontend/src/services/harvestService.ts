import api from './api';
import { Harvest } from '../types';

export const harvestService = {
  getHarvests: async (): Promise<Harvest[]> => {
    try {
      const res = await api.get('/harvests');
      if (Array.isArray(res.data)) {
        return res.data.map((h: any) => ({
          ...h,
          id: h._id || h.id,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch harvest logs from backend:', err);
      throw err;
    }
  },

  createHarvest: async (harvestData: Partial<Harvest>): Promise<Harvest> => {
    try {
      const res = await api.post('/harvests', harvestData);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error('Failed to create harvest record:', err);
      throw err;
    }
  },

  updateHarvest: async (id: string, harvestData: Partial<Harvest>): Promise<Harvest> => {
    try {
      const res = await api.put(`/harvests/${id}`, harvestData);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error(`Failed to update harvest ${id}:`, err);
      throw err;
    }
  },

  deleteHarvest: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/harvests/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete harvest ${id}:`, err);
      throw err;
    }
  },
};
