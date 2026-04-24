import { useMemo, useState } from 'react';
import { Box, Container, Text, VStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useService } from '@/hooks/useServices';
import { ROUTES } from '@/config/constants';
import { serviceService } from '@/services/service.service';
import { parseApiError, FormErrors } from '@/utils/error';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import ServiceForm from '@/components/features/services/ServiceForm';
import { toaster } from '@/components/ui/toaster';
import type { CreateServiceRequest, UpdateServiceRequest } from '@/types/service.types';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export default function ServiceEdit() {
  const { id } = useParams<{ id: string }>();
  const serviceId = Number.parseInt(id ?? '0', 10);
  const navigate = useNavigate();
  const { service, isLoading } = useService(serviceId);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { allowNavigation, confirmDiscard } = useUnsavedChanges({ isDirty: isFormDirty });

  const initialValues = useMemo(() => {
    if (!service) return undefined;
    return {
      serviceDate: new Date(service.serviceDate).toISOString().slice(0, 10),
      odometer: service.odometer.toString(),
      serviceType: service.serviceType,
      cost: service.cost ? service.cost.toString() : '',
      workshopName: service.workshopName ?? '',
      notes: service.notes ?? '',
    };
  }, [service]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateServiceRequest) => serviceService.update(serviceId, data),
    onSuccess: () => {
      toaster.create({
        title: 'Service diperbarui',
        description: 'Catatan service berhasil diperbarui',
        type: 'success',
      });
      allowNavigation();
      if (service) {
        navigate(ROUTES.VEHICLE_DETAIL(service.vehicleId));
        return;
      }
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      const { message, formErrors: newFormErrors } = parseApiError(error);
      setFormErrors(newFormErrors || {});
      toaster.create({
        title: 'Gagal memperbarui service',
        description: message,
        type: 'error',
      });
    },
  });

  if (isLoading || !service || !initialValues) {
    return (
      <Layout>
        <Container maxW="2xl">
          <PageHeader
            title="Edit Service"
            description="Perbarui catatan perawatan kendaraan Anda."
            breadcrumbs={[
              { label: 'Dashboard', to: ROUTES.DASHBOARD },
              { label: 'Service', to: `${ROUTES.DASHBOARD}#services` },
              { label: 'Edit Service' },
            ]}
          />
          <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={6}>
            <Text color="textMuted">Memuat data service...</Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={6}>
        <Container maxW="2xl">
          <PageHeader
            title="Edit Service"
            description="Perbarui catatan perawatan kendaraan Anda."
            breadcrumbs={[
              { label: 'Dashboard', to: ROUTES.DASHBOARD },
              { label: 'Service', to: `${ROUTES.DASHBOARD}#services` },
              { label: 'Edit Service' },
            ]}
          />
          <VStack
            gap={6}
            align="stretch"
            bg="surface"
            borderWidth="1px"
            borderColor="border"
            borderRadius="xl"
            p={{ base: 5, md: 6 }}
          >
            <ServiceForm
              vehicleId={service.vehicleId}
              initialValues={initialValues}
              initialParts={service.partsReplaced ?? []}
              formErrors={formErrors}
              isSubmitting={updateMutation.isPending}
              submitLabel="Simpan Perubahan"
              onSubmit={(payload: CreateServiceRequest) => {
                const updatePayload: UpdateServiceRequest = {
                  serviceDate: payload.serviceDate,
                  odometer: payload.odometer,
                  serviceType: payload.serviceType,
                  partsReplaced: payload.partsReplaced,
                  cost: payload.cost,
                  workshopName: payload.workshopName,
                  notes: payload.notes,
                  receiptPhoto: payload.receiptPhoto,
                };
                updateMutation.mutate(updatePayload);
              }}
              onCancel={() =>
                confirmDiscard(() => navigate(ROUTES.VEHICLE_DETAIL(service.vehicleId)))
              }
              onDirtyChange={setIsFormDirty}
            />
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
}
