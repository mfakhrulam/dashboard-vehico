import type { ReactNode } from 'react';
import { Box, Flex, Heading, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { FiChevronRight } from 'react-icons/fi';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export default function PageHeader({ title, description, breadcrumbs, actions }: Readonly<PageHeaderProps>) {
  return (
    <Stack gap={3} mb={6}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <HStack gap={2} flexWrap="wrap" color="textMuted" fontSize="sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <HStack key={`${crumb.label}-${index}`} gap={2}>
                {crumb.to && !isLast ? (
                  <RouterLink to={crumb.to} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Text as="span">{crumb.label}</Text>
                  </RouterLink>
                ) : (
                  <Text fontWeight={isLast ? 'semibold' : 'normal'}>{crumb.label}</Text>
                )}
                {!isLast && <Icon as={FiChevronRight} boxSize={4} />}
              </HStack>
            );
          })}
        </HStack>
      )}

      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap={4} direction={{ base: 'column', md: 'row' }}>
        <Box>
          <Heading size="lg">{title}</Heading>
          {description && (
            <Text color="textMuted" mt={1}>
              {description}
            </Text>
          )}
        </Box>
        {actions}
      </Flex>
    </Stack>
  );
}
