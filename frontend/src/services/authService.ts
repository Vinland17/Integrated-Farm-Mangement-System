import api from './api';
import { User, UserRole } from '../types';

/**
 * Helper to normalize raw backend user object to frontend User interface.
 */
const normalizeUser = (u: any): User => ({
  id: u._id || u.id || '',
  _id: u._id || u.id,
  name: u.name || '',
  email: u.email || '',
  role: (u.role as UserRole) || 'Worker',
  avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  farmName: u.farmName || 'Green Valley Agri Enterprise',
  isActive: u.isActive ?? true,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const authService = {
  /**
   * Login user via POST /api/auth/login
   */
  login: async (email: string, pass: string): Promise<{ user: User; token: string }> => {
    const res = await api.post('/auth/login', { email, password: pass });
    const rawUser = res.data.user;
    const token = res.data.token;
    return {
      user: normalizeUser(rawUser),
      token
    };
  },

  /**
   * Register user via POST /api/auth/register
   */
  register: async (
    name: string,
    email: string,
    pass: string,
    role: UserRole
  ): Promise<{ user: User; token: string }> => {
    const res = await api.post('/auth/register', { name, email, password: pass, role });
    const rawUser = res.data.user;
    const token = res.data.token;
    return {
      user: normalizeUser(rawUser),
      token
    };
  },

  /**
   * Get authenticated user profile via GET /api/users/profile
   */
  getProfile: async (): Promise<User> => {
    const res = await api.get('/users/profile');
    const rawUser = res.data.user || res.data;
    return normalizeUser(rawUser);
  },

  /**
   * Logout user via POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
  }
};
