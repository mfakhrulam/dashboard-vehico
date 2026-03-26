import { Badge, Box, Button, Container, Heading, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { FiArrowRight, FiShield, FiUser } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { toaster } from '@/components/ui/toaster';
import { parseApiError } from '@/utils/error';
import { Field } from '@/components/ui/field';
import { ROUTES } from '@/config/constants';
import { Link as RouterLink } from 'react-router';

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
          <Box
            bgGradient="to-r"
            gradientFrom="brand.subtle"
            gradientTo="bg"
            borderWidth="1px"
            borderColor="border"
            borderRadius="xl"
            p={{ base: 5, md: 6 }}
          >
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between" align="start" flexWrap="wrap">
                <VStack align="start" gap={1}>
                  <Heading size="lg">Profil Akun</Heading>
                  <Text color="textMuted">
                    Kelola data akun dan keamanan login dari satu tempat.
                  </Text>
                </VStack>
                <Badge colorPalette="brand" variant="subtle">
                  Aktif
                </Badge>
              </HStack>
              <HStack gap={2} color="textMuted" flexWrap="wrap">
                <FiUser />
                <Text fontSize="sm">{user?.email || profile?.email}</Text>
              </HStack>
            </VStack>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
            <Box bg="surface" p={6} borderRadius="xl" borderWidth="1px" borderColor="border">
              <VStack gap={5} align="stretch">
                <Heading size="md">Informasi Akun</Heading>

                <Box>
                  <Text fontWeight="semibold" mb={1}>
                    Nama
                  </Text>
                  <Text color="textMuted">{user?.name || profile?.name || '-'}</Text>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={1}>
                    Email
                  </Text>
                  <Text color="textMuted">{user?.email || profile?.email || '-'}</Text>
                </Box>

                {profile?.lastLoginAt && (
                  <Box>
                    <Text fontWeight="semibold" mb={1}>
                      Login Terakhir
                    </Text>
                    <Text color="textMuted">{new Date(profile.lastLoginAt).toLocaleString('id-ID')}</Text>
                  </Box>
                )}

                {profile?.lastLoginDevice && (
                  <Box>
                    <Text fontWeight="semibold" mb={1}>
                      Perangkat
                    </Text>
                    <Text color="textMuted">{profile.lastLoginDevice}</Text>
                  </Box>
                )}

                <Box bg="bg" p={4} borderRadius="lg" borderWidth="1px" borderColor="border">
                  <VStack align="stretch" gap={3}>
                    <Text fontWeight="semibold">Pengaturan Akun</Text>
                    <Text fontSize="sm" color="textMuted">
                      Tema dan logout kini dipusatkan di halaman Pengaturan.
                    </Text>
                    <RouterLink to={ROUTES.SETTINGS}>
                      <Button variant="outline" width="full">
                        <HStack as="span" gap={2}>
                          <Text>Buka Pengaturan</Text>
                          <FiArrowRight />
                        </HStack>
                      </Button>
                    </RouterLink>
                  </VStack>
                </Box>
              </VStack>
            </Box>

            <Box bg="surface" p={6} borderRadius="xl" borderWidth="1px" borderColor="border" gridColumn={{ lg: 'span 2' }}>
              <VStack align="stretch" gap={5}>
                <HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
                  <VStack align="start" gap={1}>
                    <Heading size="md">Ganti Password</Heading>
                    <Text color="textMuted" fontSize="sm">
                      Gunakan kombinasi password yang kuat untuk keamanan akun.
                    </Text>
                  </VStack>
                  <HStack bg="bg" borderWidth="1px" borderColor="border" px={3} py={2} borderRadius="md">
                    <FiShield />
                    <Text fontSize="sm">Keamanan Tinggi</Text>
                  </HStack>
                </HStack>

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
          </SimpleGrid>
        </VStack>
      </Container>
    </Layout>
  );
}
