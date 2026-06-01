import apiClient, { isMockMode } from './client';
import type { User, AuthResponse } from '../types';
import type { LoginFormData, RegisterFormData } from '../schemas/auth';

const mockUsers: { [key: string]: { user: User; password: string } } = {
  'admin@hotel.com': {
    user: {
      id: '1',
      email: 'admin@hotel.com',
      name: 'Admin User',
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin Street',
      createdAt: new Date().toISOString(),
    },
    password: 'admin123',
  },
  'guest@hotel.com': {
    user: {
      id: '2',
      email: 'guest@hotel.com',
      name: 'Guest User',
      role: 'customer',
      phone: '+0987654321',
      address: '456 Guest Avenue',
      createdAt: new Date().toISOString(),
    },
    password: 'guest123',
  },
};

const generateMockToken = (user: User): string => {
  return `mock_token_${user.id}_${Date.now()}`;
};

export const authApi = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const userRecord = mockUsers[data.email];
      if (!userRecord || userRecord.password !== data.password) {
        throw new Error('Invalid email or password');
      }
      return {
        token: generateMockToken(userRecord.user),
        user: userRecord.user,
      };
    }
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (mockUsers[data.email]) {
        throw new Error('Email already registered');
      }
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        role: 'customer',
        phone: data.phone,
        address: data.address,
        createdAt: new Date().toISOString(),
      };
      mockUsers[data.email] = { user: newUser, password: data.password };
      return {
        token: generateMockToken(newUser),
        user: newUser,
      };
    }
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockUsers['guest@hotel.com'].user;
    }
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user');
    }
  },
};
