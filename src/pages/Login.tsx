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

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Validator functions
const validateEmail = (value: string) => {
  try {
    loginSchema.shape.email.parse(value);
    return undefined;
  } catch (error: any) {
    return error.errors?.[0]?.message || 'Invalid email';
  }
};

const validatePassword = (value: string) => {
  try {
    loginSchema.shape.password.parse(value);
    return undefined;
  } catch (error: any) {
    return error.errors?.[0]?.message || 'Invalid password';
  }
};

export default function Login() {
  const { isAuthenticated, login, isLoggingIn, loginError, formErrors, setFormErrors } = useAuth();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        login(value);
      } catch (error: any) {
        const { message, formErrors: newFormErrors } = parseApiError(error);
        setFormErrors(newFormErrors || {});
        toaster.create({
          title: 'Login gagal',
          description: message,
          type: 'error',
        });
      }
    },
  });

  // Handle loginError changes
  useEffect(() => {
    if (loginError) {
      const { message, formErrors: newFormErrors } = parseApiError(loginError);
      setFormErrors(newFormErrors || {});
      toaster.create({
        title: 'Login gagal',
        description: message,
        type: 'error',
      });
    }
  }, [loginError, setFormErrors]);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle">
      <Container maxW="md">
        <VStack gap={8} bg="bg" p={8} borderRadius="lg" borderWidth="1px">
          <VStack gap={2}>
            <Heading size="2xl">Login</Heading>
            <Text color="fg.muted">Masuk ke akun Vehico Anda</Text>
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
                            {messages.map((msg, idx) => (
                              <Text key={idx} fontSize="xs" color="red.700">• {msg}</Text>
                            ))}
                          </VStack>
                        ))}
                      </VStack>
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

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

              <Button type="submit" width="100%" size="lg" loading={isLoggingIn}>
                Login
              </Button>

              <Text fontSize="sm">
                Belum punya akun?{' '}
                <ChakraLink asChild color="brand.solid">
                  <RouterLink to={ROUTES.REGISTER}>
                    Daftar sekarang
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
