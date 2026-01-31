import {
  Box,
  Button,
  Text,
  VStack,
  Input,
  HStack,
  SimpleGrid,
  IconButton,
  Separator,
  Image,
  Flex,
  Dialog,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LuX, LuDroplet, LuCircle, LuWrench, LuSettings } from 'react-icons/lu';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { serviceService } from '@/services/service.service';
import { parseApiError } from '@/utils/error';
import { useVehicles } from '@/hooks/useVehicles';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { CreateServiceRequest, PartReplaced } from '@/types/service.types';
import type { VehicleResponse } from '@/types/vehicle.types';
import type { ServiceType } from '@/types/common.types';

interface QuickServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicleId?: number;
}

interface ServicePreset {
  id: string;
  label: string;
  icon: typeof LuDroplet;
  serviceType: ServiceType;
  parts: PartReplaced[];
}

const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'ganti-oli',
    label: 'Ganti Oli',
    icon: LuDroplet,
    serviceType: 'rutin',
    parts: [{ name: 'Oli Mesin' }],
  },
  {
    id: 'ganti-ban',
    label: 'Ganti Ban',
    icon: LuCircle,
    serviceType: 'ganti_part',
    parts: [{ name: 'Ban' }],
  },
  {
    id: 'service-ringan',
    label: 'Service Ringan',
    icon: LuWrench,
    serviceType: 'ringan',
    parts: [],
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: LuSettings,
    serviceType: 'rutin',
    parts: [],
  },
];

export default function QuickServiceModal({
  isOpen,
  onClose,
  preselectedVehicleId,
}: Readonly<QuickServiceModalProps>) {
  const queryClient = useQueryClient();
  const { ownedVehicles, sharedVehicles, isLoading: isLoadingVehicles } = useVehicles();
  const allVehicles = useMemo(
    () => [...ownedVehicles, ...sharedVehicles.filter((v) => v.permission === 'edit')],
    [ownedVehicles, sharedVehicles]
  );

  const [step, setStep] = useState<'vehicle' | 'preset' | 'form'>('vehicle');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResponse | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ServicePreset | null>(null);
  
  // Form state
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize with preselected vehicle when modal opens
  useEffect(() => {
    if (isOpen && preselectedVehicleId && allVehicles.length > 0) {
      const vehicle = allVehicles.find((v) => v.id === preselectedVehicleId);
      if (vehicle && !selectedVehicle) {
        // Use a timeout to avoid setState during render
        const timer = setTimeout(() => {
          setSelectedVehicle(vehicle);
          setOdometer(vehicle.currentOdometer.toString());
          setStep('preset');
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, preselectedVehicleId, allVehicles, selectedVehicle]);

  // Create service mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toaster.create({
        title: 'Berhasil',
        description: 'Service berhasil dicatat',
        type: 'success',
      });
      handleClose();
    },
    onError: (error) => {
      const { message } = parseApiError(error);
      toaster.create({
        title: 'Gagal mencatat service',
        description: message,
        type: 'error',
      });
    },
  });

  const handleVehicleSelect = (vehicle: VehicleResponse) => {
    setSelectedVehicle(vehicle);
    setOdometer(vehicle.currentOdometer.toString());
    setStep('preset');
  };

  const handlePresetSelect = (preset: ServicePreset) => {
    setSelectedPreset(preset);
    setStep('form');
  };

  const handleSubmit = () => {
    if (!selectedVehicle || !selectedPreset) return;

    const odometerNum = Number.parseInt(odometer);
    if (Number.isNaN(odometerNum) || odometerNum < selectedVehicle.currentOdometer) {
      toaster.create({
        title: 'Odometer tidak valid',
        description: 'Odometer harus lebih besar atau sama dengan odometer saat ini',
        type: 'error',
      });
      return;
    }

    const requestData: CreateServiceRequest = {
      vehicleId: selectedVehicle.id,
      serviceDate: new Date().toISOString().split('T')[0],
      odometer: odometerNum,
      serviceType: selectedPreset.serviceType,
      partsReplaced: selectedPreset.parts.length > 0 ? selectedPreset.parts : undefined,
      cost: cost ? Number.parseFloat(cost) : undefined,
      notes: notes || undefined,
    };

    createMutation.mutate(requestData);
  };

  const handleClose = () => {
    setStep('vehicle');
    setSelectedVehicle(null);
    setSelectedPreset(null);
    setOdometer('');
    setCost('');
    setNotes('');
    onClose();
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('preset');
    } else if (step === 'preset') {
      setStep('vehicle');
      setSelectedVehicle(null);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {step === 'vehicle' && 'Pilih Kendaraan'}
              {step === 'preset' && 'Pilih Jenis Service'}
              {step === 'form' && 'Detail Service'}
            </Dialog.Title>
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
          {/* Step 1: Select Vehicle */}
          {step === 'vehicle' && (
            <VStack gap={4} align="stretch">
              {isLoadingVehicles && <LoadingSpinner label="Memuat kendaraan..." />}
              
              {!isLoadingVehicles && allVehicles.length === 0 && (
                <Text color="textMuted" textAlign="center" py={4}>
                  Belum ada kendaraan. Tambahkan kendaraan terlebih dahulu.
                </Text>
              )}

              {!isLoadingVehicles && allVehicles.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  {allVehicles.map((vehicle) => (
                    <Box
                      key={vehicle.id}
                      p={3}
                      bg="bg"
                      borderRadius="lg"
                      borderWidth="2px"
                      borderColor="border"
                      cursor="pointer"
                      _hover={{ borderColor: 'brand.solid' }}
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <HStack gap={3}>
                        {vehicle.photoUrl ? (
                          <Image
                            src={vehicle.photoUrl}
                            alt={vehicle.name}
                            boxSize="48px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        ) : (
                          <Flex
                            boxSize="48px"
                            bg="brand.subtle"
                            borderRadius="md"
                            align="center"
                            justify="center"
                          >
                            <LuSettings />
                          </Flex>
                        )}
                        <Box>
                          <Text fontWeight="medium">{vehicle.name}</Text>
                          <Text fontSize="sm" color="textMuted">
                            {vehicle.brand} {vehicle.model}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          )}

          {/* Step 2: Select Preset */}
          {step === 'preset' && (
            <VStack gap={4} align="stretch">
              <Box p={3} bg="bg" borderRadius="lg">
                <Text fontSize="sm" color="textMuted">Kendaraan dipilih:</Text>
                <Text fontWeight="medium">{selectedVehicle?.name}</Text>
              </Box>

              <Separator />

              <SimpleGrid columns={2} gap={3}>
                {SERVICE_PRESETS.map((preset) => {
                  const PresetIcon = preset.icon;
                  return (
                    <Box
                      key={preset.id}
                      p={4}
                      bg="bg"
                      borderRadius="lg"
                      borderWidth="2px"
                      borderColor="border"
                      cursor="pointer"
                      textAlign="center"
                      _hover={{ borderColor: 'brand.solid' }}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <VStack gap={2}>
                        <Box color="brand.solid">
                          <PresetIcon size={24} />
                        </Box>
                        <Text fontWeight="medium">{preset.label}</Text>
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>

              <Button variant="ghost" onClick={handleBack}>
                Kembali
              </Button>
            </VStack>
          )}

          {/* Step 3: Form */}
          {step === 'form' && (
            <VStack gap={4} align="stretch">
              <HStack gap={3} p={3} bg="bg" borderRadius="lg">
                <Box>
                  <Text fontSize="sm" color="textMuted">Kendaraan</Text>
                  <Text fontWeight="medium">{selectedVehicle?.name}</Text>
                </Box>
                <Separator orientation="vertical" height="40px" />
                <Box>
                  <Text fontSize="sm" color="textMuted">Jenis Service</Text>
                  <Text fontWeight="medium">{selectedPreset?.label}</Text>
                </Box>
              </HStack>

              <Field label="Odometer (km)" required>
                <Input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="e.g., 25000"
                  size="lg"
                />
              </Field>

              <Field label="Biaya (Rp)">
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g., 150000"
                  size="lg"
                />
              </Field>

              <Field label="Catatan">
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                  size="lg"
                />
              </Field>

              {selectedPreset && selectedPreset.parts.length > 0 && (
                <Box p={3} bg="brand.subtle" borderRadius="lg">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Part yang diganti:
                  </Text>
                  <Text fontSize="sm">{selectedPreset.parts.map(p => p.name).join(', ')}</Text>
                </Box>
              )}

              <HStack gap={3}>
                <Button
                  variant="outline"
                  flex={1}
                  onClick={handleBack}
                  disabled={createMutation.isPending}
                >
                  Kembali
                </Button>
                <Button
                  colorPalette="brand"
                  flex={1}
                  onClick={handleSubmit}
                  loading={createMutation.isPending}
                  disabled={createMutation.isPending || !odometer}
                >
                  Simpan
                </Button>
              </HStack>
            </VStack>
          )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
