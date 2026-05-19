import { Box, Button, Container, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { ROUTES } from '@/config/constants';
import Layout from '@/components/layout/Layout';
import { FiLock, FiHome, FiTruck } from 'react-icons/fi';

export default function Forbidden() {
  return (
    <Layout>
      <Container maxW="lg" py={{ base: 12, md: 20 }}>
        <VStack gap={8} align="center" textAlign="center">
          <Box
            p={6}
            bg="red.100"
            color="red.600"
            borderRadius="full"
            boxShadow="sm"
          >
            <Icon as={FiLock} boxSize={16} />
          </Box>

          <VStack gap={3}>
            <Text fontWeight="bold" color="red.500" letterSpacing="widest" fontSize="sm">
              ERROR 403
            </Text>
            <Heading size="3xl" letterSpacing="tight">
              Akses Ditolak
            </Heading>
            <Text color="textMuted" fontSize="lg" maxW="md">
              Maaf, Anda tidak memiliki izin untuk melihat atau mengubah data pada halaman ini.
            </Text>
          </VStack>

          <HStack gap={4} pt={4} flexWrap="wrap" justify="center">
            <Button as={RouterLink} to={ROUTES.DASHBOARD} colorPalette="brand" size="lg">
              <Icon as={FiHome} />
              Dashboard
            </Button>
            <Button as={RouterLink} to={ROUTES.GARAGE} variant="outline" size="lg">
              <Icon as={FiTruck} />
              Garasi Kendaraan
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Layout>
  );
}
