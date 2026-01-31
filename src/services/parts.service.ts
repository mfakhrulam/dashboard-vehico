import api from './api';
import { PartResponse, PartsListResponse, CreatePartRequest, UpdatePartRequest } from '@/types/parts.types';
import { ApiResponse } from '@/types/common.types';

export const partsService = {
  // Get all parts filtered by vehicle type (returns array)
  getByType: async (vehicleType: 'motor' | 'mobil') => {
    const response = await api.get<ApiResponse<PartResponse[]>>('/parts', {
      params: { type: vehicleType },
    });
    return response.data;
  },

  // Get all parts grouped by vehicle type (returns { motor: [], mobil: [] })
  getAll: async () => {
    const response = await api.get<ApiResponse<PartsListResponse>>('/parts');
    return response.data;
  },

  // Get flat array of all parts (combines motor + mobil)
  getAllFlat: async () => {
    const response = await api.get<ApiResponse<PartsListResponse>>('/parts');
    const data = response.data.data;
    if (data) {
      return [...data.motor, ...data.mobil];
    }
    return [];
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
