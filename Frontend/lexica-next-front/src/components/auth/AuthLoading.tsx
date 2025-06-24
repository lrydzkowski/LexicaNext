import { useAuth0 } from '@auth0/auth0-react';
import { Text } from '@mantine/core';

interface IAuthLoadingProps {
  children: React.ReactNode;
}

export function AuthLoading({ children }: IAuthLoadingProps) {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return <Text m="lg">Loading...</Text>;
  }

  if (error) {
    return (
      <Text m="lg" c="red">
        Error: {error.message}
      </Text>
    );
  }

  return <>{children}</>;
}
