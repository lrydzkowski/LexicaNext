import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router';

interface INotRequireAuthProps {
  children: React.ReactNode;
}

export default function NotRequireAuth(props: INotRequireAuthProps) {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return props.children;
}
