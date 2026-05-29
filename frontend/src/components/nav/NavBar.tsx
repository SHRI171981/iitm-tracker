import { NavLink } from 'react-router-dom';
import NavItem from '@/components/nav/NavItem';

const NavBar = () => {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive ? "border-b border-slate-800 text-xl" : "";
  };

  return (
    <div className="sticky top-0 flex">
      <div className="flex w-full justify-center bg-gray-400">
        <NavLink to="/" className={getNavLinkClass}>
          <NavItem Name="Home" />
        </NavLink>
        <NavLink to="/analytics" className={getNavLinkClass}>
          <NavItem Name="Analytics" />
        </NavLink>
        <NavLink to="/courses" className={getNavLinkClass}>
          <NavItem Name="Courses" />
        </NavLink>
        <NavLink to="/progress" className={getNavLinkClass}>
          <NavItem Name="Progress" />
        </NavLink>
        <NavLink to="/stopwatch" className={getNavLinkClass}>
          <NavItem Name="Stopwatch" />
        </NavLink>
      </div>

      <div className="justify-end bg-gray-400">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `rounded-3xl bg-black text-white ${isActive ? "border-b border-slate-800 text-xl" : ""}`
          }
        >
          <NavItem Name="Admin" />
        </NavLink>
      </div>
    </div>
  );
};

export default NavBar;