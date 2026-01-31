import api from './api';
import {
  ServiceRecordResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types/service.types';
import { ApiResponse, PaginatedResponse } from '@/types/common.types';

export const serviceService = {
  // Get all service records across all vehicles (owned + shared)
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get<PaginatedResponse<ServiceRecordResponse>>(
      '/services',
      { params: { page, limit } }
    );
    return response.data;
  },

  // Get service records for a vehicle
  getByVehicle: async (vehicleId: number, page = 1, limit = 20) => {
    const response = await api.get<PaginatedResponse<ServiceRecordResponse>>(
      `/services/vehicle/${vehicleId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Get service record by ID
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<ServiceRecordResponse>>(`/services/${id}`);
    return response.data;
  },

  // Create service record
  create: async (data: CreateServiceRequest) => {
    const formData = new FormData();
    formData.append('vehicleId', data.vehicleId.toString());
    formData.append('serviceDate', data.serviceDate);
    formData.append('odometer', data.odometer.toString());
    formData.append('serviceType', data.serviceType);

    if (data.partsReplaced) {
      formData.append('partsReplaced', JSON.stringify(data.partsReplaced));
    }
    if (data.cost !== undefined) formData.append('cost', data.cost.toString());
    if (data.workshopName) formData.append('workshopName', data.workshopName);
    if (data.notes) formData.append('notes', data.notes);
    if (data.receiptPhoto) formData.append('receiptPhoto', data.receiptPhoto);

    const response = await api.post<ApiResponse<ServiceRecordResponse>>('/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update service record
  update: async (id: number, data: UpdateServiceRequest) => {
    const formData = new FormData();
    if (data.serviceDate) formData.append('serviceDate', data.serviceDate);
    if (data.odometer) formData.append('odometer', data.odometer.toString());
    if (data.serviceType) formData.append('serviceType', data.serviceType);
    if (data.partsReplaced) {
      formData.append('partsReplaced', JSON.stringify(data.partsReplaced));
    }
    if (data.cost !== undefined) formData.append('cost', data.cost.toString());
    if (data.workshopName) formData.append('workshopName', data.workshopName);
    if (data.notes) formData.append('notes', data.notes);
    if (data.receiptPhoto) formData.append('receiptPhoto', data.receiptPhoto);

    const response = await api.put<ApiResponse<ServiceRecordResponse>>(`/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete service record
  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/services/${id}`);
    return response.data;
  },
};
