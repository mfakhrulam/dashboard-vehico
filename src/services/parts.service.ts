import api from './api';
import { PartResponse, CreatePartRequest, UpdatePartRequest } from '@/types/parts.types';
import { ApiResponse } from '@/types/common.types';

export const partsService = {
  // Get all parts
  getAll: async (vehicleType?: 'motor' | 'mobil') => {
    const response = await api.get<ApiResponse<PartResponse[]>>('/parts', {
      params: vehicleType ? { type: vehicleType } : undefined,
    });
    return response.data;
  },

  // Get part by ID
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<PartResponse>>(`/parts/${id}`);
    return response.data;
  },

  // Create custom part
  create: async (data: CreatePartRequest) => {
    const response = await api.post<ApiResponse<PartResponse>>('/parts', data);
    return response.data;
  },

  // Update part
  update: async (id: number, data: UpdatePartRequest) => {
    const response = await api.put<ApiResponse<PartResponse>>(`/parts/${id}`, data);
    return response.data;
  },

  // Delete part
  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/parts/${id}`);
    return response.data;
  },
};
