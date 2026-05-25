import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import CourseList from '@/components/CourseList';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/components/Dashboard';
import Progress from '@/components/Progress';
import Analytics from '@/components/Analytics';
import Admin from '@/components/Admin';
import Stopwatch from '@/components/Stopwatch';

/**
 * Fallback component for rendering wireframe layouts for unresolved routes.
 */
const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex-1 flex flex-col">
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
      <p className="text-slate-500 mt-1 text-sm">Component pending integration.</p>
    </header>
    <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white shadow-sm">
      <span className="text-slate-400 font-medium text-sm">{title} Content Area</span>
    </div>
  </div>
);

/**
 * Root layout wrapper.
 * Persists the NavBar across route transitions.
 */
const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <NavBar />
      <main className="flex-1 p-8 flex flex-col max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

/**
 * Authentication layout wrapper.
 * Provides a minimal shell for unauthenticated views like Login and Signup.
 */
const AuthLayout: React.FC = () => (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
      <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
      <p className="text-slate-500 mb-6">Login component mounts here.</p>
    </div>
  </div>
);

/**
 * Application routing tree.
 * Enforces the layout structure, authentication boundaries, and maps URL segments to imported components.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/courses" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'courses', element: <CourseList /> },
          { path: 'progress', element: <Progress /> },
          { path: 'analytics', element: <Analytics /> },
          { path: 'admin', element: <Admin /> },
          { path: 'stopwatch', element: <Stopwatch /> },
          { path: '*', element: <PlaceholderContent title="404 - Not Found" /> }
        ]
      }
    ]
  }
]);