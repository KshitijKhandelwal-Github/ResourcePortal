import React from 'react';

const StatCard = ({ title, value, color = 'var(--primary)' }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '20px 24px',
      borderLeft: `4px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      minWidth: '160px',
      flex: '1',
    }}>
      <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
