import { Container, Heading, VStack, SimpleGrid, Box, Text, Button, Flex, Badge } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import Layout from '@/components/layout/Layout';
import { useVehicles } from '@/hooks/useVehicles';
import { ROUTES, PERMISSION_LEVELS } from '@/config/constants';
import { formatOdometer } from '@/utils/format';
import { VehicleResponse } from '@/types/vehicle.types';

function VehicleCard({ vehicle }: Readonly<{ vehicle: VehicleResponse }>) {
  const isOwner = vehicle.permission === 'owner' || !vehicle.permission;

  return (
    <RouterLink to={ROUTES.VEHICLE_DETAIL(vehicle.id)} style={{ textDecoration: 'none' }}>
      <Box
        bg="bg.muted"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        _hover={{ borderColor: 'brand.solid', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        position="relative"
        cursor="pointer"
      >
      {vehicle.photoUrl && (
        <Box
          h="200px"
          mb={4}
          borderRadius="md"
          backgroundImage={`url(${vehicle.photoUrl})`}
          backgroundSize="cover"
          backgroundPosition="center"
        />
      )}

      <VStack align="stretch" gap={2}>
        <Flex justify="space-between" align="start">
          <Heading size="md">{vehicle.name}</Heading>
          {vehicle.permission && (
            <Badge colorScheme={isOwner ? 'green' : 'blue'}>
              {PERMISSION_LEVELS[vehicle.permission]}
            </Badge>
          )}
        </Flex>

        <Text color="fg.muted">
          {vehicle.brand} {vehicle.model} ({vehicle.year})
        </Text>

        {vehicle.licensePlate && (
          <Text fontSize="sm" fontWeight="semibold">
            {vehicle.licensePlate}
          </Text>
        )}

        <Text fontSize="sm" color="fg.muted">
          Odometer: {formatOdometer(vehicle.currentOdometer)}
        </Text>

        {vehicle.sharedBy && (
          <Text fontSize="xs" color="fg.subtle">
            Dibagikan oleh: {vehicle.sharedBy.name}
          </Text>
        )}
      </VStack>
      </Box>
    </RouterLink>
  );
}

export default function Dashboard() {
  const { ownedVehicles, sharedVehicles, isLoading } = useVehicles();

  return (
    <Layout>
      <Container maxW="7xl">
        <VStack gap={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading>Dashboard</Heading>
            <RouterLink to={ROUTES.VEHICLE_CREATE}>
              <Button colorScheme="brand">
                Tambah Kendaraan
              </Button>
            </RouterLink>
          </Flex>

          {isLoading && <Text>Loading...</Text>}

          {!isLoading && ownedVehicles.length === 0 && sharedVehicles.length === 0 && (
            <Box textAlign="center" py={12}>
              <Text fontSize="lg" color="fg.muted" mb={4}>
                Belum ada kendaraan. Tambahkan kendaraan pertama Anda!
              </Text>
              <RouterLink to={ROUTES.VEHICLE_CREATE}>
                <Button colorScheme="brand">
                  Tambah Kendaraan
                </Button>
              </RouterLink>
            </Box>
          )}

          {ownedVehicles.length > 0 && (
            <VStack align="stretch" gap={4}>
              <Heading size="lg">Kendaraan Saya</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {ownedVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </SimpleGrid>
            </VStack>
          )}

          {sharedVehicles.length > 0 && (
            <VStack align="stretch" gap={4}>
              <Heading size="lg">Kendaraan Dibagikan</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {sharedVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </SimpleGrid>
            </VStack>
          )}
        </VStack>
      </Container>
    </Layout>
  );
}
