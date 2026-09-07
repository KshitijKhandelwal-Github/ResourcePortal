const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(9, 9, 11, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 9999,
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--white)',
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '22px', borderBottom: '1px solid var(--border)', paddingBottom: '14px',
        }}>
          <h3 style={{ margin: 0, color: 'var(--black)', fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '22px',
            cursor: 'pointer', color: 'var(--gray)', padding: '0 4px', lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
