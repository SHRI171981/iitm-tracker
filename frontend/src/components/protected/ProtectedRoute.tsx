import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated) {
    alert('Please login to access this page.');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;