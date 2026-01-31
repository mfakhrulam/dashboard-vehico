import { Box, Button, Container, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Text, VStack, Tabs } from '@chakra-ui/react';
import { useState } from 'react';
import type { ElementType } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import { FiActivity, FiCalendar, FiDollarSign, FiEdit2, FiShare2, FiTool, FiUser, FiClock, FiList } from 'react-icons/fi';
import { useVehicle } from '@/hooks/useVehicles';
import { useServices } from '@/hooks/useServices';
import { ROUTES, PERMISSION_LEVELS } from '@/config/constants';
import { formatOdometer, formatDate, formatCurrency } from '@/utils/format';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import ShareVehicleModal from '@/components/features/vehicles/ShareVehicleModal';
import ServiceTimeline from '@/components/features/services/ServiceTimeline';
import MaintenanceSchedule from '@/components/features/vehicles/MaintenanceSchedule';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number.parseInt(id || '0', 10);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { vehicle, isLoading: isLoadingVehicle } = useVehicle(vehicleId);
  const { services, isLoading: isLoadingServices } = useServices(vehicleId);

  const latestService = services[0];

  const isOwner = vehicle?.permission === 'owner' || !vehicle?.permission;
  const canEdit = vehicle?.permission === 'owner' || vehicle?.permission === 'edit';

  return (
    <Layout>
      <Container maxW="7xl">
        <VStack gap={8} align="stretch">
          {isLoadingVehicle && <Text>Loading...</Text>}

          {vehicle && (
            <>
              <PageHeader
                title="Detail Kendaraan"
                description={vehicle.name}
                breadcrumbs={[
                  { label: 'Dashboard', to: ROUTES.DASHBOARD },
                  { label: 'Garasi', to: ROUTES.GARAGE },
                  { label: vehicle.name },
                ]}
              />
              <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={{ base: 5, md: 6 }}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="stretch">
                  <Box
                    borderRadius="xl"
                    overflow="hidden"
                    minH={{ base: '220px', md: '280px' }}
                    backgroundImage={vehicle.photoUrl ? `url(${vehicle.photoUrl})` : undefined}
                    backgroundSize="cover"
                    backgroundPosition="center"
                    bg={vehicle.photoUrl ? undefined : 'bg'}
                    borderWidth="1px"
                    borderColor="border"
                  >
                    {!vehicle.photoUrl && (
                      <Flex h="full" align="center" justify="center">
                        <Icon as={FiTool} boxSize={12} color="textMuted" />
                      </Flex>
                    )}
                  </Box>

                  <Stack gap={4} justify="space-between">
                    <Box>
                      <HStack gap={3} align="center" flexWrap="wrap">
                        <Heading size="lg">{vehicle.name}</Heading>
                        {vehicle.permission && (
                          <Box
                            px={3}
                            py={1}
                            borderRadius="full"
                            bg={isOwner ? 'brand.muted' : 'bg'}
                            borderWidth="1px"
                            borderColor="border"
                            fontSize="sm"
                            fontWeight="semibold"
                          >
                            {PERMISSION_LEVELS[vehicle.permission]}
                          </Box>
                        )}
                      </HStack>
                      <Text fontSize="md" color="textMuted">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </Text>
                    </Box>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                      {vehicle.licensePlate && (
                        <InfoTile label="Plat Nomor" value={vehicle.licensePlate} icon={FiActivity} />
                      )}
                      <InfoTile label="Odometer" value={formatOdometer(vehicle.currentOdometer)} icon={FiActivity} />
                      {vehicle.sharedBy && (
                        <InfoTile label="Dibagikan oleh" value={vehicle.sharedBy.name} icon={FiUser} />
                      )}
                    </SimpleGrid>

                    <HStack gap={3} flexWrap="wrap">
                      {canEdit && (
                        <RouterLink to={`${ROUTES.SERVICE_NEW}?vehicleId=${vehicle.id}`}>
                          <Button colorPalette="brand" h="48px">
                            <HStack as="span" gap={2}>
                              <Icon as={FiTool} />
                              <Text>Tambah Service</Text>
                            </HStack>
                          </Button>
                        </RouterLink>
                      )}
                      {isOwner && (
                        <RouterLink to={ROUTES.VEHICLE_EDIT(vehicle.id)}>
                          <Button variant="outline" h="48px">
                            <HStack as="span" gap={2}>
                              <Icon as={FiEdit2} />
                              <Text>Edit Kendaraan</Text>
                            </HStack>
                          </Button>
                        </RouterLink>
                      )}
                      {isOwner && (
                        <Button variant="outline" h="48px" onClick={() => setIsShareModalOpen(true)}>
                          <HStack as="span" gap={2}>
                            <Icon as={FiShare2} />
                            <Text>Kelola Berbagi</Text>
                          </HStack>
                        </Button>
                      )}
                    </HStack>
                  </Stack>
                </SimpleGrid>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <SummaryTile label="Odometer Terakhir" value={formatOdometer(vehicle.currentOdometer)} icon={FiActivity} />
                <SummaryTile label="Service Terakhir" value={latestService ? formatDate(latestService.serviceDate) : '-'} icon={FiCalendar} />
                <SummaryTile label="Biaya Terakhir" value={latestService?.cost ? formatCurrency(latestService.cost) : '-'} icon={FiDollarSign} />
              </SimpleGrid>

              {/* Tabs for Service History and Maintenance Schedule */}
              <Tabs.Root defaultValue="history" variant="line">
                <Tabs.List>
                  <Tabs.Trigger value="history">
                    <HStack gap={2}>
                      <Icon as={FiList} />
                      <Text>Riwayat Service</Text>
                    </HStack>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="maintenance">
                    <HStack gap={2}>
                      <Icon as={FiClock} />
                      <Text>Jadwal Perawatan</Text>
                    </HStack>
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="history">
                  <VStack align="stretch" gap={4} pt={4}>
                    <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap={3} direction={{ base: 'column', md: 'row' }}>
                      <Text fontSize="sm" color="textMuted">
                        Total catatan: {services.length}
                      </Text>
                    </Flex>

                    {isLoadingServices && <Text>Loading...</Text>}

                    {!isLoadingServices && (
                      <ServiceTimeline services={services} canEdit={canEdit} />
                    )}
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="maintenance">
                  <Box pt={4}>
                    <MaintenanceSchedule vehicleId={vehicleId} />
                  </Box>
                </Tabs.Content>
              </Tabs.Root>
            </>
          )}
        </VStack>
      </Container>

      {vehicle && (
        <ShareVehicleModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          vehicleId={vehicleId}
        />
      )}
    </Layout>
  );
}

interface InfoTileProps {
  label: string;
  value: string;
  icon: ElementType;
}

function InfoTile({ label, value, icon }: Readonly<InfoTileProps>) {
  return (
    <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="lg" p={3}>
      <HStack gap={2} mb={1} color="textMuted" fontSize="sm">
        <Icon as={icon} />
        <Text>{label}</Text>
      </HStack>
      <Text fontWeight="semibold">{value}</Text>
    </Box>
  );
}

function SummaryTile({ label, value, icon }: Readonly<InfoTileProps>) {
  return (
    <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={5}>
      <HStack justify="space-between" mb={2} color="textMuted">
        <Text fontSize="sm">{label}</Text>
        <Icon as={icon} />
      </HStack>
      <Text fontWeight="semibold" fontSize="lg">
        {value}
      </Text>
    </Box>
  );
}
