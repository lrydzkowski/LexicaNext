import { useAuth0 } from '@auth0/auth0-react';
import { Container, Text } from '@mantine/core';

interface IAuthLoadingProps {
  children: React.ReactNode;
}

export function AuthLoading({ children }: IAuthLoadingProps) {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <Container size="md" p={0}>
        <Text m="lg">Loading...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" p={0}>
        <Text m="lg" c="red">
          Error: {error.message}
        </Text>
      </Container>
    );
  }

  return <>{children}</>;
}
