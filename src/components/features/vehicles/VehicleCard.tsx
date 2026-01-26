import { Badge, Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { PERMISSION_LEVELS, ROUTES } from '@/config/constants';
import { formatOdometer } from '@/utils/format';
import type { VehicleResponse } from '@/types/vehicle.types';

interface VehicleCardProps {
  vehicle: VehicleResponse;
}

export default function VehicleCard({ vehicle }: Readonly<VehicleCardProps>) {
  const isOwner = vehicle.permission === 'owner' || !vehicle.permission;

  return (
    <RouterLink to={ROUTES.VEHICLE_DETAIL(vehicle.id)} style={{ textDecoration: 'none' }}>
      <Box
        bg="surface"
        p={6}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        _hover={{ borderColor: 'brand.solid', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        position="relative"
        cursor="pointer"
      >
        {vehicle.photoUrl ? (
          <Box
            h="180px"
            mb={4}
            borderRadius="lg"
            backgroundImage={`url(${vehicle.photoUrl})`}
            backgroundSize="cover"
            backgroundPosition="center"
          />
        ) : (
          <Box
            h="180px"
            mb={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border"
            bg="bg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" color="textMuted">
              Foto kendaraan belum tersedia
            </Text>
          </Box>
        )}

        <VStack align="stretch" gap={2}>
          <Flex justify="space-between" align="start">
            <Heading size="md">{vehicle.name}</Heading>
            {vehicle.permission && (
              <Badge colorPalette={isOwner ? 'green' : 'blue'}>
                {PERMISSION_LEVELS[vehicle.permission]}
              </Badge>
            )}
          </Flex>

          <Text color="textMuted">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </Text>

          {vehicle.licensePlate && (
            <Text fontSize="sm" fontWeight="semibold">
              {vehicle.licensePlate}
            </Text>
          )}

          <Text fontSize="sm" color="textMuted">
            Odometer: {formatOdometer(vehicle.currentOdometer)}
          </Text>

          {vehicle.sharedBy && (
            <Text fontSize="xs" color="textMuted">
              Dibagikan oleh: {vehicle.sharedBy.name}
            </Text>
          )}
        </VStack>
      </Box>
    </RouterLink>
  );
}
