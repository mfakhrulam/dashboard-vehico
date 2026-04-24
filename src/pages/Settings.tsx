import { Badge, Box, Button, Container, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { FiLogOut, FiMonitor, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/constants';
import { useColorMode } from '@/components/ui/color-mode';

export default function Settings() {
  const { logout, isLoggingOut } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const isLight = colorMode === 'light';
  const isDark = colorMode === 'dark';

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
            transition="all 0.2s ease"
            _hover={{ borderColor: 'brand.emphasized' }}
          >
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between" align="start" flexWrap="wrap" gap={3}>
                <VStack align="start" gap={1}>
                  <Heading size="lg">Pengaturan</Heading>
                  <Text color="textMuted">
                    Atur tampilan aplikasi dan aksi akun dengan cepat.
                  </Text>
                </VStack>
                <Badge colorPalette="brand" variant="subtle">
                  Preferensi
                </Badge>
              </HStack>
              <HStack gap={2} color="textMuted">
                <FiMonitor />
                <Text fontSize="sm">Mode saat ini: {isLight ? 'Light' : 'Dark'}</Text>
              </HStack>
            </VStack>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Box
              bg="surface"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border"
              transition="all 0.2s ease"
              _hover={{ borderColor: 'brand.emphasized' }}
            >
              <VStack align="stretch" gap={5}>
                <Heading size="md">Tampilan</Heading>
                <Text color="textMuted">
                  Pilih mode visual yang paling nyaman untuk penggunaan harian.
                </Text>

                <HStack gap={3}>
                  <Box
                    flex={1}
                    borderWidth="1px"
                    borderColor={isLight ? 'brand.emphasized' : 'border'}
                    bg={isLight ? 'brand.subtle' : 'bg'}
                    borderRadius="lg"
                    p={4}
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Light</Text>
                      <FiSun />
                    </HStack>
                  </Box>
                  <Box
                    flex={1}
                    borderWidth="1px"
                    borderColor={isDark ? 'brand.emphasized' : 'border'}
                    bg={isDark ? 'brand.subtle' : 'bg'}
                    borderRadius="lg"
                    p={4}
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Dark</Text>
                      <FiMoon />
                    </HStack>
                  </Box>
                </HStack>

                <Button
                  variant="outline"
                  onClick={toggleColorMode}
                  alignSelf="start"
                  transition="all 0.2s ease"
                  _hover={{ transform: 'translateY(-1px)', borderColor: 'brand.emphasized', bg: 'brand.subtle' }}
                  _active={{ transform: 'translateY(0)' }}
                >
                  Ganti ke mode {isLight ? 'Dark' : 'Light'}
                </Button>
              </VStack>
            </Box>

            <Box
              bg="surface"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border"
              transition="all 0.2s ease"
              _hover={{ borderColor: 'brand.emphasized' }}
            >
              <VStack align="stretch" gap={5}>
                <Heading size="md">Akun</Heading>
                <Text color="textMuted">
                  Kelola akses akun Anda dengan aman dari panel ini.
                </Text>

                <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="lg" p={4}>
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <HStack gap={2}>
                      <FiUser />
                      <Text>Kembali ke halaman profil untuk edit data dan password.</Text>
                    </HStack>
                    <RouterLink to={ROUTES.PROFILE}>
                      <Button
                        variant="outline"
                        transition="all 0.2s ease"
                        _hover={{ transform: 'translateY(-1px)', borderColor: 'brand.emphasized', bg: 'brand.subtle' }}
                        _active={{ transform: 'translateY(0)' }}
                      >
                        Ke Profil
                      </Button>
                    </RouterLink>
                  </HStack>
                </Box>

                <Box bg="bg" borderWidth="1px" borderColor="border" borderRadius="lg" p={4}>
                  <VStack align="stretch" gap={3}>
                    <HStack gap={2} color="danger">
                      <FiLogOut />
                      <Text fontWeight="semibold">Keluar dari Sesi</Text>
                    </HStack>
                    <Text color="textMuted" fontSize="sm">
                      Setelah logout, Anda perlu login kembali untuk mengakses data kendaraan.
                    </Text>
                    <Button
                      colorPalette="red"
                      onClick={() => logout()}
                      loading={isLoggingOut}
                      alignSelf="start"
                      transition="all 0.2s ease"
                      _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
                      _active={{ transform: 'translateY(0)' }}
                    >
                      Logout
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Layout>
  );
}
