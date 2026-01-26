import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
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
import { Link as RouterLink, useNavigate } from 'react-router';
import { FiActivity, FiBarChart2, FiBell, FiChevronDown, FiClock, FiDollarSign, FiPlus, FiTool, FiTruck } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { ROUTES } from '@/config/constants';
import { formatCurrency, formatOdometer } from '@/utils/format';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VehicleCard from '@/components/features/vehicles/VehicleCard';
import Layout from '@/components/layout/Layout';

interface StatsCardProps {
  title: string;
  value: string;
  helperText: string;
  icon: ElementType;
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

function StatsCard({ title, value, helperText, icon }: Readonly<StatsCardProps>) {
  return (
    <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={5}>
      <HStack justify="space-between" align="start" mb={3}>
        <Box>
          <Text fontSize="sm" color="textMuted" mb={1}>
            {title}
          </Text>
          <Heading size="lg">{value}</Heading>
        </Box>
        <Box bg="brand.subtle" borderWidth="1px" borderColor="brand.emphasized" borderRadius="lg" p={2} color="brand.fg">
          <Icon as={icon} boxSize={5} />
        </Box>
      </HStack>
      <Text fontSize="xs" color="textMuted">
        {helperText}
      </Text>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
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
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="stretch">
              <Stack gap={4} justify="space-between">
                <HStack gap={3}>
                  <Box
                    bg="brand.solid"
                    color="brand.contrast"
                    borderRadius="full"
                    w="48px"
                    h="48px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="md"
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

                <HStack gap={3} flexWrap="wrap" align="center">
                  <IconButton aria-label="Notifikasi" variant="outline" size="lg">
                    <Icon as={FiBell} />
                  </IconButton>
                  <Button variant="outline" h="48px">
                    <HStack as="span" gap={2}>
                      <Text>Pengaturan</Text>
                      <Icon as={FiChevronDown} />
                    </HStack>
                  </Button>
                  <RouterLink to={ROUTES.VEHICLE_CREATE}>
                    <Button colorPalette="brand" h="48px">
                      <HStack as="span" gap={2}>
                        <Icon as={FiPlus} />
                        <Text>Tambah Kendaraan</Text>
                      </HStack>
                    </Button>
                  </RouterLink>
                </HStack>
              </Stack>

              <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="xl" p={4} display="flex" flexDirection="column" gap={4}>
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  h={{ base: '160px', md: '190px' }}
                  backgroundImage={primaryVehicle?.photoUrl ? `url(${primaryVehicle.photoUrl})` : undefined}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  bg={primaryVehicle?.photoUrl ? undefined : 'brand.muted'}
                >
                  {!primaryVehicle?.photoUrl && (
                    <Flex h="full" align="center" justify="center">
                      <Icon as={FiTruck} boxSize={10} color="brand.solid" />
                    </Flex>
                  )}
                </Box>

                <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                  <Box>
                    <Text fontSize="sm" color="textMuted">
                      Kendaraan aktif
                    </Text>
                    <Heading size="sm">
                      {primaryVehicle ? primaryVehicle.name : 'Belum ada kendaraan'}
                    </Heading>
                    <Text fontSize="sm" color="textMuted">
                      {primaryVehicle ? `${primaryVehicle.brand} ${primaryVehicle.model}` : 'Tambahkan kendaraan untuk mulai.'}
                    </Text>
                  </Box>
                  {primaryVehicle && (
                    <RouterLink to={ROUTES.VEHICLE_DETAIL(primaryVehicle.id)}>
                      <Button variant="outline" size="sm" h="40px">
                        Lihat Detail
                      </Button>
                    </RouterLink>
                  )}
                </Flex>

                {primaryVehicle && (
                  <HStack gap={4} flexWrap="wrap">
                    <Box>
                      <Text fontSize="xs" color="textMuted">
                        Odometer
                      </Text>
                      <Text fontWeight="semibold">{formatOdometer(primaryVehicle.currentOdometer)}</Text>
                    </Box>
                    {primaryVehicle.licensePlate && (
                      <Box>
                        <Text fontSize="xs" color="textMuted">
                          Plat Nomor
                        </Text>
                        <Text fontWeight="semibold">{primaryVehicle.licensePlate}</Text>
                      </Box>
                    )}
                  </HStack>
                )}
              </Box>
            </SimpleGrid>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            <StatsCard title="Total Kendaraan" value={`${totalVehicles}`} helperText="Termasuk kendaraan dibagikan" icon={FiTruck} />
            <StatsCard title="Total Service" value="0" helperText="Service bulan ini" icon={FiActivity} />
            <StatsCard title="Service Mendatang" value="0" helperText="Dalam 30 hari" icon={FiClock} />
            <StatsCard title="Total Biaya" value={formatCurrency(0)} helperText="Pengeluaran bulan ini" icon={FiDollarSign} />
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
                    <Box h="8px" borderRadius="full" bg="border" overflow="hidden">
                      <Box h="8px" bg={statusColorMap[metric.status]} width={`${metric.value}%`} />
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
                  <Button size="lg" minW="200px" h="56px" colorPalette="brand">
                    <HStack as="span" gap={2}>
                      <Icon as={FiPlus} />
                      <Text>Tambah Kendaraan</Text>
                    </HStack>
                  </Button>
                </RouterLink>
                <RouterLink
                  to={
                    primaryVehicle
                      ? `${ROUTES.SERVICE_NEW}?vehicleId=${primaryVehicle.id}`
                      : ROUTES.SERVICE_NEW
                  }
                >
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
                  size="md"
                  h="48px"
                  variant={activeTab === 'owned' ? 'solid' : 'outline'}
                  colorPalette={activeTab === 'owned' ? 'brand' : undefined}
                  onClick={() => setActiveTab('owned')}
                  role="tab"
                  aria-selected={activeTab === 'owned'}
                >
                  Kendaraan Saya
                  <Badge ml={2} colorPalette="brand">
                    {ownedVehicles.length}
                  </Badge>
                </Button>
                <Button
                  size="md"
                  h="48px"
                  variant={activeTab === 'shared' ? 'solid' : 'outline'}
                  colorPalette={activeTab === 'shared' ? 'brand' : undefined}
                  onClick={() => setActiveTab('shared')}
                  role="tab"
                  aria-selected={activeTab === 'shared'}
                >
                  Dibagikan ke Saya
                  <Badge ml={2} colorPalette="gray">
                    {sharedVehicles.length}
                  </Badge>
                </Button>
              </HStack>
            </Flex>

            {isLoading && <LoadingSpinner label="Memuat data kendaraan..." />}

            {!isLoading && ownedVehicles.length === 0 && sharedVehicles.length === 0 && (
              <EmptyState
                title="Belum ada kendaraan"
                description="Tambahkan kendaraan pertama Anda untuk mulai mencatat service."
                actionLabel="Tambah Kendaraan"
                onAction={() => navigate(ROUTES.VEHICLE_CREATE)}
              />
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
                <RouterLink
                  to={
                    primaryVehicle
                      ? `${ROUTES.SERVICE_NEW}?vehicleId=${primaryVehicle.id}`
                      : ROUTES.SERVICE_NEW
                  }
                >
                  <Button colorPalette="brand">Catat Service</Button>
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
