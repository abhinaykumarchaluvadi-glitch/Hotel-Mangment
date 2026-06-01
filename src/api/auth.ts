import { apiClient, isMockMode, mockDelay } from './client';
import { mockDb } from './mockDb';
import type { LoginFormData, RegisterFormData } from '../schemas/auth';
import type { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    if (isMockMode()) {
      await mockDelay(600);
      const users = mockDb.getUsers();
      const user = users.find((u) => u.email === data.email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Simulate token generation
      const mockToken = `mock-jwt-token-for-${user.id}`;
      return { user, token: mockToken };
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    if (isMockMode()) {
      await mockDelay(700);
      const users = mockDb.getUsers();
      const exists = users.some((u) => u.email === data.email);
      if (exists) {
        throw new Error('Email address already registered');
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role || 'customer',
        createdAt: new Date().toISOString(),
      };

      mockDb.setUsers([...users, newUser]);
      const mockToken = `mock-jwt-token-for-${newUser.id}`;
      return { user: newUser, token: mockToken };
    }

    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    if (isMockMode()) {
      await mockDelay(200);
      const token = localStorage.getItem('hms_token');
      if (!token) throw new Error('Not authenticated');

      const userId = token.replace('mock-jwt-token-for-', '');
      const users = mockDb.getUsers();
      const user = users.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      
      return user;
    }

    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
