import { Container, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/config/constants';
import { toaster } from '@/components/ui/toaster';
import { parseApiError, FormErrors } from '@/utils/error';
import { vehicleService } from '@/services/vehicle.service';
import { CreateVehicleRequest } from '@/types/vehicle.types';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { VehicleForm, VehicleFormValues } from '@/components/features/vehicles/VehicleForm';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export default function VehicleCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { allowNavigation, confirmDiscard } = useUnsavedChanges({ isDirty: isFormDirty });

  // Mutation for create vehicle
  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleRequest) => vehicleService.create(data),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });

      toaster.create({
        title: 'Berhasil',
        description: 'Kendaraan berhasil ditambahkan',
        type: 'success',
      });
      allowNavigation();
      navigate(ROUTES.GARAGE);
    },
    onError: (error) => {
      const { message, formErrors: newFormErrors } = parseApiError(error);
      setFormErrors(newFormErrors || {});
      toaster.create({
        title: 'Gagal menambah kendaraan',
        description: message,
        type: 'error',
      });
    },
  });

  const handleSubmit = (values: VehicleFormValues) => {
    const requestData: CreateVehicleRequest = {
      name: values.name,
      brand: values.brand,
      model: values.model,
      year: Number.parseInt(values.year),
      licensePlate: values.licensePlate || undefined,
      currentOdometer: Number.parseInt(values.currentOdometer),
      photo: values.photo,
    };

    createMutation.mutate(requestData);
  };

  const handleCancel = () => {
    confirmDiscard(() => navigate(ROUTES.GARAGE));
  };

  return (
    <Layout>
      <Container maxW="2xl">
        <PageHeader
          title="Tambah Kendaraan"
          description="Masukkan informasi kendaraan Anda"
          breadcrumbs={[
            { label: 'Dashboard', to: ROUTES.DASHBOARD },
            { label: 'Garasi', to: ROUTES.GARAGE },
            { label: 'Tambah Kendaraan' },
          ]}
        />
        <VStack
          gap={8}
          bg="surface"
          p={{ base: 5, md: 6 }}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border"
        >
          <VehicleForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending}
            formErrors={formErrors}
            requirePhoto={false}
            onDirtyChange={setIsFormDirty}
          />
        </VStack>
      </Container>
    </Layout>
  );
}
