import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default function ErrorBoundary({ children }: Readonly<ErrorBoundaryProps>) {
  // TODO: Implement proper error boundary once React Error Boundary is configured.
  return <>{children}</>;
}
