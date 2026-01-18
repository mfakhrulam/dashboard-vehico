// Auth request types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Auth response types
export interface User {
  id: number;
  name: string;
  email: string;
  lastLoginAt: Date | null;
  lastLoginDevice: string | null;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  lastLoginDevice: string | null;
}
