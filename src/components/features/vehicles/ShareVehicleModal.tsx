import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface ShareVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
}

export default function ShareVehicleModal({ isOpen, onClose }: Readonly<ShareVehicleModalProps>) {
  if (!isOpen) return null;

  return (
    <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={6}>
      <VStack gap={3} align="start">
        <Heading size="md">Bagikan Kendaraan</Heading>
        <Text color="textMuted">
          TODO: Implementasikan modal berbagi (email, permission, daftar pengguna).
        </Text>
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </VStack>
    </Box>
  );
}
