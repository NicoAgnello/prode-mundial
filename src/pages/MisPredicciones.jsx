import { useAuth0 } from "@auth0/auth0-react";
import { useMisPredicciones } from "../hooks/useProde";

export default function MisPredicciones() {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const { predicciones, cargando } = useMisPredicciones(user?.sub);

  if (!isAuthenticated) {
    return (
      <div style={styles.centrado}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={styles.titulo}>Tenés que iniciar sesión</h2>
        <p style={{ color: "var(--texto-secundario)", marginBottom: 20 }}>
          Para ver tus predicciones necesitás estar logueado.
        </p>
        <button style={styles.btnLogin} onClick={() => loginWithRedirect()}>
          Entrar al prode
        </button>
      </div>
    );
  }

  const exactos = predicciones.filter((p) => p.puntos === 3).length;
  const ganadores = predicciones.filter((p) => p.puntos === 1).length;
  const totalPuntos = predicciones.reduce((acc, p) => acc + (p.puntos || 0), 0);

  return (
    <div>
      <h1 style={styles.pageTitle}>MIS PRODES</h1>

      {/* Resumen */}
      <div style={styles.resumenGrid}>
        <div style={styles.resumenCard}>
          <div style={styles.resumenNum}>{totalPuntos}</div>
          <div style={styles.resumenLabel}>Puntos totales</div>
        </div>
        <div style={styles.resumenCard}>
          <div style={{ ...styles.resumenNum, color: "#22c55e" }}>
            {exactos}
          </div>
          <div style={styles.resumenLabel}>Resultados exactos</div>
        </div>
        <div style={styles.resumenCard}>
          <div style={{ ...styles.resumenNum, color: "var(--celeste-dark)" }}>
            {ganadores}
          </div>
          <div style={styles.resumenLabel}>Ganadores acertados</div>
        </div>
        <div style={styles.resumenCard}>
          <div style={styles.resumenNum}>{predicciones.length}</div>
          <div style={styles.resumenLabel}>Prodes cargados</div>
        </div>
      </div>

      {/* Lista */}
      {cargando ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 72, borderRadius: 12 }}
            />
          ))}
        </div>
      ) : predicciones.length === 0 ? (
        <div style={styles.vacio}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <div style={{ fontWeight: 600 }}>
            No cargaste ningún prode todavía
          </div>
          <div
            style={{
              color: "var(--texto-secundario)",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Andá a la sección Partidos y empezá a pronosticar
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {predicciones.map((p) => (
            <div key={p._id} style={styles.filaPrediccion}>
              <div style={styles.filaInfo}>
                <div style={styles.filaPartido}>
                  <span style={styles.equipoNombre}>
                    {p.partido?.local ?? "?"}
                  </span>
                  <span style={styles.marcadorPrediccion}>
                    {p.golesLocal} - {p.golesVisitante}
                  </span>
                  <span style={styles.equipoNombre}>
                    {p.partido?.visitante ?? "?"}
                  </span>
                </div>
                <div style={styles.filaMeta}>
                  <span style={styles.grupoTag}>
                    {p.partido?.grupo || p.partido?.ronda || ""}
                  </span>
                  {p.partido?.fecha && (
                    <span
                      style={{ fontSize: 12, color: "var(--texto-secundario)" }}
                    >
                      {new Date(p.partido.fecha).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.resultadoFila}>
                {p.partido?.estado === "FT" ? (
                  <>
                    <span
                      style={{ fontSize: 12, color: "var(--texto-secundario)" }}
                    >
                      Real: {p.partido.golesLocal} - {p.partido.golesVisitante}
                    </span>
                    <span
                      className={`badge-puntos ${
                        p.puntos === 3
                          ? "badge-exacto"
                          : p.puntos === 1
                            ? "badge-ganador"
                            : "badge-error"
                      }`}
                    >
                      {p.puntos === 3
                        ? "⭐ 3 pts"
                        : p.puntos === 1
                          ? "✓ 1 pt"
                          : p.puntos === 0
                            ? "0 pts"
                            : "—"}
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--texto-secundario)",
                      fontStyle: "italic",
                    }}
                  >
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  centrado: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
    textAlign: "center",
  },
  titulo: { fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1 },
  btnLogin: {
    background: "var(--celeste)",
    color: "var(--blanco)",
    border: "none",
    padding: "12px 28px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    letterSpacing: 2,
    marginBottom: 20,
  },
  resumenGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  resumenCard: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "16px",
    textAlign: "center",
  },
  resumenNum: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    color: "var(--celeste-dark)",
    lineHeight: 1,
  },
  resumenLabel: {
    fontSize: 12,
    color: "var(--texto-secundario)",
    marginTop: 4,
  },
  vacio: {
    textAlign: "center",
    padding: "48px 20px",
    background: "var(--blanco)",
    borderRadius: 16,
    border: "1px solid var(--borde)",
  },
  filaPrediccion: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  equipoNombre: { fontWeight: 500, fontSize: 14 },
  marcadorPrediccion: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    color: "var(--celeste-dark)",
    background: "var(--celeste-light)",
    padding: "2px 12px",
    borderRadius: 8,
  },
  resultadoFila: { display: "flex", alignItems: "center", gap: 8 },
  filaInfo: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  filaPartido: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  filaMeta: { display: "flex", alignItems: "center", gap: 8 },
  grupoTag: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--celeste-dark)",
    background: "var(--celeste-light)",
    padding: "1px 6px",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
};
