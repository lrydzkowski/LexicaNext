import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from 'react-router';

interface IRequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth(props: IRequireAuthProps) {
  const { isAuthenticated } = useAuth0();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return props.children;
}
