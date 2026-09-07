import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const accentColor = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: 'var(--black)',
      color: 'var(--white)',
      padding: '14px 20px',
      borderRadius: '10px',
      borderLeft: `4px solid ${accentColor}`,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      zIndex: 10000,
      fontSize: '13.5px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      maxWidth: '420px',
      border: '1px solid var(--border-dark)',
      borderLeftWidth: '4px',
      borderLeftColor: accentColor,
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: 'var(--light-gray)',
        cursor: 'pointer', fontSize: '18px', padding: '0', lineHeight: '1',
      }}>×</button>
    </div>
  );
};

export default Toast;
