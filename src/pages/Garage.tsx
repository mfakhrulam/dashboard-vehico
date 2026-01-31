import { useState } from 'react';
import { Badge, Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import VehicleCard from '@/components/features/vehicles/VehicleCard';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { ROUTES } from '@/config/constants';
import { useVehicles } from '@/hooks/useVehicles';

export default function Garage() {
  const navigate = useNavigate();
  const { ownedVehicles, sharedVehicles, isLoading } = useVehicles();
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'shared'>('all');

  const totalVehicles = ownedVehicles.length + sharedVehicles.length;
  const allVehicles = [...ownedVehicles, ...sharedVehicles];
  
  const getVisibleVehicles = () => {
    if (activeTab === 'all') return allVehicles;
    if (activeTab === 'owned') return ownedVehicles;
    return sharedVehicles;
  };
  const visibleVehicles = getVisibleVehicles();

  return (
    <Layout>
      <Container maxW="7xl">
        <PageHeader
          title="Garasi"
          description="Kelola semua kendaraan yang Anda miliki atau dibagikan."
          actions={
            <Button colorPalette="brand" onClick={() => navigate(ROUTES.VEHICLE_CREATE)}>
              Tambah Kendaraan
            </Button>
          }
        />

        <VStack gap={6} align="stretch">
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
            <Heading size="md">Daftar Kendaraan</Heading>
            <HStack gap={2} role="tablist" aria-label="Tabs kendaraan">
              <Button
                size="md"
                h="48px"
                variant={activeTab === 'all' ? 'solid' : 'outline'}
                colorPalette={activeTab === 'all' ? 'brand' : undefined}
                onClick={() => setActiveTab('all')}
                role="tab"
                aria-selected={activeTab === 'all'}
              >
                Semua
                <Badge ml={2} colorPalette="brand">
                  {totalVehicles}
                </Badge>
              </Button>
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

          {!isLoading && totalVehicles === 0 && (
            <EmptyState
              title="Belum ada kendaraan"
              description="Tambahkan kendaraan untuk mulai mencatat service."
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

          {!isLoading && totalVehicles > 0 && visibleVehicles.length === 0 && (
            <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={6} textAlign="center">
              <Text color="textMuted">Belum ada kendaraan pada tab ini.</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Layout>
  );
}
