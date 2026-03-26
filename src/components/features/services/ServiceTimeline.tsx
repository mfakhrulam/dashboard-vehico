import { Box, Circle, Flex, HStack, Icon, Text, VStack, Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router';
import { FiCalendar, FiEdit2, FiSettings, FiTool, FiRefreshCw, FiPackage, FiUser, FiTrash2 } from 'react-icons/fi';
import type { ServiceRecordResponse } from '@/types/service.types';
import type { ServiceType } from '@/types/common.types';
import { SERVICE_TYPES, ROUTES } from '@/config/constants';
import { formatDate, formatOdometer, formatCurrency } from '@/utils/format';
import { serviceService } from '@/services/service.service';
import { toaster } from '@/components/ui/toaster';
import { parseApiError } from '@/utils/error';

interface ServiceTimelineProps {
  services: ServiceRecordResponse[];
  canEdit?: boolean;
}

// Get icon based on service type
function getServiceIcon(type: ServiceType) {
  switch (type) {
    case 'ringan':
      return FiRefreshCw;
    case 'rutin':
      return FiSettings;
    case 'perbaikan':
      return FiTool;
    case 'ganti_part':
      return FiPackage;
    default:
      return FiTool;
  }
}

// Get color based on service type
function getServiceColor(type: ServiceType) {
  switch (type) {
    case 'ringan':
      return 'green';
    case 'rutin':
      return 'blue';
    case 'perbaikan':
      return 'orange';
    case 'ganti_part':
      return 'purple';
    default:
      return 'gray';
  }
}

// Group services by month/year
function groupServicesByMonth(services: ServiceRecordResponse[]) {
  const groups: Record<string, ServiceRecordResponse[]> = {};

  for (const service of services) {
    const date = new Date(service.serviceDate);
    const displayKey = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);

    if (!groups[displayKey]) {
      groups[displayKey] = [];
    }
    groups[displayKey].push(service);
  }

  // Sort groups by date (newest first)
  return Object.entries(groups).sort((a, b) => {
    const dateA = new Date(a[1][0].serviceDate);
    const dateB = new Date(b[1][0].serviceDate);
    return dateB.getTime() - dateA.getTime();
  });
}

export default function ServiceTimeline({ services, canEdit = false }: Readonly<ServiceTimelineProps>) {
  const queryClient = useQueryClient();
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(null);

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: number) => serviceService.delete(serviceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      await queryClient.invalidateQueries({ queryKey: ['service'] });
      toaster.create({
        title: 'Service dihapus',
        description: 'Catatan service berhasil dihapus.',
        type: 'success',
      });
    },
    onError: (error) => {
      const { message } = parseApiError(error);
      toaster.create({
        title: 'Gagal menghapus service',
        description: message,
        type: 'error',
      });
    },
    onSettled: () => {
      setDeletingServiceId(null);
    },
  });

  const handleDeleteService = (serviceId: number) => {
    const confirmed = globalThis.confirm('Hapus catatan service ini? Aksi ini tidak bisa dibatalkan.');
    if (!confirmed) return;
    setDeletingServiceId(serviceId);
    deleteServiceMutation.mutate(serviceId);
  };

  if (services.length === 0) {
    return (
      <Box textAlign="center" py={8} bg="bg" borderRadius="lg" borderWidth="1px" borderColor="border">
        <Text color="textMuted">Belum ada riwayat service</Text>
      </Box>
    );
  }

  const groupedServices = groupServicesByMonth(services);

  return (
    <VStack align="stretch" gap={6}>
      {groupedServices.map(([monthYear, monthServices]) => (
        <Box key={monthYear}>
          {/* Month/Year Header */}
          <HStack gap={3} mb={4}>
            <Box
              px={4}
              py={2}
              bg="brand.muted"
              borderRadius="full"
              borderWidth="1px"
              borderColor="brand.muted"
            >
              <HStack gap={2}>
                <Icon as={FiCalendar} color="brand.fg" />
                <Text fontWeight="semibold" fontSize="sm" color="brand.fg">
                  {monthYear}
                </Text>
              </HStack>
            </Box>
            <Box flex="1" h="1px" bg="border" />
            <Text fontSize="sm" color="textMuted">
              {monthServices.length} catatan
            </Text>
          </HStack>

          {/* Timeline Items */}
          <VStack align="stretch" gap={0} position="relative">
            {/* Vertical Line */}
            <Box
              position="absolute"
              left="15px"
              top="24px"
              bottom="24px"
              w="2px"
              bg="border"
              display={{ base: 'none', md: 'block' }}
            />

            {monthServices.map((service, index) => {
              const ServiceIcon = getServiceIcon(service.serviceType);
              const colorPalette = getServiceColor(service.serviceType);
              const isLast = index === monthServices.length - 1;

              return (
                <HStack
                  key={service.id}
                  align="start"
                  gap={{ base: 3, md: 4 }}
                  pb={isLast ? 0 : 4}
                >
                  {/* Timeline Node */}
                  <Flex
                    direction="column"
                    align="center"
                    display={{ base: 'none', md: 'flex' }}
                    minW="32px"
                  >
                    <Circle
                      size="32px"
                      bg={`${colorPalette}.solid`}
                      color="white"
                      zIndex={1}
                    >
                      <Icon as={ServiceIcon} boxSize={4} />
                    </Circle>
                  </Flex>

                  {/* Service Card */}
                  <Box
                    flex="1"
                    bg="surface"
                    p={{ base: 4, md: 5 }}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="border"
                    _hover={{ borderColor: `${colorPalette}.muted` }}
                    transition="border-color 0.2s"
                  >
                    <Flex
                      justify="space-between"
                      align={{ base: 'start', md: 'center' }}
                      mb={3}
                      gap={3}
                      flexWrap="wrap"
                      direction={{ base: 'column', md: 'row' }}
                    >
                      <HStack gap={3}>
                        {/* Mobile Icon */}
                        <Circle
                          size="32px"
                          bg={`${colorPalette}.solid`}
                          color="white"
                          display={{ base: 'flex', md: 'none' }}
                        >
                          <Icon as={ServiceIcon} boxSize={4} />
                        </Circle>
                        <VStack align="start" gap={1}>
                          <Box
                            px={3}
                            py={1}
                            borderRadius="full"
                            bg={`${colorPalette}.muted`}
                            fontSize="sm"
                            fontWeight="semibold"
                            color={`${colorPalette}.fg`}
                          >
                            {SERVICE_TYPES[service.serviceType]}
                          </Box>
                          <HStack gap={2} color="textMuted" fontSize="sm">
                            <Icon as={FiCalendar} />
                            <Text>{formatDate(service.serviceDate)}</Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      <VStack align={{ base: 'start', md: 'end' }} gap={1}>
                        <Text fontWeight="semibold">{formatOdometer(service.odometer)}</Text>
                        {service.cost !== null && (
                          <Text fontSize="sm" color="textMuted">
                            {formatCurrency(service.cost)}
                          </Text>
                        )}
                      </VStack>
                    </Flex>

                    {/* Parts Replaced */}
                    {service.partsReplaced && service.partsReplaced.length > 0 && (
                      <Box mb={3} pl={3} borderLeftWidth="2px" borderColor={`${colorPalette}.muted`}>
                        <Text fontWeight="semibold" fontSize="sm" mb={1}>
                          Part yang diganti
                        </Text>
                        <VStack align="start" gap={0}>
                          {service.partsReplaced.map((part) => (
                            <Text
                              key={`${part.name}-${part.brand ?? 'na'}-${part.quantity ?? 1}`}
                              fontSize="sm"
                              color="textMuted"
                            >
                              • {part.name}
                              {part.brand && ` (${part.brand})`}
                              {part.quantity && ` x${part.quantity}`}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {/* Workshop */}
                    {service.workshopName && (
                      <Text fontSize="sm" mb={2}>
                        <Text as="span" fontWeight="semibold">Bengkel:</Text>{' '}
                        {service.workshopName}
                      </Text>
                    )}

                    {/* Notes */}
                    {service.notes && (
                      <Text fontSize="sm" color="textMuted" mb={2}>
                        {service.notes}
                      </Text>
                    )}

                    {/* Receipt Photo */}
                    {service.receiptPhotoUrl && (
                      <Box
                        mt={3}
                        h="150px"
                        borderRadius="md"
                        backgroundImage={`url(${service.receiptPhotoUrl})`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                        borderWidth="1px"
                        borderColor="border"
                      />
                    )}

                    {/* Footer */}
                    <Flex
                      mt={3}
                      justify="space-between"
                      align="center"
                      pt={3}
                      borderTopWidth="1px"
                      borderColor="border"
                    >
                      <HStack gap={2} fontSize="xs" color="textMuted">
                        <Icon as={FiUser} />
                        <Text>Oleh: {service.performedBy.name}</Text>
                      </HStack>
                      {canEdit && (
                        <HStack gap={1}>
                          <RouterLink to={ROUTES.SERVICE_EDIT(service.id)}>
                            <Button size="xs" variant="ghost">
                              <HStack gap={1}>
                                <Icon as={FiEdit2} />
                                <Text>Edit</Text>
                              </HStack>
                            </Button>
                          </RouterLink>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            loading={deletingServiceId === service.id && deleteServiceMutation.isPending}
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <HStack gap={1}>
                              <Icon as={FiTrash2} />
                              <Text>Hapus</Text>
                            </HStack>
                          </Button>
                        </HStack>
                      )}
                    </Flex>
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
