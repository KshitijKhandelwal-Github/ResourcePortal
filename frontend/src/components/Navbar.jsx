import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Admin',
    senior_associate: 'Senior Associate',
    user: 'User',
  };

  return (
    <div className="navbar">
      <h2>Resource Management & Skill Tracking Portal</h2>
      <div className="navbar-right">
        <span className="navbar-role">{roleLabel[user?.role] || user?.role}</span>
        <span style={{ fontSize: '14px' }}>{user?.username}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;