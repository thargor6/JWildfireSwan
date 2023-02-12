import { useViewMatches } from 'Frontend/routes.js';
import { AuthContext } from 'Frontend/useAuth.js';
import { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';

export type AuthControlProps = Readonly<{
  fallback?: ReactNode;
  children?: ReactNode;
}>;

export default function AuthControl({ fallback, children }: AuthControlProps) {
  const { state, hasAccess } = useContext(AuthContext);
  const matches = useViewMatches();

  if (fallback && (state.initializing || state.loading)) {
    return <>{fallback}</>;
  }

  const authorized = matches.every(hasAccess);
  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
