import { Box, Button, Container, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import type { ElementType } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import { FiActivity, FiCalendar, FiDollarSign, FiEdit2, FiShare2, FiTool, FiUser } from 'react-icons/fi';
import { useVehicle } from '@/hooks/useVehicles';
import { useServices } from '@/hooks/useServices';
import { ROUTES, PERMISSION_LEVELS, SERVICE_TYPES } from '@/config/constants';
import { formatOdometer, formatDate, formatCurrency } from '@/utils/format';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number.parseInt(id || '0', 10);

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
                          <Button colorScheme="brand" h="48px">
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
                        <RouterLink to={ROUTES.VEHICLE_SHARE(vehicle.id)}>
                          <Button variant="outline" h="48px">
                            <HStack as="span" gap={2}>
                              <Icon as={FiShare2} />
                              <Text>Kelola Berbagi</Text>
                            </HStack>
                          </Button>
                        </RouterLink>
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

              <VStack align="stretch" gap={4}>
                <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap={3} direction={{ base: 'column', md: 'row' }}>
                  <Heading size="lg">Riwayat Service</Heading>
                  <Text fontSize="sm" color="textMuted">
                    Total catatan: {services.length}
                  </Text>
                </Flex>

                {isLoadingServices && <Text>Loading...</Text>}

                {!isLoadingServices && services.length === 0 && (
                  <Box textAlign="center" py={8} bg="bg" borderRadius="lg" borderWidth="1px" borderColor="border">
                    <Text color="textMuted">Belum ada riwayat service</Text>
                  </Box>
                )}

                {services.map((service) => (
                  <Box key={service.id} bg="surface" p={6} borderRadius="xl" borderWidth="1px" borderColor="border">
                    <Flex justify="space-between" align="start" mb={3} gap={4} flexWrap="wrap">
                      <VStack align="start" gap={2}>
                        <Box
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg="bg"
                          borderWidth="1px"
                          borderColor="border"
                          fontSize="sm"
                          fontWeight="semibold"
                        >
                          {SERVICE_TYPES[service.serviceType]}
                        </Box>
                        <HStack gap={2} color="textMuted" fontSize="sm">
                          <Icon as={FiCalendar} />
                          <Text>{formatDate(service.serviceDate)}</Text>
                        </HStack>
                      </VStack>
                      <VStack align="end" gap={2}>
                        <Text fontWeight="semibold">{formatOdometer(service.odometer)}</Text>
                        {canEdit && (
                          <HStack gap={2}>
                            <RouterLink to={ROUTES.SERVICE_EDIT(service.id)}>
                              <Button size="sm" variant="outline" h="36px">
                                Edit
                              </Button>
                            </RouterLink>
                            <Button size="sm" variant="ghost" h="36px" disabled>
                              Hapus
                            </Button>
                          </HStack>
                        )}
                      </VStack>
                    </Flex>

                    {service.partsReplaced && service.partsReplaced.length > 0 && (
                      <Box mb={3}>
                        <Text fontWeight="semibold" fontSize="sm" mb={1}>
                          Part yang diganti
                        </Text>
                        <VStack align="start" gap={1}>
                          {service.partsReplaced.map((part) => (
                            <Text key={`${part.name}-${part.brand ?? 'na'}-${part.quantity ?? 1}`} fontSize="sm" color="textMuted">
                              • {part.name}
                              {part.brand && ` (${part.brand})`}
                              {part.quantity && ` x${part.quantity}`}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                      {service.cost !== null && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold">
                            Biaya:
                          </Text>{' '}
                          {formatCurrency(service.cost)}
                        </Text>
                      )}

                      {service.workshopName && (
                        <Text fontSize="sm">
                          <Text as="span" fontWeight="semibold">
                            Bengkel:
                          </Text>{' '}
                          {service.workshopName}
                        </Text>
                      )}
                    </SimpleGrid>

                    {service.notes && (
                      <Text fontSize="sm" mt={2} color="textMuted">
                        {service.notes}
                      </Text>
                    )}

                    {service.receiptPhotoUrl && (
                      <Box
                        mt={3}
                        h="170px"
                        borderRadius="md"
                        backgroundImage={`url(${service.receiptPhotoUrl})`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                      />
                    )}

                    <HStack mt={3} gap={2} fontSize="xs" color="textMuted">
                      <Icon as={FiUser} />
                      <Text>Oleh: {service.performedBy.name}</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </>
          )}
        </VStack>
      </Container>
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
