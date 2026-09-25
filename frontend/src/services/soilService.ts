import api from './api';
import { SoilRecord } from '../types';

export const soilService = {
  getSoilRecords: async (fieldId?: string): Promise<SoilRecord[]> => {
    try {
      const res = await api.get('/soil', { params: fieldId ? { fieldId } : {} });
      if (Array.isArray(res.data)) {
        return res.data.map((s: any) => ({
          ...s,
          id: s._id || s.id
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch soil records from backend database:', err);
      throw err;
    }
  },

  getSoilRecordById: async (id: string): Promise<SoilRecord | null> => {
    try {
      const res = await api.get(`/soil/${id}`);
      return {
        ...res.data,
        id: res.data._id || res.data.id
      };
    } catch (err) {
      console.error(`Failed to fetch soil record ${id}:`, err);
      return null;
    }
  },

  addSoilRecord: async (data: Partial<SoilRecord>): Promise<SoilRecord> => {
    try {
      const res = await api.post('/soil', data);
      return {
        ...res.data,
        id: res.data._id || res.data.id
      };
    } catch (err) {
      console.error('Failed to create soil laboratory record:', err);
      throw err;
    }
  },

  updateSoilRecord: async (id: string, data: Partial<SoilRecord>): Promise<SoilRecord> => {
    try {
      const res = await api.put(`/soil/${id}`, data);
      return {
        ...res.data,
        id: res.data._id || res.data.id
      };
    } catch (err) {
      console.error(`Failed to update soil record ${id}:`, err);
      throw err;
    }
  },

  deleteSoilRecord: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/soil/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete soil record ${id}:`, err);
      throw err;
    }
  }
};
