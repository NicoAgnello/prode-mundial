export default function Cargando() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gris-oscuro)',
      gap: 20,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 48,
        color: 'var(--celeste)',
        letterSpacing: 4,
        animation: 'pulse 1.5s infinite',
      }}>
        PRODE 2026
      </div>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid rgba(116,172,223,0.2)',
        borderTop: '4px solid var(--celeste)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
