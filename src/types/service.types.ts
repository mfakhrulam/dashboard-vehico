import { ServiceType } from './common.types';

// Service request types
export interface PartReplaced {
  name: string;
  brand?: string;
  quantity?: number;
}

export interface CreateServiceRequest {
  vehicleId: number;
  serviceDate: string; // ISO string
  odometer: number;
  serviceType: ServiceType;
  partsReplaced?: PartReplaced[];
  cost?: number;
  workshopName?: string;
  notes?: string;
  receiptPhoto?: File;
}

export interface UpdateServiceRequest {
  serviceDate?: string;
  odometer?: number;
  serviceType?: ServiceType;
  partsReplaced?: PartReplaced[];
  cost?: number;
  workshopName?: string;
  notes?: string;
  receiptPhoto?: File;
}

// Service response types
export interface ServiceRecordResponse {
  id: number;
  vehicleId: number;
  vehicleName?: string;
  performedBy: {
    id: number;
    name: string;
    email: string;
  };
  serviceDate: Date;
  odometer: number;
  serviceType: ServiceType;
  partsReplaced: PartReplaced[] | null;
  cost: number | null;
  workshopName: string | null;
  notes: string | null;
  receiptPhotoUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
