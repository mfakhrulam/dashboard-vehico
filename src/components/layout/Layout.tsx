import { ReactNode } from 'react';
import { Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/config/constants';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: Readonly<LayoutProps>) {
  const { user, logout } = useAuth();

  return (
    <Box minH="100vh">
      {/* Navbar */}
      <Box as="nav" bg="bg.muted" borderBottomWidth="1px" py={4}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg">{APP_NAME}</Heading>
            <Flex gap={4} align="center">
              {user && <Text fontSize="sm">Halo, {user.name}</Text>}
              <ColorModeButton />
              {user && (
                <Button onClick={() => logout()} size="sm" variant="ghost">
                  Logout
                </Button>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main content */}
      <Box as="main" py={8}>
        {children}
      </Box>
    </Box>
  );
}
