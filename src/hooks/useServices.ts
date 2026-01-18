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
