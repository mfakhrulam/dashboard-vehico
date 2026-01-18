// Parts catalog types
export interface PartResponse {
  id: number;
  name: string;
  category: string;
  vehicleType: 'motor' | 'mobil';
  intervalKm: number | null;
  intervalMonths: number | null;
  description: string | null;
  createdAt: Date;
}

export interface CreatePartRequest {
  name: string;
  category: string;
  vehicleType: 'motor' | 'mobil';
  intervalKm?: number;
  intervalMonths?: number;
  description?: string;
}

export interface UpdatePartRequest {
  name?: string;
  category?: string;
  vehicleType?: 'motor' | 'mobil';
  intervalKm?: number;
  intervalMonths?: number;
  description?: string;
}
