// src/components/protected/HasRole.tsx
import { type ReactNode, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

interface HasRoleProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const HasRole = ({ roles, children, fallback = null }: HasRoleProps) => {
  const auth = useContext(AuthContext);

  if (!auth?.user || !roles.includes(auth.user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};