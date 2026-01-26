import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { FiBarChart2, FiBell, FiChevronDown, FiPlus, FiTool } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { PERMISSION_LEVELS, ROUTES } from '@/config/constants';
import { formatCurrency, formatOdometer } from '@/utils/format';
import type { VehicleResponse } from '@/types/vehicle.types';

interface StatsCardProps {
  title: string;
  value: string;
  helperText: string;
}

interface HealthMetric {
  label: string;
  value: number;
  status: 'ok' | 'warn' | 'danger';
}

const statusColorMap: Record<HealthMetric['status'], string> = {
  ok: 'brand.solid',
  warn: 'warning',
  danger: 'danger',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

function StatsCard({ title, value, helperText }: Readonly<StatsCardProps>) {
  return (
    <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={5}>
      <Text fontSize="sm" color="textMuted" mb={2}>
        {title}
      </Text>
      <Heading size="lg" mb={1}>
        {value}
      </Heading>
      <Text fontSize="xs" color="textMuted">
        {helperText}
      </Text>
    </Box>
  );
}

function VehicleCard({ vehicle }: Readonly<{ vehicle: VehicleResponse }>) {
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
              <Badge colorScheme={isOwner ? 'green' : 'blue'}>
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

export default function Dashboard() {
  const { user } = useAuth();
  const { ownedVehicles, sharedVehicles, isLoading } = useVehicles();
  const [activeTab, setActiveTab] = useState<'owned' | 'shared'>('owned');

  const totalVehicles = ownedVehicles.length + sharedVehicles.length;
  const primaryVehicle = ownedVehicles[0] ?? sharedVehicles[0];
  const visibleVehicles = activeTab === 'owned' ? ownedVehicles : sharedVehicles;

  const healthMetrics: HealthMetric[] = useMemo(
    () => [
      { label: 'Oli Mesin', value: 75, status: 'warn' },
      { label: 'Kampas Rem', value: 40, status: 'ok' },
      { label: 'Ban Depan', value: 85, status: 'danger' },
    ],
    [],
  );

  return (
    <Layout>
      <Container maxW="7xl">
        <VStack gap={8} align="stretch">
          <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={{ base: 5, md: 6 }}>
            <Flex direction={{ base: 'column', md: 'row' }} gap={6} justify="space-between" align={{ base: 'start', md: 'center' }}>
              <Stack gap={3} flex="1">
                <HStack gap={3}>
                  <Box
                    bg="brand.solid"
                    color="white"
                    borderRadius="full"
                    w="44px"
                    h="44px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                  >
                    {getInitials(user?.name ?? 'User')}
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="textMuted">
                      Selamat datang kembali
                    </Text>
                    <Heading size="md">{user?.name ?? 'Pengguna'}</Heading>
                  </Box>
                </HStack>

                <Text color="textMuted" maxW="lg">
                  Pantau kesehatan kendaraan dan catat servis terbaru. Semua catatan tersimpan rapi untuk Anda dan tim.
                </Text>
              </Stack>

              <HStack gap={3} align="center">
                <IconButton aria-label="Notifikasi" variant="outline">
                  <Icon as={FiBell} />
                </IconButton>
                <Button variant="outline">
                  <HStack as="span" gap={2}>
                    <Text>Pengaturan</Text>
                    <Icon as={FiChevronDown} />
                  </HStack>
                </Button>
                <RouterLink to={ROUTES.VEHICLE_CREATE}>
                  <Button colorScheme="brand">
                    <HStack as="span" gap={2}>
                      <Icon as={FiPlus} />
                      <Text>Tambah Kendaraan</Text>
                    </HStack>
                  </Button>
                </RouterLink>
              </HStack>
            </Flex>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            <StatsCard title="Total Kendaraan" value={`${totalVehicles}`} helperText="Termasuk kendaraan dibagikan" />
            <StatsCard title="Total Service" value="0" helperText="Service bulan ini" />
            <StatsCard title="Service Mendatang" value="0" helperText="Dalam 30 hari" />
            <StatsCard title="Total Biaya" value={formatCurrency(0)} helperText="Pengeluaran bulan ini" />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
            <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={5}>
              <Heading size="md" mb={4}>
                Health Status
              </Heading>
              <VStack align="stretch" gap={4}>
                {healthMetrics.map((metric) => (
                  <Box key={metric.label}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" color="textMuted">
                        {metric.label}
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {metric.value}%
                      </Text>
                    </Flex>
                    <Box h="6px" borderRadius="full" bg="border" overflow="hidden">
                      <Box h="6px" bg={statusColorMap[metric.status]} width={`${metric.value}%`} />
                    </Box>
                  </Box>
                ))}
                <Text fontSize="xs" color="textMuted">
                  TODO: Hubungkan dengan jadwal perawatan aktual.
                </Text>
              </VStack>
            </Box>

            <Box
              bg="surface"
              borderWidth="1px"
              borderColor="border"
              borderRadius="xl"
              p={5}
              gridColumn={{ base: 'auto', lg: 'span 2' }}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Aksi Cepat</Heading>
                <Text fontSize="sm" color="textMuted">
                  Geser untuk melihat semua
                </Text>
              </Flex>
              <HStack gap={4} overflowX="auto" pb={2} align="stretch">
                <RouterLink to={ROUTES.VEHICLE_CREATE}>
                  <Button size="lg" minW="200px" h="56px" colorScheme="brand">
                    <HStack as="span" gap={2}>
                      <Icon as={FiPlus} />
                      <Text>Tambah Kendaraan</Text>
                    </HStack>
                  </Button>
                </RouterLink>
                <RouterLink to={ROUTES.SERVICE_NEW}>
                  <Button size="lg" minW="200px" h="56px" variant="outline">
                    <HStack as="span" gap={2}>
                      <Icon as={FiTool} />
                      <Text>Catat Service Cepat</Text>
                    </HStack>
                  </Button>
                </RouterLink>
                <Button size="lg" minW="200px" h="56px" variant="outline" disabled>
                  <HStack as="span" gap={2}>
                    <Icon as={FiBarChart2} />
                    <Text>Statistik (Segera)</Text>
                  </HStack>
                </Button>
              </HStack>
            </Box>
          </SimpleGrid>

          <Box>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={4} direction={{ base: 'column', md: 'row' }} gap={4}>
              <Heading size="lg">Garasi Anda</Heading>
              <HStack gap={2} role="tablist" aria-label="Tabs kendaraan">
                <Button
                  size="sm"
                  variant={activeTab === 'owned' ? 'solid' : 'outline'}
                  colorScheme={activeTab === 'owned' ? 'brand' : undefined}
                  onClick={() => setActiveTab('owned')}
                  role="tab"
                  aria-selected={activeTab === 'owned'}
                >
                  Kendaraan Saya
                  <Badge ml={2} colorScheme="brand">
                    {ownedVehicles.length}
                  </Badge>
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'shared' ? 'solid' : 'outline'}
                  colorScheme={activeTab === 'shared' ? 'brand' : undefined}
                  onClick={() => setActiveTab('shared')}
                  role="tab"
                  aria-selected={activeTab === 'shared'}
                >
                  Dibagikan ke Saya
                  <Badge ml={2} colorScheme="gray">
                    {sharedVehicles.length}
                  </Badge>
                </Button>
              </HStack>
            </Flex>

            {isLoading && (
              <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={6}>
                <Text color="textMuted">Memuat data kendaraan...</Text>
              </Box>
            )}

            {!isLoading && ownedVehicles.length === 0 && sharedVehicles.length === 0 && (
              <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" textAlign="center" py={12}>
                <Text fontSize="lg" color="textMuted" mb={4}>
                  Belum ada kendaraan. Tambahkan kendaraan pertama Anda!
                </Text>
                <RouterLink to={ROUTES.VEHICLE_CREATE}>
                  <Button colorScheme="brand">Tambah Kendaraan</Button>
                </RouterLink>
              </Box>
            )}

            {!isLoading && totalVehicles > 0 && (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {visibleVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={6}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} mb={4} direction={{ base: 'column', md: 'row' }} gap={2}>
              <Heading size="md">Service Terbaru</Heading>
              {primaryVehicle && (
                <Text fontSize="sm" color="textMuted">
                  Kendaraan aktif: {primaryVehicle.name}
                </Text>
              )}
            </Flex>
            <Stack gap={4}>
              <Box textAlign="center" py={8} borderWidth="1px" borderColor="border" borderRadius="lg" bg="bg">
                <Text color="textMuted" mb={4}>
                  Belum ada service terbaru.
                </Text>
                <RouterLink to={ROUTES.SERVICE_NEW}>
                  <Button colorScheme="brand">Catat Service</Button>
                </RouterLink>
              </Box>
              <Text fontSize="xs" color="textMuted">
                TODO: Tampilkan 5 service terakhir dari semua kendaraan.
              </Text>
            </Stack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}
