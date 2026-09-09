import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-header-icon">❖</span> Resource Portal
      </div>
      <nav className="sidebar-nav">
        {(role === 'admin' || role === 'senior_associate') && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <span>📊</span> Dashboard
            </NavLink>
            <NavLink to="/resources" className={({ isActive }) => isActive ? 'active' : ''}>
              <span>👥</span> Resources
            </NavLink>
          </>
        )}
        {role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>⚙️</span> Administration
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          <span>👤</span> My Profile
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;