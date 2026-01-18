import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicle.service';

export const useVehicles = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await vehicleService.getAll();
      return response.data;
    },
  });

  return {
    vehicles: data,
    ownedVehicles: data?.owned || [],
    sharedVehicles: data?.shared || [],
    isLoading,
    error,
    refetch,
  };
};

export const useVehicle = (id: number) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await vehicleService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  return {
    vehicle: data,
    isLoading,
    error,
    refetch,
  };
};
