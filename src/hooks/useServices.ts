import { useQuery, useQueries } from '@tanstack/react-query';
import { serviceService } from '@/services/service.service';
import type { VehicleResponse } from '@/types/vehicle.types';
import type { ServiceRecordResponse } from '@/types/service.types';

export const useServices = (vehicleId: number, page = 1, limit = 20) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['services', vehicleId, page, limit],
    queryFn: async () => {
      const response = await serviceService.getByVehicle(vehicleId, page, limit);
      return response;
    },
    enabled: typeof vehicleId === 'number' && vehicleId > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    services: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useService = (serviceId: number) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await serviceService.getById(serviceId);
      return response.data;
    },
    enabled: !!serviceId,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    service: data,
    isLoading,
    error,
    refetch,
  };
};

// Hook to fetch all services across all vehicles with server-side pagination
export const useAllServices = (page = 1, limit = 10) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['services', 'all', page, limit],
    queryFn: async () => {
      const response = await serviceService.getAll(page, limit);
      return response;
    },
  });

  return {
    services: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

// Hook to fetch recent services across all vehicles
export const useRecentServices = (vehicles: VehicleResponse[], limit = 5) => {
  const queries = useQueries({
    queries: vehicles.map((vehicle) => ({
      queryKey: ['services', vehicle.id, 1, 10],
      queryFn: async () => {
        const response = await serviceService.getByVehicle(vehicle.id, 1, 10);
        return response.data.map((service) => ({
          ...service,
          vehicleName: vehicle.name,
        }));
      },
      enabled: vehicles.length > 0,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error;

  // Combine and sort all services by date
  const allServices: (ServiceRecordResponse & { vehicleName: string })[] = queries
    .flatMap((q) => q.data || [])
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
    .slice(0, limit);

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const thisMonthServices = allServices.filter(
    (s) => new Date(s.serviceDate) >= startOfMonth
  );
  
  const totalCostThisMonth = thisMonthServices.reduce(
    (sum, s) => sum + (s.cost || 0),
    0
  );

  return {
    recentServices: allServices,
    totalServicesThisMonth: thisMonthServices.length,
    totalCostThisMonth,
    isLoading,
    error,
  };
};
