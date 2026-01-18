import { Container, Heading, VStack, Box, Text } from '@chakra-ui/react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user, profile } = useAuth();

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
        </VStack>
      </Container>
    </Layout>
  );
}
