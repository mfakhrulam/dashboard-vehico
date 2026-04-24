import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useVehicles } from '@/hooks/useVehicles';
import { ROUTES } from '@/config/constants';
import { serviceService } from '@/services/service.service';
import { parseApiError, FormErrors } from '@/utils/error';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import ServiceForm from '@/components/features/services/ServiceForm';
import { toaster } from '@/components/ui/toaster';
import type { CreateServiceRequest } from '@/types/service.types';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export default function ServiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ownedVehicles, sharedVehicles, isLoading } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { allowNavigation, confirmDiscard } = useUnsavedChanges({ isDirty: isFormDirty });

  const vehicles = useMemo(
    () => [...ownedVehicles, ...sharedVehicles],
    [ownedVehicles, sharedVehicles]
  );
  
  const vehicleOptions = useMemo(() => createListCollection({
    items: vehicles.map(vehicle => ({
      label: `${vehicle.name} - ${vehicle.licensePlate || vehicle.brand}`,
      value: String(vehicle.id)
    }))
  }), [vehicles]);
  const paramVehicleId = Number.parseInt(searchParams.get('vehicleId') ?? '0', 10);
  const defaultVehicleId = vehicles[0]?.id ?? 0;
  const activeVehicleId = selectedVehicleId || paramVehicleId || defaultVehicleId;

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceService.create(data),
    onSuccess: () => {
      toaster.create({
        title: 'Service tersimpan',
        description: 'Catatan service berhasil ditambahkan',
        type: 'success',
      });
      allowNavigation();
      if (activeVehicleId) {
        navigate(ROUTES.VEHICLE_DETAIL(activeVehicleId));
        return;
      }
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      const { message, formErrors: newFormErrors } = parseApiError(error);
      setFormErrors(newFormErrors || {});
      toaster.create({
        title: 'Gagal menyimpan service',
        description: message,
        type: 'error',
      });
    },
  });

  if (!isLoading && vehicles.length === 0) {
    return (
      <Layout>
        <Container maxW="lg">
          <PageHeader
            title="Catat Service"
            description="Simpan catatan perawatan kendaraan Anda."
            breadcrumbs={[
              { label: 'Dashboard', to: ROUTES.DASHBOARD },
              { label: 'Service', to: `${ROUTES.DASHBOARD}#services` },
              { label: 'Catat Service' },
            ]}
          />
          <VStack
            gap={4}
            bg="surface"
            borderWidth="1px"
            borderColor="border"
            borderRadius="xl"
            p={6}
          >
            <Heading size="lg">Tambahkan Kendaraan</Heading>
            <Text color="textMuted" textAlign="center">
              Anda belum memiliki kendaraan. Tambahkan kendaraan terlebih dahulu sebelum mencatat
              service.
            </Text>
            <RouterLink to={ROUTES.VEHICLE_CREATE}>
              <Button colorPalette="brand">Tambah Kendaraan</Button>
            </RouterLink>
          </VStack>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={6}>
        <Container maxW="2xl">
          <PageHeader
            title="Catat Service"
            description="Simpan catatan perawatan kendaraan Anda."
            breadcrumbs={[
              { label: 'Dashboard', to: ROUTES.DASHBOARD },
              { label: 'Service', to: `${ROUTES.DASHBOARD}#services` },
              { label: 'Catat Service' },
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
            <VStack align="stretch" gap={4}>
              <FieldWrapper label="Pilih Kendaraan">
                <Select.Root 
                  size="lg"
                  collection={vehicleOptions}
                  value={[String(activeVehicleId)]}
                  onValueChange={(e) =>
                    setSelectedVehicleId(Number.parseInt(e.value[0], 10))
                  }
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {vehicleOptions.items.map((option) => (
                          <Select.Item item={option} key={option.value}>
                            {option.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </FieldWrapper>
            </VStack>

            {activeVehicleId ? (
              <ServiceForm
                vehicleId={activeVehicleId}
                formErrors={formErrors}
                isSubmitting={createMutation.isPending}
                submitLabel="Simpan Service"
                onSubmit={(payload) => createMutation.mutate(payload)}
                onCancel={() => confirmDiscard(() => navigate(ROUTES.DASHBOARD))}
                onDirtyChange={setIsFormDirty}
              />
            ) : (
              <HStack justify="center">
                <Text color="textMuted">Pilih kendaraan terlebih dahulu.</Text>
              </HStack>
            )}
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
}

function FieldWrapper({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <VStack align="stretch" gap={1}>
      <Text fontWeight="semibold">{label}</Text>
      {children}
    </VStack>
  );
}
