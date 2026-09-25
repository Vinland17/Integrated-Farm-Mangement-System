import api from './api';
import { InventoryItem } from '../types';

export const inventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    try {
      const res = await api.get('/inventory');
      if (Array.isArray(res.data)) {
        return res.data.map((item: any) => ({
          ...item,
          id: item._id || item.id,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch inventory items from backend database:', err);
      throw err;
    }
  },

  addItem: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
      const res = await api.post('/inventory', item);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error('Failed to create inventory item:', err);
      throw err;
    }
  },

  updateItem: async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    try {
      const res = await api.put(`/inventory/${id}`, item);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error(`Failed to update inventory item ${id}:`, err);
      throw err;
    }
  },

  deleteItem: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/inventory/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete inventory item ${id}:`, err);
      throw err;
    }
  },
};
