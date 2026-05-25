import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center font-bold text-white text-lg">
              C
            </div>
            <Link to="/" className="text-gray-900 font-bold text-xl tracking-tight">
              CAT Engine
            </Link>
          </div>

          {/* Right side navigation */}
          <div className="flex space-x-6 items-center">
             {location.pathname !== '/' && (
              <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>&larr;</span> Back to Mocks
              </Link>
            )}
            <Link to="/history" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Performance History
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}