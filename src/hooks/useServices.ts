import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/service.service';

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
    enabled: !!vehicleId,
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
  });

  return {
    service: data,
    isLoading,
    error,
    refetch,
  };
};
