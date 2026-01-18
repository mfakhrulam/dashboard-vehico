import { Permission } from './common.types';

// Vehicle request types
export interface CreateVehicleRequest {
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  currentOdometer: number;
  photo?: File;
}

export interface UpdateVehicleRequest {
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  currentOdometer?: number;
  photo?: File;
}

export interface ShareVehicleRequest {
  email: string;
  permission: 'view' | 'edit';
}

export interface UpdateSharePermissionRequest {
  permission: 'view' | 'edit';
}

// Vehicle response types
export interface VehicleResponse {
  id: number;
  ownerId: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string | null;
  currentOdometer: number;
  photoUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  // For shared vehicles
  permission?: Permission;
  sharedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface VehicleListResponse {
  owned: VehicleResponse[];
  shared: VehicleResponse[];
}

export interface VehicleShareResponse {
  id: number;
  vehicleId: number;
  sharedWith: {
    id: number;
    name: string;
    email: string;
  };
  permission: 'view' | 'edit';
  sharedAt: Date;
  revokedAt: Date | null;
}
