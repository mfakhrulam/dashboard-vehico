import { VStack, Input, Button, Alert, Text, Image, Box, HStack } from '@chakra-ui/react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { Field } from '@/components/ui/field';
import { FormErrors } from '@/utils/error';
import type { VehicleResponse } from '@/types/vehicle.types';

// Zod validation schema
const vehicleSchema = z.object({
  name: z.string().min(2, 'Nama kendaraan minimal 2 karakter'),
  brand: z.string().min(1, 'Merek wajib dipilih'),
  model: z.string().min(1, 'Model wajib dipilih'),
  year: z.string().regex(/^\d{4}$/, 'Tahun harus 4 digit'),
  licensePlate: z.string().min(1, 'Plat nomor wajib diisi'),
  currentOdometer: z.string().regex(/^\d+$/, 'Kilometer harus angka'),
});

// Form values interface
export interface VehicleFormValues {
  name: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  currentOdometer: string;
  photo?: File;
}

interface VehicleFormProps {
  mode: 'create' | 'edit';
  initialData?: VehicleResponse;
  onSubmit: (values: VehicleFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  formErrors?: FormErrors;
  requirePhoto?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

const getZodMessage = (error: unknown, fallback: string) => {
  if (error instanceof z.ZodError) {
    return error.issues?.[0]?.message || fallback;
  }
  return fallback;
};

// Validator functions
const validateName = (value: string) => {
  try {
    vehicleSchema.shape.name.parse(value);
    return undefined;
  } catch (error: unknown) {
    return getZodMessage(error, 'Invalid name');
  }
};

const validateBrand = (value: string) => {
  try {
    vehicleSchema.shape.brand.parse(value);
    return undefined;
  } catch (error: unknown) {
    return getZodMessage(error, 'Invalid brand');
  }
};

const validateModel = (value: string) => {
  try {
    vehicleSchema.shape.model.parse(value);
    return undefined;
  } catch (error: unknown) {
    return getZodMessage(error, 'Invalid model');
  }
};

const validateYear = (value: string) => {
  try {
    vehicleSchema.shape.year.parse(value);
    return undefined;
  } catch (error: unknown) {
    return getZodMessage(error, 'Invalid year');
  }
};

const validateLicensePlate = (value: string) => {
  try {
    vehicleSchema.shape.licensePlate.parse(value);
    return undefined;
  } catch (error: unknown) {
    return getZodMessage(error, 'Invalid license plate');
  }
};

const validateOdometer = (value: string) => {
  try {
    vehicleSchema.shape.currentOdometer.parse(value);
    return undefined;
  } catch (error: unknown) {
    return getZodMessage(error, 'Invalid odometer');
  }
};

export const VehicleForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  formErrors = {},
  requirePhoto = false,
  onDirtyChange,
}: VehicleFormProps) => {
  const [photoError, setPhotoError] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.photoUrl || null
  );

  const initialFormValues = useMemo(
    () => ({
      name: initialData?.name || '',
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      year: initialData?.year?.toString() || new Date().getFullYear().toString(),
      licensePlate: initialData?.licensePlate || '',
      currentOdometer: initialData?.currentOdometer?.toString() || '0',
    }),
    [initialData]
  );

  const initialValuesSnapshot = useMemo(
    () => JSON.stringify(initialFormValues),
    [initialFormValues]
  );

  const form = useForm({
    defaultValues: {
      ...initialFormValues,
    },
    onSubmit: async ({ value }) => {
      // Validate photo for create mode
      const photoInput = document.getElementById('photo') as HTMLInputElement;
      const hasNewPhoto = photoInput?.files?.length;
      
      if (mode === 'create' && requirePhoto && !hasNewPhoto) {
        setPhotoError('Foto kendaraan wajib diunggah');
        return;
      }

      const formValues: VehicleFormValues = {
        ...value,
        photo: hasNewPhoto ? photoInput.files![0] : undefined,
      };

      onSubmit(formValues);
    },
  });

  const updateDirtyState = (
    nextValues: Partial<Pick<VehicleFormValues, 'name' | 'brand' | 'model' | 'year' | 'licensePlate' | 'currentOdometer'>> = {},
    nextPhoto: File | null = selectedPhoto
  ) => {
    const currentValues = {
      name: nextValues.name ?? form.getFieldValue('name') ?? '',
      brand: nextValues.brand ?? form.getFieldValue('brand') ?? '',
      model: nextValues.model ?? form.getFieldValue('model') ?? '',
      year: nextValues.year ?? form.getFieldValue('year') ?? '',
      licensePlate: nextValues.licensePlate ?? form.getFieldValue('licensePlate') ?? '',
      currentOdometer: nextValues.currentOdometer ?? form.getFieldValue('currentOdometer') ?? '',
    };

    const hasValueChanges = JSON.stringify(currentValues) !== initialValuesSnapshot;
    onDirtyChange?.(hasValueChanges || Boolean(nextPhoto));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    const nextPhoto = file || null;
    setSelectedPhoto(nextPhoto);
    updateDirtyState({}, nextPhoto);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      style={{ width: '100%' }}
    >
      <VStack gap={4} width="100%">
        {/* Global Error Alert */}
        {Object.keys(formErrors).length > 0 && (
          <Alert.Root status="error" variant="subtle">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Terjadi kesalahan validasi</Alert.Title>
              <Alert.Description>
                <VStack align="start" gap={1}>
                  {Object.entries(formErrors).map(([field, messages]) => (
                    <VStack key={field} align="start" gap={0.5} ps={2} borderLeftWidth="2px" borderLeftColor="red.500">
                      <Text fontSize="sm" fontWeight="medium">{field}</Text>
                      {messages.map((msg) => (
                        <Text key={`${field}-${msg}`} fontSize="xs" color="red.700">• {msg}</Text>
                      ))}
                    </VStack>
                  ))}
                </VStack>
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {/* Photo Preview */}
        {photoPreview && (
          <Box width="100%" borderRadius="lg" overflow="hidden">
            <Image
              src={photoPreview}
              alt="Vehicle preview"
              width="100%"
              height="200px"
              objectFit="cover"
            />
          </Box>
        )}

        {/* Name Field */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => validateName(value) || undefined,
          }}
        >
          {(field) => {
            const backendErrors = formErrors['name'] || [];
            const clientErrors = field.state.meta.errors;
            const allErrors = [...backendErrors, ...clientErrors];
            
            return (
              <Field
                label="Nama Kendaraan"
                invalid={!!allErrors.length}
                errorText={allErrors[0]}
              >
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.handleChange(value);
                    updateDirtyState({ name: value });
                  }}
                  placeholder="e.g., Mobil Pribadi"
                  size="lg"
                />
              </Field>
            );
          }}
        </form.Field>

        {/* Brand Field */}
        <form.Field
          name="brand"
          validators={{
            onChange: ({ value }) => validateBrand(value) || undefined,
          }}
        >
          {(field) => {
            const backendErrors = formErrors['brand'] || [];
            const clientErrors = field.state.meta.errors;
            const allErrors = [...backendErrors, ...clientErrors];
            
            return (
              <Field
                label="Merek"
                invalid={!!allErrors.length}
                errorText={allErrors[0]}
              >
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.handleChange(value);
                    updateDirtyState({ brand: value });
                  }}
                  placeholder="e.g., Toyota"
                  size="lg"
                />
              </Field>
            );
          }}
        </form.Field>

        {/* Model Field */}
        <form.Field
          name="model"
          validators={{
            onChange: ({ value }) => validateModel(value) || undefined,
          }}
        >
          {(field) => {
            const backendErrors = formErrors['model'] || [];
            const clientErrors = field.state.meta.errors;
            const allErrors = [...backendErrors, ...clientErrors];
            
            return (
              <Field
                label="Model"
                invalid={!!allErrors.length}
                errorText={allErrors[0]}
              >
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.handleChange(value);
                    updateDirtyState({ model: value });
                  }}
                  placeholder="e.g., Avanza"
                  size="lg"
                />
              </Field>
            );
          }}
        </form.Field>

        {/* Year Field */}
        <form.Field
          name="year"
          validators={{
            onChange: ({ value }) => validateYear(value) || undefined,
          }}
        >
          {(field) => {
            const backendErrors = formErrors['year'] || [];
            const clientErrors = field.state.meta.errors;
            const allErrors = [...backendErrors, ...clientErrors];
            
            return (
              <Field
                label="Tahun Produksi"
                invalid={!!allErrors.length}
                errorText={allErrors[0]}
              >
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.handleChange(value);
                    updateDirtyState({ year: value });
                  }}
                  placeholder="e.g., 2020"
                  type="number"
                  size="lg"
                />
              </Field>
            );
          }}
        </form.Field>

        {/* License Plate Field */}
        <form.Field
          name="licensePlate"
          validators={{
            onChange: ({ value }) => validateLicensePlate(value) || undefined,
          }}
        >
          {(field) => {
            const backendErrors = formErrors['licensePlate'] || [];
            const clientErrors = field.state.meta.errors;
            const allErrors = [...backendErrors, ...clientErrors];
            
            return (
              <Field
                label="Plat Nomor"
                invalid={!!allErrors.length}
                errorText={allErrors[0]}
              >
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    field.handleChange(value);
                    updateDirtyState({ licensePlate: value });
                  }}
                  placeholder="e.g., B 1234 ABC"
                  size="lg"
                />
              </Field>
            );
          }}
        </form.Field>

        {/* Odometer Field */}
        <form.Field
          name="currentOdometer"
          validators={{
            onChange: ({ value }) => validateOdometer(value) || undefined,
          }}
        >
          {(field) => {
            const backendErrors = formErrors['currentOdometer'] || [];
            const clientErrors = field.state.meta.errors;
            const allErrors = [...backendErrors, ...clientErrors];
            
            return (
              <Field
                label="Kilometer Saat Ini"
                invalid={!!allErrors.length}
                errorText={allErrors[0]}
              >
                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.handleChange(value);
                    updateDirtyState({ currentOdometer: value });
                  }}
                  placeholder="e.g., 25000"
                  type="number"
                  size="lg"
                />
              </Field>
            );
          }}
        </form.Field>

        {/* Photo Upload */}
        <Field
          label={mode === 'edit' ? 'Ganti Foto (opsional)' : 'Foto Kendaraan (opsional)'}
          invalid={!!photoError}
          errorText={photoError}
        >
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            size="lg"
          />
        </Field>

        <HStack width="100%" gap={3}>
          <Button
            variant="outline"
            flex={1}
            size="lg"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            colorPalette="brand"
            flex={1}
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Kendaraan'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default VehicleForm;
