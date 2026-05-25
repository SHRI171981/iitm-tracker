import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const location = useLocation();

  /**
   * Routing configuration mapping display labels to exact URL paths.
   * Centralizing these definitions prevents hardcoded string mismatches.
   */
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Courses', path: '/courses' },
    { name: 'Progress', path: '/progress' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Admin', path: '/admin' },
    { name: 'Stopwatch', path: '/stopwatch' }
  ];

  return (
    <nav className="w-full h-16 bg-slate-900 flex items-center px-6 shadow-md shrink-0">
      <div className="flex items-center mr-8 border-r border-slate-700 pr-8">
        <span className="text-white font-bold text-lg tracking-widest uppercase">
          Portal
        </span>
      </div>
      <ul className="flex flex-row gap-2 h-full items-center">
        {navItems.map((item) => {
          // Determines active state based on route prefixes to support nested child routes.
          const isActive = location.pathname.startsWith(item.path);
                           
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-colors duration-200 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavBar;