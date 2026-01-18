export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'vehico_access_token',
  REFRESH_TOKEN: 'vehico_refresh_token',
} as const;

export const STORAGE_KEYS = {
  USER: 'vehico_user',
  THEME: 'vehico_theme',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  VEHICLE_NEW: '/vehicles/new',
  VEHICLE_CREATE: '/vehicles/create',
  VEHICLE_DETAIL: (id: string | number) => `/vehicles/${id}`,
  VEHICLE_EDIT: (id: string | number) => `/vehicles/${id}/edit`,
  VEHICLE_SHARE: (id: string | number) => `/vehicles/${id}/share`,
  SERVICES: '/services',
  SERVICE_NEW: '/services/new',
  SERVICE_DETAIL: (id: string | number) => `/services/${id}`,
  PARTS: '/parts',
  PROFILE: '/profile',
} as const;

export const SERVICE_TYPES = {
  ringan: 'Service Ringan',
  rutin: 'Service Rutin',
  perbaikan: 'Perbaikan',
  ganti_part: 'Ganti Part',
} as const;

export const PERMISSION_LEVELS = {
  owner: 'Owner',
  edit: 'Edit',
  view: 'View',
} as const;
