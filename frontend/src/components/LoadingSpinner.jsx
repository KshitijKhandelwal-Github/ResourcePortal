const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 20px',
  }}>
    <div style={{
      width: '38px',
      height: '38px',
      border: '3px solid var(--border)',
      borderTop: '3px solid var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner;
