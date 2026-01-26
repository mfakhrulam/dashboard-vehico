import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_KEYS } from '@/config/constants';
import { storage } from '@/utils/storage';
import { RefreshTokenResponse } from '@/types/auth.types';
import { useAuthStore } from '@/store/authStore';
import { ApiResponse } from '@/types/common.types';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(TOKEN_KEYS.ACCESS_TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      throw error;
    }

    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          throw err;
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = storage.get<string>(TOKEN_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      // No refresh token, logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw error;
    }

    try {
      // Call refresh token endpoint
      const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const tokenData = response.data.data;

      if (!tokenData) {
        throw new Error('Invalid refresh response');
      }

      const { accessToken, refreshToken: newRefreshToken } = tokenData;

      // Save new tokens
      storage.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      storage.set(TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken);

      // Update authorization header
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Process queued requests
      processQueue(null, accessToken);

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh token failed, logout
      processQueue(refreshError as Error, null);
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
