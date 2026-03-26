import { Box, Button, Container, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/constants';
import { useColorMode } from '@/components/ui/color-mode';

export default function Settings() {
  const { logout, isLoggingOut } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const nextMode = colorMode === 'light' ? 'dark' : 'light';

  return (
    <Layout>
      <Container maxW="7xl">
        <VStack gap={6} align="stretch">
          <Heading>Settings</Heading>

          <Box bg="bg.muted" p={6} borderRadius="lg" borderWidth="1px">
            <VStack align="stretch" gap={4}>
              <Heading size="md">Appearance</Heading>
              <Text color="textMuted">
                Ubah tema aplikasi untuk kenyamanan penggunaan siang atau malam.
              </Text>
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                <Text>Mode aktif: {colorMode === 'light' ? 'Light' : 'Dark'}</Text>
                <Button variant="outline" onClick={toggleColorMode}>
                  Ganti ke mode {nextMode === 'light' ? 'Light' : 'Dark'}
                </Button>
              </HStack>
            </VStack>
          </Box>

          <Box bg="bg.muted" p={6} borderRadius="lg" borderWidth="1px">
            <VStack align="stretch" gap={4}>
              <Heading size="md">Account</Heading>
              <Text color="textMuted">
                Keluar dari akun ini jika selesai menggunakan aplikasi.
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <RouterLink to={ROUTES.PROFILE}>
                  <Button variant="outline">Kembali ke Profil</Button>
                </RouterLink>
                <Button colorPalette="red" onClick={() => logout()} loading={isLoggingOut}>
                  Logout
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}
