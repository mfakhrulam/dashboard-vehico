import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label = 'Memuat data...' }: Readonly<LoadingSpinnerProps>) {
  return (
    <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" p={6}>
      <VStack gap={3} align="center">
        <Spinner size="lg" color="brand.solid" />
        <Text color="textMuted">{label}</Text>
      </VStack>
    </Box>
  );
}
