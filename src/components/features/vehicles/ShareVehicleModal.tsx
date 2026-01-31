import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Input,
  HStack,
  IconButton,
  Separator,
  Select,
  Portal,
  createListCollection,
  Dialog,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LuTrash2, LuX, LuUserPlus, LuTriangleAlert } from 'react-icons/lu';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { vehicleService } from '@/services/vehicle.service';
import { parseApiError } from '@/utils/error';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { ShareVehicleRequest, VehicleShareInfo, UpdateSharePermissionRequest } from '@/types/vehicle.types';

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
  const [revokeConfirmShare, setRevokeConfirmShare] = useState<VehicleShareInfo | null>(null);
  const [updatingShareId, setUpdatingShareId] = useState<number | null>(null);

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
      setRevokeConfirmShare(null);
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

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: ({ shareId, data }: { shareId: number; data: UpdateSharePermissionRequest }) =>
      vehicleService.updateSharePermission(vehicleId, shareId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-shares', vehicleId] });
      setUpdatingShareId(null);
      toaster.create({
        title: 'Berhasil',
        description: 'Izin akses berhasil diubah',
        type: 'success',
      });
    },
    onError: (error) => {
      setUpdatingShareId(null);
      const { message } = parseApiError(error);
      toaster.create({
        title: 'Gagal mengubah izin',
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

  const handleRevoke = () => {
    if (revokeConfirmShare) {
      revokeMutation.mutate(revokeConfirmShare.id);
    }
  };

  const handleUpdatePermission = (share: VehicleShareInfo, newPermission: 'view' | 'edit') => {
    if (share.permission === newPermission) return;
    setUpdatingShareId(share.id);
    updatePermissionMutation.mutate({
      shareId: share.id,
      data: { permission: newPermission },
    });
  };

  const handleClose = () => {
    setEmail('');
    setPermission('view');
    setRevokeConfirmShare(null);
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
                      <Box flex="1" minW="0">
                        <Text fontWeight="medium" truncate>{share.user.name}</Text>
                        <Text fontSize="sm" color="textMuted" truncate>
                          {share.user.email}
                        </Text>
                      </Box>
                      <HStack gap={2} flexShrink={0}>
                        {updatingShareId === share.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Select.Root
                            size="sm"
                            width="110px"
                            collection={permissionOptions}
                            value={[share.permission]}
                            onValueChange={(e) => handleUpdatePermission(share, e.value[0] as 'view' | 'edit')}
                            disabled={updatePermissionMutation.isPending}
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
                        )}
                        <IconButton
                          aria-label="Cabut akses"
                          variant="ghost"
                          colorPalette="red"
                          size="sm"
                          onClick={() => setRevokeConfirmShare(share)}
                          disabled={revokeMutation.isPending || updatePermissionMutation.isPending}
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

      {/* Revoke Confirmation Dialog */}
      <Dialog.Root open={!!revokeConfirmShare} onOpenChange={(e) => !e.open && setRevokeConfirmShare(null)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="400px">
            <Dialog.Header>
              <HStack gap={2}>
                <Box color="fg.error">
                  <LuTriangleAlert size={24} />
                </Box>
                <Dialog.Title>Cabut Akses</Dialog.Title>
              </HStack>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Apakah Anda yakin ingin mencabut akses{' '}
                <Text as="span" fontWeight="bold">{revokeConfirmShare?.user.name}</Text>{' '}
                ({revokeConfirmShare?.user.email}) dari kendaraan ini?
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3}>
                <Button
                  variant="ghost"
                  onClick={() => setRevokeConfirmShare(null)}
                  disabled={revokeMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  colorPalette="red"
                  onClick={handleRevoke}
                  loading={revokeMutation.isPending}
                >
                  Cabut Akses
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Dialog.Root>
  );
}
