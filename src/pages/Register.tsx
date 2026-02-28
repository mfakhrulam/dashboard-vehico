import { Box, Container, Heading, Text, VStack, Input, Button, Link as ChakraLink, Alert } from '@chakra-ui/react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Link as RouterLink, Navigate } from 'react-router';
import { ROUTES } from '@/config/constants';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { parseApiError } from '@/utils/error';
import { useEffect } from 'react';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  }
);

// Validator functions
const validateField = (schema: z.ZodType, value: unknown): string | undefined => {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues[0]?.message;
};

const validateName = (value: string) => validateField(registerSchema.shape.name, value);
const validateEmail = (value: string) => validateField(registerSchema.shape.email, value);
const validatePassword = (value: string) => validateField(registerSchema.shape.password, value);

export default function Register() {
  const { isAuthenticated, register, isRegistering, registerError, formErrors, setFormErrors } = useAuth();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      register({ name: value.name, email: value.email, password: value.password });
    },
  });

  // Handle registerError changes
  useEffect(() => {
    if (registerError) {
      const { message, formErrors: newFormErrors } = parseApiError(registerError);
      setFormErrors(newFormErrors || {});
      toaster.create({
        title: 'Registrasi gagal',
        description: message,
        type: 'error',
      });
    }
  }, [registerError, setFormErrors]);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle">
      <Container maxW="md">
        <VStack gap={8} bg="bg" p={8} borderRadius="lg" borderWidth="1px">
          <VStack gap={2}>
            <Heading size="2xl">Daftar</Heading>
            <Text color="fg.muted">Buat akun Vehico baru</Text>
          </VStack>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            style={{ width: '100%' }}
          >
            <VStack gap={4} width="100%">
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
                      label="Nama Lengkap"
                      invalid={!!allErrors.length}
                      errorText={allErrors[0]}
                    >
                      <Input
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="John Doe"
                        size="lg"
                      />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => validateEmail(value) || undefined,
                }}
              >
                {(field) => {
                  const backendErrors = formErrors['email'] || [];
                  const clientErrors = field.state.meta.errors;
                  const allErrors = [...backendErrors, ...clientErrors];
                  
                  return (
                    <Field
                      label="Email"
                      invalid={!!allErrors.length}
                      errorText={allErrors[0]}
                    >
                      <Input
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="email@example.com"
                        type="email"
                        size="lg"
                      />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => validatePassword(value) || undefined,
                }}
              >
                {(field) => {
                  const backendErrors = formErrors['password'] || [];
                  const clientErrors = field.state.meta.errors;
                  const allErrors = [...backendErrors, ...clientErrors];
                  
                  return (
                    <Field
                      label="Password"
                      invalid={!!allErrors.length}
                      errorText={allErrors[0]}
                    >
                      <Input
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="******"
                        type="password"
                        size="lg"
                      />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ['password'],
                  onChange: ({ value, fieldApi }) => {
                    if (value && value !== fieldApi.form.getFieldValue('password')) {
                      return 'Password tidak cocok';
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const backendErrors = formErrors['confirmPassword'] || [];
                  const clientErrors = field.state.meta.errors;
                  const allErrors = [...backendErrors, ...clientErrors];

                  return (
                    <Field
                      label="Konfirmasi Password"
                      invalid={!!allErrors.length}
                      errorText={allErrors[0]}
                    >
                      <Input
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="******"
                        type="password"
                        size="lg"
                      />
                    </Field>
                  );
                }}
              </form.Field>

              <Button type="submit" width="100%" size="lg" loading={isRegistering}>
                Daftar
              </Button>

              <Text fontSize="sm">
                Sudah punya akun?{' '}
                <ChakraLink asChild color="brand.solid">
                  <RouterLink to={ROUTES.LOGIN}>
                    Login
                  </RouterLink>
                </ChakraLink>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Container>
    </Box>
  );
}
