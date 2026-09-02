import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? '#d32f2f' : type === 'warning' ? '#f57c00' : '#2E7D32';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColor,
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 10000,
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '400px',
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: '#fff',
        cursor: 'pointer', fontSize: '18px', padding: '0', lineHeight: '1',
      }}>×</button>
    </div>
  );
};

export default Toast;
