import type { ComponentType, ReactNode } from 'react';
import { Box, Button, Container, Flex, Heading, HStack, Icon, Spacer, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router';
import { FiHome, FiTool, FiTruck, FiUser } from 'react-icons/fi';
import { ColorModeButton } from '@/components/ui/color-mode';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME, ROUTES } from '@/config/constants';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: Readonly<LayoutProps>) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const activeNav = (() => {
    const { pathname } = location;
    if (pathname.startsWith('/services')) return 'services';
    if (pathname.startsWith('/garage')) return 'garage';
    if (pathname.startsWith('/vehicles')) return 'garage';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'home';
  })();

  return (
    <Box minH="100vh" bg="bg">
      {/* Navbar (desktop) */}
      <Box
        as="nav"
        bg="surface"
        borderBottomWidth="1px"
        borderColor="border"
        py={4}
        position="sticky"
        top={0}
        zIndex={10}
        display={{ base: 'none', md: 'block' }}
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <RouterLink to={ROUTES.DASHBOARD} style={{ textDecoration: 'none' }}>
              <Heading size="lg">{APP_NAME}</Heading>
            </RouterLink>
            <HStack gap={2} align="center">
              <DesktopNavItem label="Home" to={ROUTES.DASHBOARD} isActive={activeNav === 'home'} />
              <DesktopNavItem label="Garasi" to={ROUTES.GARAGE} isActive={activeNav === 'garage'} />
              <DesktopNavItem label="Service" to={ROUTES.SERVICES} isActive={activeNav === 'services'} />
              <DesktopNavItem label="Profil" to={ROUTES.PROFILE} isActive={activeNav === 'profile'} />
            </HStack>
            <HStack gap={3} align="center">
              {user && (
                <Text fontSize="sm" color="textMuted">
                  Halo, {user.name}
                </Text>
              )}
              <ColorModeButton />
              {user && (
                <Button onClick={() => logout()} size="sm" variant="ghost">
                  Logout
                </Button>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main content */}
      <Box as="main" py={{ base: 6, md: 8 }} pb={{ base: 24, md: 8 }}>
        {children}
      </Box>

      {/* Bottom Navigation (mobile) */}
      <Box
        as="nav"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="surface"
        borderTopWidth="1px"
        borderColor="border"
        zIndex={20}
        display={{ base: 'block', md: 'none' }}
      >
        <Container maxW="7xl" py={2}>
          <Flex align="center" gap={2}>
            <NavItem
              label="Home"
              to={ROUTES.DASHBOARD}
              icon={FiHome}
              isActive={activeNav === 'home'}
            />
            <NavItem
              label="Garasi"
              to={ROUTES.GARAGE}
              icon={FiTruck}
              isActive={activeNav === 'garage'}
            />
            <NavItem
              label="Service"
              to={ROUTES.SERVICES}
              icon={FiTool}
              isActive={activeNav === 'services'}
            />
            <NavItem
              label="Profil"
              to={ROUTES.PROFILE}
              icon={FiUser}
              isActive={activeNav === 'profile'}
            />
            
            <ColorModeButton size="sm" />
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

interface NavItemProps {
  label: string;
  to: string;
  icon: ComponentType;
  isActive?: boolean;
}

function NavItem({ label, to, icon, isActive }: Readonly<NavItemProps>) {
  return (
    <RouterLink to={to} style={{ flex: 1, textDecoration: 'none' }}>
      <Button
        variant={isActive ? 'solid' : 'ghost'}
        colorScheme={isActive ? 'brand' : undefined}
        h="56px"
        w="full"
        display="flex"
        flexDirection="column"
        gap={1}
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={icon} boxSize={5} />
        <Text fontSize="xs" fontWeight={isActive ? 'semibold' : 'normal'}>
          {label}
        </Text>
      </Button>
    </RouterLink>
  );
}

interface DesktopNavItemProps {
  label: string;
  to: string;
  isActive?: boolean;
}

function DesktopNavItem({ label, to, isActive }: Readonly<DesktopNavItemProps>) {
  return (
    <RouterLink to={to} style={{ textDecoration: 'none' }}>
      <Button
        variant={isActive ? 'solid' : 'ghost'}
        colorScheme={isActive ? 'brand' : undefined}
        size="sm"
      >
        {label}
      </Button>
    </RouterLink>
  );
}
