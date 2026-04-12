import { useAuth0 } from '@auth0/auth0-react'
import { useRanking } from '../hooks/useProde'

const medallas = ['🥇', '🥈', '🥉']

export default function Ranking() {
  const { user } = useAuth0()
  const { ranking, cargando } = useRanking()

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.titulo}>RANKING</h1>
        <span style={styles.sub}>{ranking.length} participantes</span>
      </div>

      {cargando ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <div style={styles.lista}>
          {ranking.map((jugador, idx) => {
            const esYo = jugador.userId === user?.sub
            return (
              <div
                key={jugador.userId}
                style={{
                  ...styles.fila,
                  ...(esYo ? styles.filaPropia : {}),
                  ...(idx < 3 ? styles.filaPodio : {}),
                }}
              >
                <div style={styles.posicion}>
                  {idx < 3 ? (
                    <span style={{ fontSize: 22 }}>{medallas[idx]}</span>
                  ) : (
                    <span style={styles.numPos}>{idx + 1}</span>
                  )}
                </div>

                <img
                  src={jugador.foto || `https://api.dicebear.com/7.x/initials/svg?seed=${jugador.nombre}`}
                  alt={jugador.nombre}
                  style={styles.avatar}
                />

                <div style={styles.info}>
                  <div style={styles.nombre}>
                    {jugador.nombre}
                    {esYo && <span style={styles.badgeYo}>vos</span>}
                  </div>
                  <div style={styles.stats}>
                    <span>{jugador.exactos} exactos · {jugador.ganadores} ganadores</span>
                  </div>
                </div>

                <div style={styles.puntos}>
                  <span style={styles.numPuntos}>{jugador.puntos}</span>
                  <span style={styles.labelPts}>pts</span>
                </div>
              </div>
            )
          })}

          {ranking.length === 0 && (
            <div style={styles.vacio}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <div style={{ fontWeight: 600 }}>Todavía no hay predicciones</div>
              <div style={{ color: 'var(--texto-secundario)', fontSize: 14, marginTop: 4 }}>
                Cuando empiece el Mundial el ranking se va a ir actualizando
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 20,
  },
  titulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    letterSpacing: 2,
  },
  sub: { color: 'var(--texto-secundario)', fontSize: 14 },
  lista: { display: 'flex', flexDirection: 'column', gap: 8 },
  fila: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--blanco)',
    border: '1px solid var(--borde)',
    borderRadius: 12,
    padding: '12px 16px',
    transition: 'box-shadow 0.2s',
  },
  filaPodio: {
    borderLeft: '3px solid var(--oro)',
  },
  filaPropia: {
    background: 'var(--celeste-light)',
    borderColor: 'var(--celeste)',
  },
  posicion: {
    width: 36,
    textAlign: 'center',
  },
  numPos: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    color: 'var(--texto-secundario)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--borde)',
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  nombre: {
    fontWeight: 600,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badgeYo: {
    background: 'var(--celeste)',
    color: 'var(--blanco)',
    fontSize: 10,
    padding: '1px 7px',
    borderRadius: 99,
    fontWeight: 600,
    letterSpacing: 1,
  },
  stats: { fontSize: 12, color: 'var(--texto-secundario)', marginTop: 2 },
  puntos: { textAlign: 'right', flexShrink: 0 },
  numPuntos: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    color: 'var(--celeste-dark)',
    display: 'block',
    lineHeight: 1,
  },
  labelPts: { fontSize: 11, color: 'var(--texto-secundario)' },
  vacio: {
    textAlign: 'center',
    padding: '48px 20px',
    background: 'var(--blanco)',
    borderRadius: 16,
    border: '1px solid var(--borde)',
  },
}
