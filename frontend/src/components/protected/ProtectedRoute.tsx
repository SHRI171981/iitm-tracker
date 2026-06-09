import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext'; // Adjust path if necessary

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const auth = useContext(AuthContext);

  // 1. Authentication Check
  // If there is no token or user in the context, they are not logged in.
  if (!auth?.token || !auth?.user) {
    // Note: Removed the native alert() for better UX. 
    // If you want a toast notification, trigger it from your Login component upon redirect.
    return <Navigate to="/login" replace />;
  }

  // 2. Authorization (RBAC) Check
  // If the route provided specific roles, check if the user's role is in that list.
  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    // The user is logged in, but lacks permission (e.g., a student trying to access /admin)
    // Redirect them to a safe default page or a dedicated "Unauthorized" view.
    return <Navigate to="/" replace />; 
  }

  // 3. Success
  // The user is authenticated and authorized. Render the requested route.
  return <Outlet />;
};

export default ProtectedRoute;