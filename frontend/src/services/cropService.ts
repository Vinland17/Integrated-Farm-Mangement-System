import api from './api';
import { Crop } from '../types';

export const cropService = {
  getCrops: async (): Promise<Crop[]> => {
    try {
      const res = await api.get('/crops');
      if (Array.isArray(res.data)) {
        return res.data.map((c: any) => ({
          ...c,
          id: c._id || c.id
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch crops from backend database:', err);
      throw err;
    }
  },

  getCropById: async (id: string): Promise<Crop | null> => {
    try {
      const res = await api.get(`/crops/${id}`);
      return {
        ...res.data,
        id: res.data._id || res.data.id
      };
    } catch (err) {
      console.error(`Failed to fetch crop ${id}:`, err);
      return null;
    }
  },

  createCrop: async (cropData: Partial<Crop>): Promise<Crop> => {
    try {
      const res = await api.post('/crops', cropData);
      return {
        ...res.data,
        id: res.data._id || res.data.id
      };
    } catch (err) {
      console.error('Failed to create crop record:', err);
      throw err;
    }
  },

  updateCrop: async (id: string, cropData: Partial<Crop>): Promise<Crop> => {
    try {
      const res = await api.get(`/crops/${id}`);
      // Send PUT update request
      const updateRes = await api.put(`/crops/${id}`, cropData);
      return {
        ...updateRes.data,
        id: updateRes.data._id || updateRes.data.id
      };
    } catch (err) {
      console.error(`Failed to update crop ${id}:`, err);
      throw err;
    }
  },

  deleteCrop: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/crops/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete crop ${id}:`, err);
      throw err;
    }
  }
};
