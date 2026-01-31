import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Box, Button, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console (can be replaced with error reporting service)
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    globalThis.location.reload();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <Box
          bg="surface"
          borderWidth="1px"
          borderColor="border"
          borderRadius="xl"
          p={8}
          textAlign="center"
          maxW="lg"
          mx="auto"
          my={8}
        >
          <VStack gap={4}>
            <Box
              bg="red.100"
              borderRadius="full"
              p={4}
              color="red.600"
            >
              <Icon as={FiAlertTriangle} boxSize={8} />
            </Box>
            
            <Heading size="lg" color="text">
              Terjadi Kesalahan
            </Heading>
            
            <Text color="textMuted" maxW="sm">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau muat ulang halaman.
            </Text>

            {error && process.env.NODE_ENV === 'development' && (
              <Box
                bg="bg"
                borderRadius="lg"
                p={4}
                width="100%"
                textAlign="left"
                fontSize="sm"
                fontFamily="mono"
                overflow="auto"
                maxH="150px"
              >
                <Text color="red.500" fontWeight="bold">
                  {error.name}: {error.message}
                </Text>
              </Box>
            )}

            <VStack gap={3} width="100%" pt={2}>
              <Button
                colorPalette="brand"
                width="100%"
                size="lg"
                onClick={this.handleReset}
              >
                <Icon as={FiRefreshCw} mr={2} />
                Coba Lagi
              </Button>
              
              <Button
                variant="outline"
                width="100%"
                size="lg"
                onClick={this.handleReload}
              >
                Muat Ulang Halaman
              </Button>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
