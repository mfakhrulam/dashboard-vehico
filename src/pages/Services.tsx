import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useServices } from '@/hooks/useServices';
import { useVehicles } from '@/hooks/useVehicles';
import { ROUTES, SERVICE_TYPES } from '@/config/constants';
import { formatCurrency, formatDate, formatOdometer } from '@/utils/format';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';

interface FilterState {
  serviceType: string;
  startDate: string;
  endDate: string;
}

const DEFAULT_LIMIT = 10;

const serviceTypeOptions = createListCollection({
  items: [
    { label: "Semua", value: "all" },
    ...Object.entries(SERVICE_TYPES).map(([key, label]) => ({ label, value: key })),
  ],
});

export default function Services() {
  const navigate = useNavigate();
  const { ownedVehicles, sharedVehicles, isLoading: isLoadingVehicles } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    serviceType: 'all',
    startDate: '',
    endDate: '',
  });

  const vehicles = useMemo(() => [...ownedVehicles, ...sharedVehicles], [ownedVehicles, sharedVehicles]);
  const activeVehicleId = selectedVehicleId || vehicles[0]?.id || 0;

  const vehicleOptions = useMemo(() => createListCollection({
    items: vehicles.map(vehicle => ({
      label: `${vehicle.name} - ${vehicle.licensePlate || vehicle.brand}`,
      value: String(vehicle.id)
    }))
  }), [vehicles]);

  const { services, pagination, isLoading } = useServices(activeVehicleId, page, DEFAULT_LIMIT);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (filters.serviceType !== 'all' && service.serviceType !== filters.serviceType) {
        return false;
      }

      const serviceDate = new Date(service.serviceDate);
      if (filters.startDate && serviceDate < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && serviceDate > new Date(filters.endDate)) {
        return false;
      }
      return true;
    });
  }, [services, filters]);

  return (
    <Layout>
      <Container maxW="7xl">
        <PageHeader
          title="Service"
          description="Kelola semua catatan service kendaraan Anda."
          actions={
            <RouterLink to={ROUTES.SERVICE_NEW}>
              <Button colorPalette="brand">Tambah Service</Button>
            </RouterLink>
          }
        />

        <VStack gap={6} align="stretch">
          <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={5}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} alignItems="end">
              <FilterField label="Kendaraan">
                <Select.Root 
                  size="lg"
                  collection={vehicleOptions}
                  value={[String(activeVehicleId)]}
                  onValueChange={(e) => {
                    setSelectedVehicleId(Number.parseInt(e.value[0], 10));
                    setPage(1);
                  }}
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
              </FilterField>

              <FilterField label="Jenis Service">
                <Select.Root 
                  size="lg"
                  collection={serviceTypeOptions}
                  value={[filters.serviceType]}
                  onValueChange={(e) =>
                    setFilters((prev) => ({ ...prev, serviceType: e.value[0] }))
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
                        {serviceTypeOptions.items.map((option) => (
                          <Select.Item item={option} key={option.value}>
                            {option.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </FilterField>

              <FilterField label="Tanggal Mulai">
                <Input
                  type="date"
                  size="lg"
                  value={filters.startDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
                />
              </FilterField>

              <FilterField label="Tanggal Akhir">
                <Input
                  type="date"
                  size="lg"
                  value={filters.endDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
                />
              </FilterField>
            </SimpleGrid>
          </Box>

          {(isLoadingVehicles || isLoading) && <LoadingSpinner label="Memuat data service..." />}

          {!isLoadingVehicles && vehicles.length === 0 && (
            <EmptyState
              title="Belum ada kendaraan"
              description="Tambahkan kendaraan untuk mulai mencatat service."
              actionLabel="Tambah Kendaraan"
              onAction={() => navigate(ROUTES.VEHICLE_CREATE)}
            />
          )}

          {!isLoadingVehicles && vehicles.length > 0 && filteredServices.length === 0 && !isLoading && (
            <EmptyState
              title="Belum ada service"
              description="Catat service pertama untuk kendaraan ini."
              actionLabel="Catat Service"
              onAction={() => navigate(`${ROUTES.SERVICE_NEW}?vehicleId=${activeVehicleId}`)}
            />
          )}

          {!isLoading && filteredServices.length > 0 && (
            <VStack gap={4} align="stretch">
              {filteredServices.map((service) => (
                <Box key={service.id} bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={5}>
                  <Flex justify="space-between" align="start" gap={4} flexWrap="wrap">
                    <Box>
                      <Text fontSize="sm" color="textMuted">
                        {formatDate(service.serviceDate)}
                      </Text>
                      <Heading size="sm" mt={1}>
                        {SERVICE_TYPES[service.serviceType]}
                      </Heading>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="sm" color="textMuted">
                        Odometer
                      </Text>
                      <Text fontWeight="semibold">{formatOdometer(service.odometer)}</Text>
                    </Box>
                  </Flex>

                  <HStack gap={4} mt={4} flexWrap="wrap">
                    {service.cost !== null && (
                      <Box>
                        <Text fontSize="xs" color="textMuted">
                          Biaya
                        </Text>
                        <Text fontWeight="semibold">{formatCurrency(service.cost)}</Text>
                      </Box>
                    )}
                    {service.workshopName && (
                      <Box>
                        <Text fontSize="xs" color="textMuted">
                          Bengkel
                        </Text>
                        <Text fontWeight="semibold">{service.workshopName}</Text>
                      </Box>
                    )}
                    <RouterLink to={ROUTES.SERVICE_EDIT(service.id)}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </RouterLink>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Flex justify="space-between" align="center" bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={4}>
              <Text fontSize="sm" color="textMuted">
                Halaman {pagination.page} dari {pagination.totalPages}
              </Text>
              <HStack gap={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={pagination.page <= 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Berikutnya
                </Button>
              </HStack>
            </Flex>
          )}

          <Text fontSize="xs" color="textMuted">
            TODO: Tambahkan opsi "Semua kendaraan" dengan agregasi service lintas kendaraan.
          </Text>
        </VStack>
      </Container>
    </Layout>
  );
}

function FilterField({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <VStack align="stretch" gap={1}>
      <Text fontWeight="semibold">{label}</Text>
      {children}
    </VStack>
  );
}
