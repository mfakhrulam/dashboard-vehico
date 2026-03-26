import { Box, Button, Container, Heading, Input, Text, VStack } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { toaster } from '@/components/ui/toaster';
import { parseApiError } from '@/utils/error';
import { Field } from '@/components/ui/field';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z
    .string()
    .min(8, 'Password baru minimal 8 karakter')
    .regex(/[A-Z]/, 'Password baru harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password baru harus mengandung huruf kecil')
    .regex(/\d/, 'Password baru harus mengandung angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak sama',
  path: ['confirmPassword'],
});

const validateField = (schema: z.ZodType, value: unknown): string | undefined => {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  return result.error.issues[0]?.message;
};

export default function Profile() {
  const { user, profile } = useAuth();

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toaster.create({
        title: 'Password berhasil diubah',
        description: 'Gunakan password baru saat login berikutnya.',
        type: 'success',
      });
      form.reset();
    },
    onError: (error) => {
      const { message } = parseApiError(error);
      toaster.create({
        title: 'Gagal mengubah password',
        description: message,
        type: 'error',
      });
    },
  });

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: ({ value }) => {
      changePasswordMutation.mutate({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      });
    },
  });

  return (
    <Layout>
      <Container maxW="7xl">
        <VStack gap={6} align="stretch">
          <Heading>Profile</Heading>

          <Box bg="bg.muted" p={6} borderRadius="lg" borderWidth="1px">
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Nama
                </Text>
                <Text>{user?.name || profile?.name}</Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={1}>
                  Email
                </Text>
                <Text>{user?.email || profile?.email}</Text>
              </Box>

              {profile?.lastLoginAt && (
                <Box>
                  <Text fontWeight="semibold" mb={1}>
                    Last Login
                  </Text>
                  <Text>{new Date(profile.lastLoginAt).toLocaleString('id-ID')}</Text>
                </Box>
              )}

              {profile?.lastLoginDevice && (
                <Box>
                  <Text fontWeight="semibold" mb={1}>
                    Device
                  </Text>
                  <Text>{profile.lastLoginDevice}</Text>
                </Box>
              )}
            </VStack>
          </Box>

          <Box bg="bg.muted" p={6} borderRadius="lg" borderWidth="1px">
            <VStack align="stretch" gap={4}>
              <Heading size="md">Ganti Password</Heading>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  form.handleSubmit();
                }}
              >
                <VStack align="stretch" gap={4}>
                  <form.Field
                    name="currentPassword"
                    validators={{
                      onChange: ({ value }) => validateField(changePasswordSchema.shape.currentPassword, value),
                    }}
                  >
                    {(field) => (
                      <Field
                        label="Password Saat Ini"
                        invalid={field.state.meta.errors.length > 0}
                        errorText={field.state.meta.errors[0]}
                      >
                        <Input
                          type="password"
                          size="lg"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Masukkan password saat ini"
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field
                    name="newPassword"
                    validators={{
                      onChange: ({ value }) => validateField(changePasswordSchema.shape.newPassword, value),
                    }}
                  >
                    {(field) => (
                      <Field
                        label="Password Baru"
                        helperText="Minimal 8 karakter, huruf besar, huruf kecil, dan angka"
                        invalid={field.state.meta.errors.length > 0}
                        errorText={field.state.meta.errors[0]}
                      >
                        <Input
                          type="password"
                          size="lg"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Masukkan password baru"
                        />
                      </Field>
                    )}
                  </form.Field>

                  <form.Field
                    name="confirmPassword"
                    validators={{
                      onChangeListenTo: ['newPassword'],
                      onChange: ({ value, fieldApi }) => {
                        const requiredMessage = validateField(changePasswordSchema.shape.confirmPassword, value);
                        if (requiredMessage) return requiredMessage;
                        if (value !== fieldApi.form.getFieldValue('newPassword')) {
                          return 'Konfirmasi password tidak sama';
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field
                        label="Konfirmasi Password Baru"
                        invalid={field.state.meta.errors.length > 0}
                        errorText={field.state.meta.errors[0]}
                      >
                        <Input
                          type="password"
                          size="lg"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Ulangi password baru"
                        />
                      </Field>
                    )}
                  </form.Field>

                  <Button
                    alignSelf="start"
                    colorPalette="brand"
                    type="submit"
                    loading={changePasswordMutation.isPending}
                  >
                    Simpan Password Baru
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}
