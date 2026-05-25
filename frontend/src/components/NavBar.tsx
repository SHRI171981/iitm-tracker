import React from 'react';

// Defines the contract for the Navbar's expected properties, 
// ensuring the parent component passes the required state control functions.
interface NavbarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeItem, setActiveItem }) => {
  const navItems = [
    'Dashboard',
    'Courses',
    'Progress',
    'Analytics',
    'Admin',
    'Stopwatch'
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
          const isActive = activeItem === item;
          return (
            <li
              key={item}
              onClick={() => setActiveItem(item)}
              className={`px-4 py-2 rounded-md text-sm font-medium tracking-wide cursor-pointer transition-colors duration-200 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;