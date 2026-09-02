import React from 'react';

const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '8px', padding: '24px',
        minWidth: '400px', maxWidth: '600px', maxHeight: '80vh',
        overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px',
        }}>
          <h3 style={{ margin: 0, color: '#1a1a1a' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px',
            cursor: 'pointer', color: '#666', padding: '0',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
