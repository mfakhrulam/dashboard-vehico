import api from './api';
import {
  VehicleListResponse,
  VehicleResponse,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  ShareVehicleRequest,
  UpdateSharePermissionRequest,
  VehicleShareInfo,
} from '@/types/vehicle.types';
import { ApiResponse } from '@/types/common.types';

export const vehicleService = {
  // Get all vehicles (owned + shared)
  getAll: async () => {
    const response = await api.get<ApiResponse<VehicleListResponse>>('/vehicles');
    return response.data;
  },

  // Get vehicle by ID
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<VehicleResponse>>(`/vehicles/${id}`);
    return response.data;
  },

  // Create vehicle
  create: async (data: CreateVehicleRequest) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('brand', data.brand);
    formData.append('model', data.model);
    formData.append('year', data.year.toString());
    formData.append('currentOdometer', data.currentOdometer.toString());
    if (data.licensePlate) formData.append('licensePlate', data.licensePlate);
    if (data.photo) formData.append('photo', data.photo);

    const response = await api.post<ApiResponse<VehicleResponse>>('/vehicles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update vehicle
  update: async (id: number, data: UpdateVehicleRequest) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.brand) formData.append('brand', data.brand);
    if (data.model) formData.append('model', data.model);
    if (data.year) formData.append('year', data.year.toString());
    if (data.currentOdometer) formData.append('currentOdometer', data.currentOdometer.toString());
    if (data.licensePlate) formData.append('licensePlate', data.licensePlate);
    if (data.photo) formData.append('photo', data.photo);

    const response = await api.put<ApiResponse<VehicleResponse>>(`/vehicles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete vehicle
  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/vehicles/${id}`);
    return response.data;
  },

  // Share vehicle
  share: async (id: number, data: ShareVehicleRequest) => {
    const response = await api.post<ApiResponse<VehicleShareInfo>>(
      `/vehicles/${id}/share`,
      data
    );
    return response.data;
  },

  // Get vehicle shares
  getShares: async (id: number) => {
    const response = await api.get<ApiResponse<VehicleShareInfo[]>>(`/vehicles/${id}/shares`);
    return response.data;
  },

  // Update share permission
  updateSharePermission: async (
    vehicleId: number,
    shareId: number,
    data: UpdateSharePermissionRequest
  ) => {
    const response = await api.put<ApiResponse<VehicleShareInfo>>(
      `/vehicles/${vehicleId}/shares/${shareId}`,
      data
    );
    return response.data;
  },

  // Revoke share
  revokeShare: async (vehicleId: number, shareId: number) => {
    const response = await api.delete<ApiResponse>(`/vehicles/${vehicleId}/shares/${shareId}`);
    return response.data;
  },
};
