import api from './api';
import { Worker } from '../types';

export const workerService = {
  getWorkers: async (): Promise<Worker[]> => {
    try {
      const res = await api.get('/workers');
      if (Array.isArray(res.data)) {
        return res.data.map((w: any) => ({
          ...w,
          id: w._id || w.id,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch workers from backend database:', err);
      throw err;
    }
  },

  getWorkerById: async (id: string): Promise<Worker | null> => {
    try {
      const res = await api.get(`/workers/${id}`);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error(`Failed to fetch worker ${id}:`, err);
      return null;
    }
  },

  createWorker: async (workerData: Partial<Worker>): Promise<Worker> => {
    try {
      const res = await api.post('/workers', workerData);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error('Failed to create worker record:', err);
      throw err;
    }
  },

  updateWorker: async (id: string, workerData: Partial<Worker>): Promise<Worker> => {
    try {
      const res = await api.put(`/workers/${id}`, workerData);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error(`Failed to update worker ${id}:`, err);
      throw err;
    }
  },

  deleteWorker: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/workers/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete worker ${id}:`, err);
      throw err;
    }
  },
};
