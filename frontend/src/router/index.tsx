import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import ProtectedRoute from '@/components/protected/ProtectedRoute'
import HomeView from '@/views/HomeView';
import AnalyticsView from '@/views/AnalyticsView';
import CourseView from '@/views/CourseView';
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
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <HomeView /> },
          { path: 'analytics', element: <AnalyticsView /> },
          { path: 'courses', element: <CourseView /> },
          { path: 'progress', element: <ProgressView /> },
          { path: 'stopwatch', element: <StopwatchView /> },
          { path: 'admin', element: <AdminView /> },
        ],
      },
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