import React from 'react';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '4px solid #e0e0e0',
      borderTop: '4px solid var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner;
