import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Combobox,
  createListCollection,
  HStack,
  Input,
  Portal,
  Select,
  Stack,
  Text,
  Textarea,
  useFilter,
  useListCollection,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { SERVICE_TYPES } from '@/config/constants';
import { Field } from '@/components/ui/field';
import { useAllServices } from '@/hooks/useServices';
import { partsService } from '@/services/parts.service';
import type { PartResponse } from '@/types/parts.types';
import type { ServiceType } from '@/types/common.types';
import type { PartReplaced, CreateServiceRequest } from '@/types/service.types';
import type { FormErrors } from '@/utils/error';

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
  onDirtyChange?: (isDirty: boolean) => void;
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
  onDirtyChange,
}: Readonly<ServiceFormProps>) {
  const [partsReplaced, setPartsReplaced] = useState<PartReplaced[]>(initialParts ?? []);
  const [partName, setPartName] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partQuantity, setPartQuantity] = useState('1');
  const [receiptPhoto, setReceiptPhoto] = useState<File | undefined>(undefined);

  const { services: serviceHistory } = useAllServices(1, 100);

  // Fetch parts catalog (returns flat array of all parts)
  const { data: partsCatalog = [] } = useQuery({
    queryKey: ['parts-catalog'],
    queryFn: () => partsService.getAllFlat(),
  });

  // Setup combobox filter
  const { contains } = useFilter({ sensitivity: 'base' });
  const partsItems = useMemo(
    () => partsCatalog.map((p: PartResponse) => ({ label: p.partName, value: p.partName })),
    [partsCatalog]
  );
  const {
    collection: partsCollection,
    filter: filterParts,
    set: setPartsCollection,
  } = useListCollection({
    initialItems: partsItems,
    filter: contains,
  });

  const workshopItems = useMemo(
    () =>
      Array.from(
        new Set(
          serviceHistory
            .map((service) => service.workshopName?.trim())
            .filter((name): name is string => Boolean(name))
        )
      )
        .sort((a, b) => a.localeCompare(b, 'id-ID'))
        .map((name) => ({ label: name, value: name })),
    [serviceHistory]
  );

  const {
    collection: workshopsCollection,
    filter: filterWorkshops,
    set: setWorkshopsCollection,
  } = useListCollection({
    initialItems: workshopItems,
    filter: contains,
  });

  const defaultServiceDate = useMemo(() => {
    if (initialValues?.serviceDate) {
      return initialValues.serviceDate;
    }
    return new Date().toISOString().slice(0, 10);
  }, [initialValues]);

  const initialFormValues = useMemo(
    () => ({
      serviceDate: defaultServiceDate,
      odometer: initialValues?.odometer ?? '',
      serviceType: initialValues?.serviceType ?? 'rutin',
      cost: initialValues?.cost ?? '',
      workshopName: initialValues?.workshopName ?? '',
      notes: initialValues?.notes ?? '',
    }),
    [defaultServiceDate, initialValues]
  );

  const initialValuesSnapshot = useMemo(
    () => JSON.stringify(initialFormValues),
    [initialFormValues]
  );
  const initialPartsSnapshot = useMemo(() => JSON.stringify(initialParts ?? []), [initialParts]);

  useEffect(() => {
    setPartsCollection(partsItems);
  }, [partsItems, setPartsCollection]);

  useEffect(() => {
    setWorkshopsCollection(workshopItems);
  }, [setWorkshopsCollection, workshopItems]);

  const form = useForm({
    defaultValues: initialFormValues,
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

  const updateDirtyState = ({
    nextValues = {},
    nextParts = partsReplaced,
    nextReceiptPhoto = receiptPhoto,
    nextPartName = partName,
    nextPartBrand = partBrand,
    nextPartQuantity = partQuantity,
  }: {
    nextValues?: Partial<ServiceFormValues>;
    nextParts?: PartReplaced[];
    nextReceiptPhoto?: File;
    nextPartName?: string;
    nextPartBrand?: string;
    nextPartQuantity?: string;
  } = {}) => {
    const currentValues: ServiceFormValues = {
      serviceDate: nextValues.serviceDate ?? form.getFieldValue('serviceDate') ?? '',
      odometer: nextValues.odometer ?? form.getFieldValue('odometer') ?? '',
      serviceType: (nextValues.serviceType ??
        form.getFieldValue('serviceType') ??
        'rutin') as ServiceType,
      cost: nextValues.cost ?? form.getFieldValue('cost') ?? '',
      workshopName: nextValues.workshopName ?? form.getFieldValue('workshopName') ?? '',
      notes: nextValues.notes ?? form.getFieldValue('notes') ?? '',
    };

    const hasValueChanges = JSON.stringify(currentValues) !== initialValuesSnapshot;
    const hasPartsChanges = JSON.stringify(nextParts) !== initialPartsSnapshot;
    const hasPendingPartDraft = Boolean(
      nextPartName.trim() || nextPartBrand.trim() || nextPartQuantity !== '1'
    );

    onDirtyChange?.(
      hasValueChanges || hasPartsChanges || Boolean(nextReceiptPhoto) || hasPendingPartDraft
    );
  };

  const addPart = () => {
    if (!partName.trim()) return;

    const nextParts = [
      ...partsReplaced,
      {
        name: partName.trim(),
        brand: partBrand.trim() || undefined,
        quantity: partQuantity ? Number.parseInt(partQuantity, 10) : undefined,
      },
    ];

    setPartsReplaced(nextParts);
    setPartName('');
    setPartBrand('');
    setPartQuantity('1');
    updateDirtyState({ nextParts, nextPartName: '', nextPartBrand: '', nextPartQuantity: '1' });
  };

  const removePart = (index: number) => {
    const nextParts = partsReplaced.filter((_, idx) => idx !== index);
    setPartsReplaced(nextParts);
    updateDirtyState({ nextParts });
  };

  const applyPreset = (preset: 'oil' | 'tire', type: ServiceType) => {
    const nextParts = presetParts[preset];
    setPartsReplaced(nextParts);
    form.setFieldValue('serviceType', type);
    updateDirtyState({ nextValues: { serviceType: type }, nextParts });
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPartsReplaced([]);
                updateDirtyState({ nextParts: [] });
              }}
            >
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
                onChange={(event) => {
                  const value = event.target.value;
                  field.handleChange(value);
                  updateDirtyState({ nextValues: { serviceDate: value } });
                }}
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
                onChange={(event) => {
                  const value = event.target.value;
                  field.handleChange(value);
                  updateDirtyState({ nextValues: { odometer: value } });
                }}
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
                onValueChange={(event) => {
                  const value = event.value[0] as ServiceType | undefined;
                  if (!value) return;
                  field.handleChange(value);
                  updateDirtyState({ nextValues: { serviceType: value } });
                }}
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
                  onInputValueChange={(event) => {
                    setPartName(event.inputValue);
                    filterParts(event.inputValue);
                    updateDirtyState({ nextPartName: event.inputValue });
                  }}
                  onValueChange={(event) => {
                    if (!event.value[0]) return;
                    setPartName(event.value[0]);
                    updateDirtyState({ nextPartName: event.value[0] });
                  }}
                  inputValue={partName}
                  allowCustomValue
                  selectionBehavior="replace"
                  openOnClick
                >
                  <Combobox.Label fontSize="sm" color="textMuted">
                    Nama Part
                  </Combobox.Label>
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
                onChange={(event) => {
                  const value = event.target.value;
                  setPartBrand(value);
                  updateDirtyState({ nextPartBrand: value });
                }}
                placeholder="Brand"
                size="md"
                maxW="150px"
              />
              <Input
                value={partQuantity}
                onChange={(event) => {
                  const value = event.target.value;
                  setPartQuantity(value);
                  updateDirtyState({ nextPartQuantity: value });
                }}
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
                onChange={(event) => {
                  const value = event.target.value;
                  field.handleChange(value);
                  updateDirtyState({ nextValues: { cost: value } });
                }}
                placeholder="e.g., 350000"
                size="lg"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="workshopName">
          {(field) => (
            <Field label="Nama Bengkel" optionalText="(opsional)">
              <Combobox.Root
                collection={workshopsCollection}
                inputValue={field.state.value}
                allowCustomValue
                selectionBehavior="replace"
                openOnClick
                onInputValueChange={(event) => {
                  field.handleChange(event.inputValue);
                  filterWorkshops(event.inputValue);
                  updateDirtyState({ nextValues: { workshopName: event.inputValue } });
                }}
                onValueChange={(event) => {
                  if (!event.value[0]) return;
                  field.handleChange(event.value[0]);
                  updateDirtyState({ nextValues: { workshopName: event.value[0] } });
                }}
              >
                <Combobox.Control>
                  <Combobox.Input placeholder="e.g., Bengkel Jaya" onBlur={field.handleBlur} />
                  <Combobox.IndicatorGroup>
                    <Combobox.ClearTrigger />
                    <Combobox.Trigger />
                  </Combobox.IndicatorGroup>
                </Combobox.Control>
                <Portal>
                  <Combobox.Positioner>
                    <Combobox.Content>
                      <Combobox.Empty>
                        Tidak ada saran - lanjutkan mengetik nama bengkel
                      </Combobox.Empty>
                      {workshopsCollection.items.map((item) => (
                        <Combobox.Item item={item} key={item.value}>
                          {item.label}
                          <Combobox.ItemIndicator />
                        </Combobox.Item>
                      ))}
                    </Combobox.Content>
                  </Combobox.Positioner>
                </Portal>
              </Combobox.Root>
            </Field>
          )}
        </form.Field>

        <form.Field name="notes">
          {(field) => (
            <Field label="Catatan" optionalText="(opsional)">
              <Textarea
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const value = event.target.value;
                  field.handleChange(value);
                  updateDirtyState({ nextValues: { notes: value } });
                }}
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
            onChange={(event) => {
              const file = event.target.files?.[0];
              setReceiptPhoto(file);
              updateDirtyState({ nextReceiptPhoto: file });
            }}
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
