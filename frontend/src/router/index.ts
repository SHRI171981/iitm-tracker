import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import HomeView from '@/views/HomeView';
import AboutView from '@/views/AboutView';
import ChatView from '@/views/ChatView';
import DiscussView from '@/views/DiscussView';
import ProfileView from '@/views/ProfileView';
import QuestionView from '@/views/QuestionView';
import ConstestView from '@/views/ConstestView';
import NotFound from '@/views/NotFound';
import TrialView from '@/views/TrialView';
import QuestionDetailsView from '@/views/QuestionDetailsView';
import LoginView from '@/views/LoginView';
import SignupView from '@/views/SignupView';

const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated) {
    alert('Please login to access this page.');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <HomeView /> },
      { path: '/about', element: <AboutView /> },
      { path: '/questions', element: <QuestionView /> },
      { path: '/question-details', element: <QuestionDetailsView /> },
      { path: '/discuss', element: <DiscussView /> },
      { path: '/contests', element: <ConstestView /> },
      { path: '/chat', element: <ChatView /> },
      { path: '/profile', element: <ProfileView /> },
    ],
  },
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/sign-up',
    element: <SignupView />,
  },
  {
    path: '/trial',
    element: <TrialView />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;