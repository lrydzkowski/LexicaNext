import { useAuth0 } from '@auth0/auth0-react';
import { Button, Container, Stack, Text, Title } from '@mantine/core';

export function SignInPage() {
  const { loginWithRedirect } = useAuth0();

  const handleSignIn = () => {
    loginWithRedirect();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSignIn();
    }
  };

  return (
    <>
      <Container size="sm" py={{ base: 40, md: 80 }} px={0}>
        <Stack gap="lg" p={0}>
          <div>
            <Title order={2} mb="sm" ta="center">
              Welcome to LexicaNext
            </Title>
            <Text c="dimmed" fz={{ base: 'md', md: 'lg' }} ta="center">
              Master English vocabulary with our interactive learning modes. Create custom word sets and practice with
              spelling, comprehension, and memory exercises.
            </Text>
          </div>

          <Button size="lg" onClick={handleSignIn} onKeyDown={handleKeyDown} fullWidth autoFocus>
            Sign In to Continue
          </Button>
        </Stack>
      </Container>
    </>
  );
}
