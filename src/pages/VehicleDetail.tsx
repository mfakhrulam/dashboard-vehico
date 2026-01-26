import { Container, Heading, VStack, Box, Text, Flex, Badge, SimpleGrid, Button, HStack } from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router';
import { useVehicle } from '@/hooks/useVehicles';
import { useServices } from '@/hooks/useServices';
import { ROUTES, PERMISSION_LEVELS, SERVICE_TYPES } from '@/config/constants';
import { formatOdometer, formatDate, formatCurrency } from '@/utils/format';
import Layout from '@/components/layout/Layout';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number.parseInt(id || '0', 10);

  const { vehicle, isLoading: isLoadingVehicle } = useVehicle(vehicleId);
  const { services, isLoading: isLoadingServices } = useServices(vehicleId);

  const isOwner = vehicle?.permission === 'owner' || !vehicle?.permission;
  const canEdit = vehicle?.permission === 'owner' || vehicle?.permission === 'edit';

  return (
    <Layout>
      <Container maxW="7xl">
        <VStack gap={8} align="stretch">
          {isLoadingVehicle && <Text>Loading...</Text>}

          {vehicle && (
            <>
              {/* Vehicle Info */}
              <Box bg="bg.muted" p={6} borderRadius="lg" borderWidth="1px">
                <Flex justify="space-between" align="start" mb={4}>
                  <VStack align="start" gap={2}>
                    <Flex align="center" gap={3}>
                      <Heading size="xl">{vehicle.name}</Heading>
                      {vehicle.permission && (
                        <Badge colorScheme={isOwner ? 'green' : 'blue'} fontSize="md">
                          {PERMISSION_LEVELS[vehicle.permission]}
                        </Badge>
                      )}
                    </Flex>
                    <Text fontSize="lg" color="fg.muted">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </Text>
                  </VStack>

                  {isOwner && (
                    <RouterLink to={ROUTES.VEHICLE_EDIT(vehicle.id)}>
                      <Button size="sm">
                        Edit
                      </Button>
                    </RouterLink>
                  )}
                </Flex>

                {vehicle.photoUrl && (
                  <Box
                    h="300px"
                    mb={4}
                    borderRadius="md"
                    backgroundImage={`url(${vehicle.photoUrl})`}
                    backgroundSize="cover"
                    backgroundPosition="center"
                  />
                )}

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  {vehicle.licensePlate && (
                    <Box>
                      <Text fontWeight="semibold" mb={1}>
                        Plat Nomor
                      </Text>
                      <Text>{vehicle.licensePlate}</Text>
                    </Box>
                  )}

                  <Box>
                    <Text fontWeight="semibold" mb={1}>
                      Odometer
                    </Text>
                    <Text>{formatOdometer(vehicle.currentOdometer)}</Text>
                  </Box>

                  {vehicle.sharedBy && (
                    <Box>
                      <Text fontWeight="semibold" mb={1}>
                        Dibagikan oleh
                      </Text>
                      <Text>{vehicle.sharedBy.name}</Text>
                    </Box>
                  )}
                </SimpleGrid>

                {isOwner && (
                  <Box mt={4}>
                    <RouterLink to={ROUTES.VEHICLE_SHARE(vehicle.id)}>
                      <Button size="sm" variant="outline">
                        Kelola Berbagi
                      </Button>
                    </RouterLink>
                  </Box>
                )}
              </Box>

              {/* Service History */}
              <VStack align="stretch" gap={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="lg">Riwayat Service</Heading>
                  {canEdit && (
                    <RouterLink to={`${ROUTES.SERVICE_NEW}?vehicleId=${vehicle.id}`}>
                      <Button colorScheme="brand" size="sm">
                        Tambah Service
                      </Button>
                    </RouterLink>
                  )}
                </Flex>

                {isLoadingServices && <Text>Loading...</Text>}

                {!isLoadingServices && services.length === 0 && (
                  <Box textAlign="center" py={8} bg="bg.subtle" borderRadius="lg">
                    <Text color="fg.muted">Belum ada riwayat service</Text>
                  </Box>
                )}

                {services.map((service) => (
                  <Box key={service.id} bg="bg.muted" p={6} borderRadius="lg" borderWidth="1px">
                    <Flex justify="space-between" align="start" mb={3}>
                      <VStack align="start" gap={1}>
                        <Badge colorScheme="blue">{SERVICE_TYPES[service.serviceType]}</Badge>
                        <Text fontSize="sm" color="fg.muted">
                          {formatDate(service.serviceDate)}
                        </Text>
                      </VStack>
                      <VStack align="end" gap={1}>
                        <Text fontWeight="semibold">{formatOdometer(service.odometer)}</Text>
                        {canEdit && (
                          <HStack gap={2}>
                            <RouterLink to={ROUTES.SERVICE_EDIT(service.id)}>
                              <Button size="xs" variant="outline">
                                Edit
                              </Button>
                            </RouterLink>
                            <Button size="xs" variant="ghost" disabled>
                              Hapus
                            </Button>
                          </HStack>
                        )}
                      </VStack>
                    </Flex>

                    {service.partsReplaced && service.partsReplaced.length > 0 && (
                      <Box mb={2}>
                        <Text fontWeight="semibold" fontSize="sm" mb={1}>
                          Part yang diganti:
                        </Text>
                        <VStack align="start" gap={1}>
                          {service.partsReplaced.map((part) => (
                            <Text key={`${part.name}-${part.brand ?? 'na'}-${part.quantity ?? 1}`} fontSize="sm">
                              • {part.name}
                              {part.brand && ` (${part.brand})`}
                              {part.quantity && ` x${part.quantity}`}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}

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

                    {service.notes && (
                      <Text fontSize="sm" mt={2} color="fg.muted">
                        {service.notes}
                      </Text>
                    )}

                    {service.receiptPhotoUrl && (
                      <Box
                        mt={3}
                        h="150px"
                        borderRadius="md"
                        backgroundImage={`url(${service.receiptPhotoUrl})`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                      />
                    )}

                    <Text fontSize="xs" color="fg.subtle" mt={2}>
                      Oleh: {service.performedBy.name}
                    </Text>
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
