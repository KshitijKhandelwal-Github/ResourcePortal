const StatCard = ({ title, value, color = '#86BC25' }) => {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '12px',
      padding: '20px 22px',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      minWidth: '160px',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--gray)',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: '6px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '30px',
        fontWeight: '700',
        color: 'var(--black)',
        letterSpacing: '-0.02em',
        lineHeight: 1.1
      }}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
