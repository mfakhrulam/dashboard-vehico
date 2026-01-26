import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface QuickServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickServiceModal({ isOpen, onClose }: Readonly<QuickServiceModalProps>) {
  if (!isOpen) return null;

  return (
    <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={6}>
      <VStack gap={3} align="start">
        <Heading size="md">Catat Service Cepat</Heading>
        <Text color="textMuted">
          TODO: Implementasikan modal dengan pemilihan kendaraan, preset cepat, dan form singkat.
        </Text>
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </VStack>
    </Box>
  );
}
