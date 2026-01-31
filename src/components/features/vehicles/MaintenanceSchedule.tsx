import { Box, Flex, HStack, Icon, Progress, SimpleGrid, Text, VStack, Badge } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';
import { vehicleService } from '@/services/vehicle.service';
import { formatOdometer, formatDate } from '@/utils/format';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { MaintenanceItem } from '@/types/vehicle.types';

interface MaintenanceScheduleProps {
  vehicleId: number;
}

// Get status color and icon
function getStatusInfo(status: MaintenanceItem['status']) {
  switch (status) {
    case 'overdue':
      return {
        colorPalette: 'red',
        icon: FiAlertCircle,
        label: 'Lewat Jadwal',
        bgColor: 'red.muted',
        textColor: 'red.fg',
      };
    case 'warning':
      return {
        colorPalette: 'orange',
        icon: FiAlertTriangle,
        label: 'Segera',
        bgColor: 'orange.muted',
        textColor: 'orange.fg',
      };
    case 'ok':
      return {
        colorPalette: 'green',
        icon: FiCheckCircle,
        label: 'OK',
        bgColor: 'green.muted',
        textColor: 'green.fg',
      };
    default:
      return {
        colorPalette: 'gray',
        icon: FiHelpCircle,
        label: 'Belum Dicatat',
        bgColor: 'gray.muted',
        textColor: 'gray.fg',
      };
  }
}

// Get progress bar color based on percentage
function getProgressColor(progress: number | null): string {
  if (progress === null) return 'gray';
  if (progress >= 100) return 'red';
  if (progress >= 70) return 'orange';
  return 'green';
}

export default function MaintenanceSchedule({ vehicleId }: Readonly<MaintenanceScheduleProps>) {
  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ['vehicle-maintenance', vehicleId],
    queryFn: async () => {
      const response = await vehicleService.getMaintenanceSchedule(vehicleId);
      return response.data;
    },
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return <LoadingSpinner label="Memuat jadwal perawatan..." />;
  }

  if (error) {
    return (
      <Box textAlign="center" py={6} bg="red.muted" borderRadius="lg">
        <Text color="red.fg">Gagal memuat jadwal perawatan</Text>
      </Box>
    );
  }

  if (!schedule?.items.length) {
    return (
      <Box textAlign="center" py={8} bg="bg" borderRadius="lg" borderWidth="1px" borderColor="border">
        <Icon as={FiHelpCircle} boxSize={8} color="textMuted" mb={2} />
        <Text color="textMuted">Tidak ada data perawatan</Text>
        <Text color="textMuted" fontSize="sm">
          Tambahkan catatan service dengan part yang diganti untuk melihat jadwal
        </Text>
      </Box>
    );
  }

  // Separate items by status for summary
  const overdueItems = schedule.items.filter((item) => item.status === 'overdue');
  const warningItems = schedule.items.filter((item) => item.status === 'warning');
  const okItems = schedule.items.filter((item) => item.status === 'ok');

  return (
    <VStack align="stretch" gap={6}>
      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <SummaryCard
          label="Lewat Jadwal"
          count={overdueItems.length}
          colorPalette="red"
          icon={FiAlertCircle}
        />
        <SummaryCard
          label="Segera Ganti"
          count={warningItems.length}
          colorPalette="orange"
          icon={FiAlertTriangle}
        />
        <SummaryCard
          label="Kondisi Baik"
          count={okItems.length}
          colorPalette="green"
          icon={FiCheckCircle}
        />
      </SimpleGrid>

      {/* Maintenance Items */}
      <VStack align="stretch" gap={3}>
        {schedule.items.map((item) => (
          <MaintenanceItemCard key={item.partName} item={item} />
        ))}
      </VStack>
    </VStack>
  );
}

interface SummaryCardProps {
  label: string;
  count: number;
  colorPalette: string;
  icon: React.ElementType;
}

function SummaryCard({ label, count, colorPalette, icon }: Readonly<SummaryCardProps>) {
  return (
    <Box
      bg="surface"
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      p={5}
      borderLeftWidth="4px"
      borderLeftColor={`${colorPalette}.solid`}
    >
      <HStack justify="space-between">
        <VStack align="start" gap={0}>
          <Text fontSize="2xl" fontWeight="bold">
            {count}
          </Text>
          <Text fontSize="sm" color="textMuted">
            {label}
          </Text>
        </VStack>
        <Icon as={icon} boxSize={6} color={`${colorPalette}.solid`} />
      </HStack>
    </Box>
  );
}

interface MaintenanceItemCardProps {
  item: MaintenanceItem;
}

function MaintenanceItemCard({ item }: Readonly<MaintenanceItemCardProps>) {
  const statusInfo = getStatusInfo(item.status);
  const maxProgress = Math.max(item.kmProgress ?? 0, item.monthProgress ?? 0);
  const displayProgress = Math.min(maxProgress, 100); // Cap at 100 for progress bar

  return (
    <Box
      bg="surface"
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      p={{ base: 4, md: 5 }}
      _hover={{ borderColor: `${statusInfo.colorPalette}.muted` }}
      transition="border-color 0.2s"
    >
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        gap={3}
        mb={3}
        direction={{ base: 'column', md: 'row' }}
      >
        <HStack gap={3}>
          <Box
            p={2}
            bg={statusInfo.bgColor}
            borderRadius="lg"
          >
            <Icon as={statusInfo.icon} boxSize={5} color={statusInfo.textColor} />
          </Box>
          <VStack align="start" gap={0}>
            <Text fontWeight="semibold">{item.partName}</Text>
            <Text fontSize="sm" color="textMuted">
              {item.vehicleType === 'motor' ? 'Motor' : 'Mobil'}
            </Text>
          </VStack>
        </HStack>
        <Badge colorPalette={statusInfo.colorPalette} size="lg">
          {statusInfo.label}
        </Badge>
      </Flex>

      {/* Progress Bar */}
      {item.status !== 'unknown' && (
        <Box mb={3}>
          <Progress.Root
            value={displayProgress}
            size="sm"
            borderRadius="full"
            colorPalette={getProgressColor(maxProgress)}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="textMuted" mt={1}>
            {maxProgress}% dari interval
            {maxProgress > 100 && ` (terlambat ${maxProgress - 100}%)`}
          </Text>
        </Box>
      )}

      {/* Details Grid */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={2} fontSize="sm">
        {/* Interval Info */}
        <Box>
          <Text color="textMuted">Interval:</Text>
          <Text>
            {item.recommendedIntervalKm && `${item.recommendedIntervalKm.toLocaleString('id-ID')} km`}
            {item.recommendedIntervalKm && item.recommendedIntervalMonths && ' / '}
            {item.recommendedIntervalMonths && `${item.recommendedIntervalMonths} bulan`}
          </Text>
        </Box>

        {/* Last Service */}
        <Box>
          <Text color="textMuted">Terakhir Diganti:</Text>
          <Text>
            {item.lastServiceDate
              ? `${formatDate(item.lastServiceDate)} (${formatOdometer(item.lastServiceOdometer ?? 0)})`
              : 'Belum pernah'}
          </Text>
        </Box>

        {/* Next Due KM */}
        {item.nextDueKm && (
          <Box>
            <Text color="textMuted">Ganti Berikutnya (KM):</Text>
            <Text fontWeight={item.status === 'overdue' ? 'bold' : 'normal'} color={item.status === 'overdue' ? 'fg.error' : undefined}>
              {formatOdometer(item.nextDueKm)}
            </Text>
          </Box>
        )}

        {/* Next Due Date */}
        {item.nextDueDate && (
          <Box>
            <Text color="textMuted">Ganti Berikutnya (Tanggal):</Text>
            <Text fontWeight={item.status === 'overdue' ? 'bold' : 'normal'} color={item.status === 'overdue' ? 'fg.error' : undefined}>
              {formatDate(item.nextDueDate)}
            </Text>
          </Box>
        )}
      </SimpleGrid>
    </Box>
  );
}
