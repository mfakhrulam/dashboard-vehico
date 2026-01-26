import { Box, Button, Text, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: Readonly<EmptyStateProps>) {
  return (
    <Box bg="surface" borderWidth="1px" borderColor="border" borderRadius="xl" textAlign="center" py={12} px={6}>
      <VStack gap={3} align="center">
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
        {description && (
          <Text color="textMuted" maxW="sm">
            {description}
          </Text>
        )}
        {children}
        {actionLabel && onAction && (
          <Button colorPalette="brand" onClick={onAction} minW="180px">
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
}
