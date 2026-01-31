import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Input,
  HStack,
  Badge,
  IconButton,
  Separator,
  Select,
  Portal,
  createListCollection,
  Dialog,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LuTrash2, LuX, LuUserPlus } from 'react-icons/lu';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { vehicleService } from '@/services/vehicle.service';
import { parseApiError } from '@/utils/error';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { ShareVehicleRequest, VehicleShareInfo } from '@/types/vehicle.types';

interface ShareVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
}

const permissionOptions = createListCollection({
  items: [
    { label: "Lihat Saja", value: "view" },
    { label: "Edit", value: "edit" },
  ],
});

export default function ShareVehicleModal({
  isOpen,
  onClose,
  vehicleId,
}: Readonly<ShareVehicleModalProps>) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');

  // Fetch current shares
  const { data: shares, isLoading: isLoadingShares } = useQuery({
    queryKey: ['vehicle-shares', vehicleId],
    queryFn: async () => {
      const response = await vehicleService.getShares(vehicleId);
      return response.data;
    },
    enabled: isOpen && !!vehicleId,
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: (data: ShareVehicleRequest) => vehicleService.share(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-shares', vehicleId] });
      setEmail('');
      setPermission('view');
      toaster.create({
        title: 'Berhasil',
        description: 'Kendaraan berhasil dibagikan',
        type: 'success',
      });
    },
    onError: (error) => {
      const { message } = parseApiError(error);
      toaster.create({
        title: 'Gagal membagikan kendaraan',
        description: message,
        type: 'error',
      });
    },
  });

  // Revoke mutation
  const revokeMutation = useMutation({
    mutationFn: (shareId: number) => vehicleService.revokeShare(vehicleId, shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-shares', vehicleId] });
      toaster.create({
        title: 'Berhasil',
        description: 'Akses berhasil dicabut',
        type: 'success',
      });
    },
    onError: (error) => {
      const { message } = parseApiError(error);
      toaster.create({
        title: 'Gagal mencabut akses',
        description: message,
        type: 'error',
      });
    },
  });

  const handleShare = () => {
    if (!email.trim()) {
      toaster.create({
        title: 'Email wajib diisi',
        type: 'error',
      });
      return;
    }

    shareMutation.mutate({ email: email.trim(), permission });
  };

  const handleRevoke = (share: VehicleShareInfo) => {
    revokeMutation.mutate(share.id);
  };

  const handleClose = () => {
    setEmail('');
    setPermission('view');
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Bagikan Kendaraan</Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <IconButton
                aria-label="Close"
                variant="ghost"
                size="sm"
                position="absolute"
                top={3}
                right={3}
              >
                <LuX />
              </IconButton>
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body pb={6}>
          <VStack gap={5} align="stretch">
            {/* Add new share form */}
            <Box>
              <Heading size="sm" mb={3}>Tambah Pengguna</Heading>
              <VStack gap={3} align="stretch">
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                  />
                </Field>
                <Field label="Izin Akses">
                  <Select.Root 
                    size="lg"
                    collection={permissionOptions}
                    value={[permission]}
                    onValueChange={(e) => setPermission(e.value[0] as 'view' | 'edit')}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {permissionOptions.items.map((option) => (
                            <Select.Item item={option} key={option.value}>
                              {option.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Field>
                <Button
                  colorPalette="brand"
                  onClick={handleShare}
                  loading={shareMutation.isPending}
                  disabled={shareMutation.isPending || !email.trim()}
                >
                  <LuUserPlus />
                  Bagikan
                </Button>
              </VStack>
            </Box>

            <Separator />

            {/* Current shares list */}
            <Box>
              <Heading size="sm" mb={3}>Pengguna dengan Akses</Heading>
              {isLoadingShares && (
                <LoadingSpinner label="Memuat daftar..." />
              )}
              {!isLoadingShares && !shares?.length && (
                <Text color="textMuted" fontSize="sm">
                  Belum ada pengguna yang memiliki akses.
                </Text>
              )}
              {!isLoadingShares && shares?.length && (
                <VStack gap={2} align="stretch">
                  {shares.map((share) => (
                    <HStack
                      key={share.id}
                      p={3}
                      bg="bg"
                      borderRadius="lg"
                      justify="space-between"
                    >
                      <Box>
                        <Text fontWeight="medium">{share.user.name}</Text>
                        <Text fontSize="sm" color="textMuted">
                          {share.user.email}
                        </Text>
                      </Box>
                      <HStack gap={2}>
                        <Badge
                          colorPalette={share.permission === 'edit' ? 'blue' : 'gray'}
                        >
                          {share.permission === 'edit' ? 'Edit' : 'Lihat'}
                        </Badge>
                        <IconButton
                          aria-label="Cabut akses"
                          variant="ghost"
                          colorPalette="red"
                          size="sm"
                          onClick={() => handleRevoke(share)}
                          loading={revokeMutation.isPending}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
