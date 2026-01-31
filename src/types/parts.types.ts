// Parts catalog types - matches backend PartsCatalogResponse
export interface PartResponse {
  id: number;
  vehicleType: string;
  partName: string;
  recommendedIntervalKm: number | null;
  recommendedIntervalMonths: number | null;
  description: string | null;
  createdAt: Date | null;
}

// Grouped response when no type filter is provided
export interface PartsListResponse {
  motor: PartResponse[];
  mobil: PartResponse[];
}

export interface CreatePartRequest {
  vehicleType: 'motor' | 'mobil';
  partName: string;
  recommendedIntervalKm?: number;
  recommendedIntervalMonths?: number;
  description?: string;
}

export interface UpdatePartRequest {
  vehicleType?: 'motor' | 'mobil';
  partName?: string;
  recommendedIntervalKm?: number;
  recommendedIntervalMonths?: number;
  description?: string;
}
