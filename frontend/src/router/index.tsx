import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import ProtectedRoute from '@/components/protected/ProtectedRoute';
import HomeView from '@/views/HomeView';
import AnalyticsView from '@/views/AnalyticsView';
import CourseView from '@/views/CourseView';
import CourseDetailsView from '@/views/CourseDetailsView';
import CourseDetailsAdminView from '@/views/CourseDetailsAdminView';
import ProgressView from '@/views/ProgressView';
import StopwatchView from '@/views/StopwatchView';
import AdminView from '@/views/AdminView';
import LoginView from '@/views/LoginView';
import SignupView from '@/views/SignupView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // ==========================================
      // TIER 1: Shared Routes (Students & Admins)
      // ==========================================
      {
        element: <ProtectedRoute allowedRoles={['student', 'admin']} />, 
        children: [
          { index: true, element: <HomeView /> },
          { path: 'analytics', element: <AnalyticsView /> },
          { path: 'progress', element: <ProgressView /> },
          { path: 'stopwatch', element: <StopwatchView /> },
          { 
            path: 'courses', 
            children: [
              { index: true, element: <CourseView /> },
              // Standard details view for everyone
              { path: ':id', element: <CourseDetailsView /> } 
            ]
          },
        ],
      },
      
      // ==========================================
      // TIER 2: Strict Admin-Only Routes
      // ==========================================
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { path: 'admin', element: <AdminView /> },
          // If you want a dedicated URL for the admin editor:
          { path: 'admin/courses/:id', element: <CourseDetailsAdminView /> },
        ],
      },

      // ==========================================
      // TIER 3: Public Routes (Unauthenticated)
      // ==========================================
      {
        path: 'login',
        element: <LoginView />,
      },
      {
        path: 'sign-up',
        element: <SignupView />,
      },
    ],
  },
]);

export default router;