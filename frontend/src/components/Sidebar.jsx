import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        ⬡ Resource Portal
      </div>
      <nav className="sidebar-nav">
        {(role === 'admin' || role === 'senior_associate') && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/resources" className={({ isActive }) => isActive ? 'active' : ''}>
              👥 Resources
            </NavLink>
          </>
        )}
        {role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
            ⚙️ Administration
          </NavLink>
        )}
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          👤 My Profile
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;