import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Text,
  Textarea,
  VStack,
  Select,
  Portal,
  createListCollection,
  Combobox,
  useFilter,
  useListCollection,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { SERVICE_TYPES } from '@/config/constants';
import { Field } from '@/components/ui/field';
import { partsService } from '@/services/parts.service';
import type { FormErrors } from '@/utils/error';
import type { PartReplaced, CreateServiceRequest } from '@/types/service.types';
import type { ServiceType } from '@/types/common.types';
import type { PartResponse } from '@/types/parts.types';

interface ServiceFormValues {
  serviceDate: string;
  odometer: string;
  serviceType: ServiceType;
  cost: string;
  workshopName: string;
  notes: string;
}

interface ServiceFormProps {
  vehicleId: number;
  initialValues?: Partial<ServiceFormValues>;
  initialParts?: PartReplaced[];
  formErrors?: FormErrors;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (payload: CreateServiceRequest) => void;
  onCancel?: () => void;
}

const serviceSchema = z.object({
  serviceDate: z.string().min(1, 'Tanggal service wajib diisi'),
  odometer: z.string().regex(/^\d+$/, 'Odometer harus angka'),
  serviceType: z.enum(['ringan', 'rutin', 'perbaikan', 'ganti_part']),
  cost: z.string().optional(),
  workshopName: z.string().optional(),
  notes: z.string().optional(),
});

const serviceTypeOptions = createListCollection({
  items: Object.entries(SERVICE_TYPES).map(([key, label]) => ({ label, value: key })),
});

const getZodMessage = (error: unknown, fallback: string) => {
  if (error instanceof z.ZodError) {
    return error.issues?.[0]?.message ?? fallback;
  }
  return fallback;
};

const presetParts: Record<'oil' | 'tire', PartReplaced[]> = {
  oil: [{ name: 'Oli Mesin', quantity: 1 }],
  tire: [{ name: 'Ban', quantity: 1 }],
};

export default function ServiceForm({
  vehicleId,
  initialValues,
  initialParts,
  formErrors,
  isSubmitting,
  submitLabel = 'Simpan Service',
  onSubmit,
  onCancel,
}: Readonly<ServiceFormProps>) {
  const [partsReplaced, setPartsReplaced] = useState<PartReplaced[]>(initialParts ?? []);
  const [partName, setPartName] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partQuantity, setPartQuantity] = useState('1');
  const [receiptPhoto, setReceiptPhoto] = useState<File | undefined>(undefined);

  // Fetch parts catalog (returns flat array of all parts)
  const { data: partsCatalog = [] } = useQuery({
    queryKey: ['parts-catalog'],
    queryFn: () => partsService.getAllFlat(),
  });

  // Setup combobox filter
  const { contains } = useFilter({ sensitivity: 'base' });
  const partsItems = useMemo(() => 
    partsCatalog.map((p: PartResponse) => ({ label: p.partName, value: p.partName })),
    [partsCatalog]
  );
  const { collection: partsCollection, filter: filterParts } = useListCollection({
    initialItems: partsItems,
    filter: contains,
  });

  const defaultServiceDate = useMemo(() => {
    if (initialValues?.serviceDate) {
      return initialValues.serviceDate;
    }
    return new Date().toISOString().slice(0, 10);
  }, [initialValues]);

  const form = useForm({
    defaultValues: {
      serviceDate: defaultServiceDate,
      odometer: initialValues?.odometer ?? '',
      serviceType: initialValues?.serviceType ?? 'rutin',
      cost: initialValues?.cost ?? '',
      workshopName: initialValues?.workshopName ?? '',
      notes: initialValues?.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      const payload: CreateServiceRequest = {
        vehicleId,
        serviceDate: value.serviceDate,
        odometer: Number.parseInt(value.odometer, 10),
        serviceType: value.serviceType,
      };

      if (partsReplaced.length > 0) {
        payload.partsReplaced = partsReplaced;
      }

      if (value.cost) {
        const parsedCost = Number.parseFloat(value.cost);
        if (!Number.isNaN(parsedCost)) {
          payload.cost = parsedCost;
        }
      }

      if (value.workshopName) payload.workshopName = value.workshopName;
      if (value.notes) payload.notes = value.notes;
      if (receiptPhoto) payload.receiptPhoto = receiptPhoto;

      onSubmit(payload);
    },
  });

  const addPart = () => {
    if (!partName.trim()) return;
    setPartsReplaced((prev) => [
      ...prev,
      {
        name: partName.trim(),
        brand: partBrand.trim() || undefined,
        quantity: partQuantity ? Number.parseInt(partQuantity, 10) : undefined,
      },
    ]);
    setPartName('');
    setPartBrand('');
    setPartQuantity('1');
  };

  const removePart = (index: number) => {
    setPartsReplaced((prev) => prev.filter((_, idx) => idx !== index));
  };

  const applyPreset = (preset: 'oil' | 'tire', type: ServiceType) => {
    setPartsReplaced(presetParts[preset]);
    form.setFieldValue('serviceType', type);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontWeight="semibold" mb={2}>
            Preset Cepat
          </Text>
          <HStack gap={3} flexWrap="wrap">
            <Button variant="outline" size="sm" onClick={() => applyPreset('oil', 'rutin')}>
              Ganti Oli
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset('tire', 'perbaikan')}>
              Ganti Ban
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPartsReplaced([])}>
              Reset
            </Button>
          </HStack>
        </Box>

        {formErrors && Object.keys(formErrors).length > 0 && (
          <Box borderWidth="1px" borderColor="red.200" bg="red.50" p={4} borderRadius="md">
            <Text fontWeight="semibold" mb={2} color="red.700">
              Periksa kembali input Anda
            </Text>
            <VStack align="start" gap={1}>
              {Object.entries(formErrors).map(([field, messages]) => (
                <Text key={field} fontSize="sm" color="red.700">
                  {field}: {messages.join(', ')}
                </Text>
              ))}
            </VStack>
          </Box>
        )}

        <form.Field
          name="serviceDate"
          validators={{
            onChange: ({ value }) => {
              try {
                serviceSchema.shape.serviceDate.parse(value);
                return undefined;
              } catch (error) {
                return getZodMessage(error, 'Tanggal service wajib diisi');
              }
            },
          }}
        >
          {(field) => (
            <Field
              label="Tanggal Service"
              invalid={!!field.state.meta.errors.length}
              errorText={field.state.meta.errors[0]}
            >
              <Input
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                size="lg"
              />
            </Field>
          )}
        </form.Field>

        <form.Field
          name="odometer"
          validators={{
            onChange: ({ value }) => {
              try {
                serviceSchema.shape.odometer.parse(value);
                return undefined;
              } catch (error) {
                return getZodMessage(error, 'Odometer harus angka');
              }
            },
          }}
        >
          {(field) => (
            <Field
              label="Odometer"
              invalid={!!field.state.meta.errors.length}
              errorText={field.state.meta.errors[0]}
            >
              <Input
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="e.g., 25000"
                size="lg"
              />
            </Field>
          )}
        </form.Field>

        <form.Field
          name="serviceType"
          validators={{
            onChange: ({ value }) => {
              try {
                serviceSchema.shape.serviceType.parse(value);
                return undefined;
              } catch (error) {
                return getZodMessage(error, 'Jenis service wajib dipilih');
              }
            },
          }}
        >
          {(field) => (
            <Field
              label="Jenis Service"
              invalid={!!field.state.meta.errors.length}
              errorText={field.state.meta.errors[0]}
            >
              <Select.Root 
                size="lg"
                collection={serviceTypeOptions}
                value={[field.state.value]}
                onValueChange={(e) => field.handleChange(e.value[0] as ServiceType)}
                onInteractOutside={() => field.handleBlur()}
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
                      {serviceTypeOptions.items.map((option) => (
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
          )}
        </form.Field>

        <Box>
          <Text fontWeight="semibold" mb={2}>
            Part yang Diganti
          </Text>
          <Stack gap={3}>
            <HStack gap={3} flexWrap="wrap" align="flex-end">
              <Box flex="1" minW="200px">
                <Combobox.Root
                  collection={partsCollection}
                  onInputValueChange={(e) => {
                    setPartName(e.inputValue);
                    filterParts(e.inputValue);
                  }}
                  onValueChange={(e) => {
                    if (e.value[0]) {
                      setPartName(e.value[0]);
                    }
                  }}
                  inputValue={partName}
                  allowCustomValue
                  selectionBehavior="replace"
                  openOnClick
                >
                  <Combobox.Label fontSize="sm" color="textMuted">Nama Part</Combobox.Label>
                  <Combobox.Control>
                    <Combobox.Input placeholder="Cari atau ketik nama part" />
                    <Combobox.IndicatorGroup>
                      <Combobox.ClearTrigger />
                      <Combobox.Trigger />
                    </Combobox.IndicatorGroup>
                  </Combobox.Control>
                  <Portal>
                    <Combobox.Positioner>
                      <Combobox.Content>
                        <Combobox.Empty>Tidak ditemukan - ketik untuk menambah</Combobox.Empty>
                        {partsCollection.items.map((item) => (
                          <Combobox.Item item={item} key={item.value}>
                            {item.label}
                            <Combobox.ItemIndicator />
                          </Combobox.Item>
                        ))}
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Portal>
                </Combobox.Root>
              </Box>
              <Input
                value={partBrand}
                onChange={(event) => setPartBrand(event.target.value)}
                placeholder="Brand"
                size="md"
                maxW="150px"
              />
              <Input
                value={partQuantity}
                onChange={(event) => setPartQuantity(event.target.value)}
                placeholder="Qty"
                type="number"
                size="md"
                maxW="80px"
              />
              <Button onClick={addPart} variant="outline" size="md" disabled={!partName.trim()}>
                Tambah
              </Button>
            </HStack>

            {partsReplaced.length > 0 && (
              <VStack align="stretch" gap={2}>
                {partsReplaced.map((part, index) => (
                  <HStack
                    key={`${part.name}-${index}`}
                    justify="space-between"
                    borderWidth="1px"
                    borderColor="border"
                    p={3}
                    borderRadius="md"
                  >
                    <Text fontSize="sm">
                      {part.name}
                      {part.brand ? ` (${part.brand})` : ''}
                      {part.quantity ? ` x${part.quantity}` : ''}
                    </Text>
                    <Button size="xs" variant="ghost" onClick={() => removePart(index)}>
                      Hapus
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </Stack>
        </Box>

        <form.Field name="cost">
          {(field) => (
            <Field label="Biaya (opsional)">
              <Input
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="e.g., 350000"
                size="lg"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="workshopName">
          {(field) => (
            <Field label="Nama Bengkel" optionalText="(opsional)">
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="e.g., Bengkel Jaya"
                size="lg"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="notes">
          {(field) => (
            <Field label="Catatan" optionalText="(opsional)">
              <Textarea
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Tambahkan catatan service"
                minH="120px"
              />
            </Field>
          )}
        </form.Field>

        <Field label="Foto Struk" optionalText="(opsional)">
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => setReceiptPhoto(event.target.files?.[0])}
            size="lg"
          />
        </Field>

        <HStack gap={3} justify="flex-end" pt={2}>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
          )}
          <Button type="submit" colorPalette="brand" loading={isSubmitting} disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}
