import { Container, Text, VStack, Input, Button, Alert } from '@chakra-ui/react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/config/constants';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { parseApiError, FormErrors } from '@/utils/error';
import { vehicleService } from '@/services/vehicle.service';
import { CreateVehicleRequest } from '@/types/vehicle.types';
import { useMutation } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';

const vehicleSchema = z.object({
  name: z.string().min(2, 'Nama kendaraan minimal 2 karakter'),
  brand: z.string().min(1, 'Merek wajib dipilih'),
  model: z.string().min(1, 'Model wajib dipilih'),
  year: z.string().regex(/^\d{4}$/, 'Tahun harus 4 digit'),
  licensePlate: z.string().min(1, 'Plat nomor wajib diisi'),
  currentOdometer: z.string().regex(/^\d+$/, 'Kilometer harus angka'),
});

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

export default function VehicleCreate() {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [photoError, setPhotoError] = useState<string>('');

  // Mutation untuk create vehicle
  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleRequest) => vehicleService.create(data),
    onSuccess: () => {
      toaster.create({
        title: 'Berhasil',
        description: 'Kendaraan berhasil ditambahkan',
        type: 'success',
      });
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      const { message, formErrors: newFormErrors } = parseApiError(error);
      setFormErrors(newFormErrors || {});
      toaster.create({
        title: 'Gagal menambah kendaraan',
        description: message,
        type: 'error',
      });
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear().toString(),
      licensePlate: '',
      currentOdometer: '0',
    },
    onSubmit: async ({ value }) => {
      try {
        // Validate required photo
        const photoInput = document.getElementById('photo') as HTMLInputElement;
        if (!photoInput?.files?.length) {
          setPhotoError('Foto kendaraan wajib diunggah');
          return;
        }

        // Build request object
        const requestData: CreateVehicleRequest = {
          name: value.name,
          brand: value.brand,
          model: value.model,
          year: Number.parseInt(value.year),
          licensePlate: value.licensePlate || undefined,
          currentOdometer: Number.parseInt(value.currentOdometer),
          photo: photoInput.files[0],
        };

        createMutation.mutate(requestData);
      } catch (error: unknown) {
        const { formErrors: newFormErrors } = parseApiError(error);
        setFormErrors(newFormErrors || {});
      }
    },
  });

  return (
    <Layout>
      <Container maxW="2xl">
        <PageHeader
          title="Tambah Kendaraan"
          description="Masukkan informasi kendaraan Anda"
          breadcrumbs={[
            { label: 'Dashboard', to: ROUTES.DASHBOARD },
            { label: 'Garasi', to: ROUTES.GARAGE },
            { label: 'Tambah Kendaraan' },
          ]}
        />
        <VStack gap={8} bg="surface" p={{ base: 5, md: 6 }} borderRadius="xl" borderWidth="1px" borderColor="border">
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
                label="Foto Kendaraan"
                invalid={!!photoError}
                errorText={photoError}
              >
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={() => setPhotoError('')}
                  size="lg"
                />
              </Field>

              <Button
                type="submit"
                width="100%"
                size="lg"
                loading={createMutation.isPending}
                disabled={createMutation.isPending}
              >
                Simpan Kendaraan
              </Button>

              <Button
                variant="outline"
                width="100%"
                size="lg"
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Batal
              </Button>
            </VStack>
          </form>
        </VStack>
      </Container>
    </Layout>
  );
}
