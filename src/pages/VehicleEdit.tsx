import { Container, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/config/constants';
import { toaster } from '@/components/ui/toaster';
import { isForbiddenError, parseApiError, FormErrors } from '@/utils/error';
import { vehicleService } from '@/services/vehicle.service';
import { useVehicle } from '@/hooks/useVehicles';
import { UpdateVehicleRequest } from '@/types/vehicle.types';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { VehicleForm, VehicleFormValues } from '@/components/features/vehicles/VehicleForm';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export default function VehicleEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);
  const queryClient = useQueryClient();

  const { vehicle, isLoading, error } = useVehicle(vehicleId);
  const isForbidden = isForbiddenError(error);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { allowNavigation, confirmDiscard } = useUnsavedChanges({ isDirty: isFormDirty });

  useEffect(() => {
    if (isForbidden) {
      navigate(ROUTES.FORBIDDEN, { replace: true });
    }
  }, [isForbidden, navigate]);

  // Mutation for update vehicle
  const updateMutation = useMutation({
    mutationFn: (data: UpdateVehicleRequest) => vehicleService.update(vehicleId, data),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      
      toaster.create({
        title: 'Berhasil',
        description: 'Kendaraan berhasil diperbarui',
        type: 'success',
      });
      allowNavigation();
      navigate(ROUTES.VEHICLE_DETAIL(vehicleId));
    },
    onError: (error) => {
      const { message, formErrors: newFormErrors } = parseApiError(error);
      setFormErrors(newFormErrors || {});
      toaster.create({
        title: 'Gagal memperbarui kendaraan',
        description: message,
        type: 'error',
      });
    },
  });

  const handleSubmit = (values: VehicleFormValues) => {
    const requestData: UpdateVehicleRequest = {
      name: values.name,
      brand: values.brand,
      model: values.model,
      year: Number.parseInt(values.year),
      licensePlate: values.licensePlate || undefined,
      currentOdometer: Number.parseInt(values.currentOdometer),
      photo: values.photo,
    };

    updateMutation.mutate(requestData);
  };

  const handleCancel = () => {
    confirmDiscard(() => navigate(ROUTES.VEHICLE_DETAIL(vehicleId)));
  };

  if (isForbidden) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <Container maxW="2xl">
          <LoadingSpinner label="Memuat data kendaraan..." />
        </Container>
      </Layout>
    );
  }

  if (error || !vehicle) {
    return (
      <Layout>
        <Container maxW="2xl">
          <EmptyState
            title="Kendaraan tidak ditemukan"
            description="Kendaraan yang Anda cari tidak ditemukan atau telah dihapus."
            actionLabel="Kembali ke Garasi"
            onAction={() => navigate(ROUTES.GARAGE)}
          />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="2xl">
        <PageHeader
          title="Edit Kendaraan"
          description={`Perbarui informasi ${vehicle.name}`}
          breadcrumbs={[
            { label: 'Dashboard', to: ROUTES.DASHBOARD },
            { label: 'Garasi', to: ROUTES.GARAGE },
            { label: vehicle.name, to: ROUTES.VEHICLE_DETAIL(vehicleId) },
            { label: 'Edit' },
          ]}
        />
        <VStack gap={8} bg="surface" p={{ base: 5, md: 6 }} borderRadius="xl" borderWidth="1px" borderColor="border">
          <VehicleForm
            mode="edit"
            initialData={vehicle}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateMutation.isPending}
            formErrors={formErrors}
            requirePhoto={false}
            onDirtyChange={setIsFormDirty}
          />
        </VStack>
      </Container>
    </Layout>
  );
}
