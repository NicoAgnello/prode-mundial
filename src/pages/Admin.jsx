import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function Admin() {
  const { user, isAuthenticated } = useAuth0()
  const [partidos, setPartidos] = useState([])
  const [sincronizando, setSincronizando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const esAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL

  useEffect(() => {
    if (!esAdmin) return
    fetch('/api/partidos').then(r => r.json()).then(setPartidos)
  }, [esAdmin])

  const sincronizarResultados = async () => {
    setSincronizando(true)
    setMensaje('')
    try {
      const res = await fetch('/api/admin/sincronizar', { method: 'POST' })
      const data = await res.json()
      setMensaje(`✓ ${data.actualizados} partidos sincronizados`)
    } catch {
      setMensaje('Error al sincronizar')
    } finally {
      setSincronizando(false)
    }
  }

  const recalcularPuntos = async () => {
    setSincronizando(true)
    setMensaje('')
    try {
      const res = await fetch('/api/admin/recalcular', { method: 'POST' })
      const data = await res.json()
      setMensaje(`✓ Puntos recalculados: ${data.prediccionesActualizadas} predicciones`)
    } catch {
      setMensaje('Error al recalcular')
    } finally {
      setSincronizando(false)
    }
  }

  if (!isAuthenticated || !esAdmin) {
    return (
      <div style={styles.centrado}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <h2 style={styles.titulo}>Acceso restringido</h2>
        <p style={{ color: 'var(--texto-secundario)' }}>Esta sección es solo para administradores.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>PANEL ADMIN</h1>

      {mensaje && (
        <div style={styles.mensajeBox}>{mensaje}</div>
      )}

      {/* Acciones */}
      <div style={styles.accionesGrid}>
        <div style={styles.accionCard}>
          <div style={styles.accionIcono}>🔄</div>
          <div style={styles.accionTitulo}>Sincronizar resultados</div>
          <div style={styles.accionDesc}>
            Trae los resultados de partidos terminados desde API-Football y los guarda en la base de datos.
          </div>
          <button
            style={styles.btnAccion}
            onClick={sincronizarResultados}
            disabled={sincronizando}
          >
            {sincronizando ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>

        <div style={styles.accionCard}>
          <div style={styles.accionIcono}>🏆</div>
          <div style={styles.accionTitulo}>Recalcular puntos</div>
          <div style={styles.accionDesc}>
            Compara todas las predicciones con los resultados reales y actualiza los puntos de cada jugador.
          </div>
          <button
            style={styles.btnAccion}
            onClick={recalcularPuntos}
            disabled={sincronizando}
          >
            {sincronizando ? 'Calculando...' : 'Recalcular puntos'}
          </button>
        </div>
      </div>

      {/* Tabla de partidos */}
      <h2 style={{ ...styles.titulo, marginBottom: 12, marginTop: 24 }}>PARTIDOS ({partidos.length})</h2>
      <div style={styles.tablaWrapper}>
        <table style={styles.tabla}>
          <thead>
            <tr>
              {['Local', 'Visitante', 'Fecha', 'Estado', 'Resultado'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partidos.map(p => (
              <tr key={p._id} style={styles.tr}>
                <td style={styles.td}>{p.local}</td>
                <td style={styles.td}>{p.visitante}</td>
                <td style={styles.td}>{new Date(p.fecha).toLocaleDateString('es-AR')}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.estadoBadge,
                    background: p.estado === 'FT' ? '#dcfce7' : p.estado === 'NS' ? '#f1f5f9' : '#fef3c7',
                    color: p.estado === 'FT' ? '#166534' : p.estado === 'NS' ? '#475569' : '#92400e',
                  }}>
                    {p.estado === 'FT' ? 'Terminado' : p.estado === 'NS' ? 'Pendiente' : 'En juego'}
                  </span>
                </td>
                <td style={styles.td}>
                  {p.estado === 'FT' ? `${p.golesLocal} - ${p.golesVisitante}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  centrado: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '50vh', textAlign: 'center',
  },
  titulo: { fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 1 },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2, marginBottom: 20 },
  mensajeBox: {
    background: '#dcfce7', color: '#166534', border: '1px solid #86efac',
    borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 14,
  },
  accionesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 },
  accionCard: {
    background: 'var(--blanco)', border: '1px solid var(--borde)', borderRadius: 16,
    padding: '20px', display: 'flex', flexDirection: 'column', gap: 8,
  },
  accionIcono: { fontSize: 32 },
  accionTitulo: { fontWeight: 600, fontSize: 15 },
  accionDesc: { fontSize: 13, color: 'var(--texto-secundario)', lineHeight: 1.6, flex: 1 },
  btnAccion: {
    background: 'var(--gris-oscuro)', color: 'var(--blanco)', border: 'none',
    padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    marginTop: 4,
  },
  tablaWrapper: { overflowX: 'auto', borderRadius: 12, border: '1px solid var(--borde)' },
  tabla: { width: '100%', borderCollapse: 'collapse', background: 'var(--blanco)', fontSize: 14 },
  th: {
    padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12,
    color: 'var(--texto-secundario)', background: 'var(--gris-suave)',
    borderBottom: '1px solid var(--borde)', textTransform: 'uppercase', letterSpacing: 1,
  },
  tr: { borderBottom: '1px solid var(--borde)' },
  td: { padding: '10px 14px', color: 'var(--texto-principal)' },
  estadoBadge: { fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600 },
}
