import api from './api';
import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  ChangePasswordRequest,
  RefreshTokenResponse,
} from '@/types/auth.types';
import { ApiResponse } from '@/types/common.types';

export const authService = {
  // Register new user
  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get<ApiResponse<ProfileResponse>>('/auth/profile');
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.put<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },
};
