import api from './api';
import { Expense, Income, Harvest } from '../types';

export const financeService = {
  getExpenses: async (): Promise<Expense[]> => {
    try {
      const res = await api.get('/finance/expenses');
      if (Array.isArray(res.data)) {
        return res.data.map((e: any) => ({
          ...e,
          id: e._id || e.id,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      throw err;
    }
  },

  getIncome: async (): Promise<Income[]> => {
    try {
      const res = await api.get('/finance/income');
      if (Array.isArray(res.data)) {
        return res.data.map((i: any) => ({
          ...i,
          id: i._id || i.id,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch income entries:', err);
      throw err;
    }
  },

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
      console.error('Failed to fetch harvest logs:', err);
      throw err;
    }
  },

  addExpense: async (data: Partial<Expense>): Promise<Expense> => {
    try {
      const res = await api.post('/finance/expenses', data);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error('Failed to create expense record:', err);
      throw err;
    }
  },

  deleteExpense: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/finance/expenses/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete expense ${id}:`, err);
      throw err;
    }
  },

  addIncome: async (data: Partial<Income>): Promise<Income> => {
    try {
      const res = await api.post('/finance/income', data);
      return {
        ...res.data,
        id: res.data._id || res.data.id,
      };
    } catch (err) {
      console.error('Failed to record income entry:', err);
      throw err;
    }
  },

  deleteIncome: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/finance/income/${id}`);
      return true;
    } catch (err) {
      console.error(`Failed to delete income ${id}:`, err);
      throw err;
    }
  },
};
