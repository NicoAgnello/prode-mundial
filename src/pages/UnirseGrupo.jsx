import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function UnirseGrupo({ onUnirse }) {
  const { user } = useAuth0()
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleUnirse = async () => {
    if (!codigo.trim()) return
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.sub, codigo: codigo.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al unirse al grupo')
      } else {
        onUnirse(data.grupo)
      }
    } catch {
      setError('Error de conexión, intentá de nuevo')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icono}>🏆</div>
        <h1 style={styles.titulo}>PRODE 2026</h1>
        <p style={styles.desc}>
          Para participar necesitás un código de grupo.
          Pedíselo a quien organizó el prode.
        </p>

        <div style={styles.inputGroup}>
          <input
            type="text"
            placeholder="Ej: PRODE2026"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleUnirse()}
            style={styles.input}
            maxLength={20}
            autoFocus
          />
          <button
            onClick={handleUnirse}
            disabled={cargando || !codigo.trim()}
            style={styles.btn}
          >
            {cargando ? 'Verificando...' : 'Unirme →'}
          </button>
        </div>

        {error && (
          <div style={styles.error}>⚠ {error}</div>
        )}

        <p style={styles.ayuda}>
          Si no tenés código, contactá al administrador del prode.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: 'var(--blanco)',
    border: '1px solid var(--borde)',
    borderRadius: 20,
    padding: '40px 32px',
    maxWidth: 420,
    width: '100%',
    textAlign: 'center',
    borderTop: '4px solid var(--celeste)',
  },
  icono: { fontSize: 48, marginBottom: 8 },
  titulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    letterSpacing: 3,
    marginBottom: 12,
    color: 'var(--texto-principal)',
  },
  desc: {
    fontSize: 15,
    color: 'var(--texto-secundario)',
    lineHeight: 1.6,
    marginBottom: 24,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid var(--borde)',
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    textTransform: 'uppercase',
  },
  btn: {
    background: 'var(--celeste)',
    color: 'var(--blanco)',
    border: 'none',
    padding: '12px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    background: '#fee2e2',
    padding: '8px 12px',
    borderRadius: 8,
  },
  ayuda: {
    fontSize: 12,
    color: 'var(--texto-secundario)',
    marginTop: 16,
  },
}