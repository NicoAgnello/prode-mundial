import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePartidos, useMisPredicciones } from "../hooks/useProde";

const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function MiProde() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { partidos, cargando: cargandoPartidos } = usePartidos();
  const { predicciones, cargando: cargandoPreds, guardar } = useMisPredicciones();
  const [grupoActivo, setGrupoActivo] = useState("A");
  const [prodesLocal, setProdesLocal] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  // Inicializar inputs desde predicciones existentes
  useEffect(() => {
    if (predicciones.length === 0) return;
    const init = {};
    predicciones.forEach((p) => {
      const id = p.partidoId?.toString();
      if (id) init[id] = { local: p.golesLocal ?? 0, visitante: p.golesVisitante ?? 0 };
    });
    setProdesLocal((prev) => ({ ...init, ...prev }));
  }, [predicciones]);

  if (!isAuthenticated) {
    return (
      <div style={styles.centrado}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={styles.tituloAcceso}>Tenés que iniciar sesión</h2>
        <p style={{ color: "var(--texto-secundario)", marginBottom: 20 }}>
          Para cargar tus prodes necesitás estar logueado.
        </p>
        <button style={styles.btnLogin} onClick={() => loginWithRedirect()}>
          Entrar al prode
        </button>
      </div>
    );
  }

  const gruposDisponibles = [
    ...new Set(
      partidos
        .map((p) => (p.grupo || "").replace("Grupo ", ""))
        .filter((g) => LETRAS.includes(g))
    ),
  ].sort();
  const grupos = gruposDisponibles.length > 0 ? gruposDisponibles : LETRAS;

  const grupoKey = `Grupo ${grupoActivo}`;
  const partidosGrupo = partidos
    .filter((p) => p.grupo === grupoKey || p.ronda === grupoKey)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const setGol = (partidoId, lado, valor) => {
    const id = partidoId.toString();
    const n = parseInt(valor);
    const goles = isNaN(n) ? 0 : Math.max(0, Math.min(20, n));
    setProdesLocal((prev) => ({
      ...prev,
      [id]: { ...prev[id], [lado]: goles },
    }));
    setGuardado(false);
  };

  const guardarGrupo = async () => {
    setGuardando(true);
    setError("");
    try {
      const resultados = await Promise.all(
        partidosGrupo
          .filter((p) => p.estado === "NS" && new Date(p.fecha) > new Date())
          .map((p) => {
            const id = p._id.toString();
            const pred = prodesLocal[id] ?? { local: 0, visitante: 0 };
            return guardar(id, pred.local, pred.visitante);
          })
      );
      const errores = resultados.filter((r) => r?.error);
      if (errores.length > 0) {
        setError(errores[0].error);
      } else {
        setGuardado(true);
        setTimeout(() => setGuardado(false), 3000);
      }
    } catch {
      setError("Error al guardar, intentá de nuevo");
    } finally {
      setGuardando(false);
    }
  };

  const cargando = cargandoPartidos || cargandoPreds;

  // Resumen de puntos del usuario
  const totalPuntos = predicciones.reduce((acc, p) => acc + (p.puntos || 0), 0);
  const exactos = predicciones.filter((p) => p.puntos === 3).length;
  const ganadores = predicciones.filter((p) => p.puntos === 1).length;
  const cargados = predicciones.length;

  return (
    <div>
      <h1 style={styles.titulo}>MI PRODE</h1>
      <p style={styles.subtitulo}>Se cierra cuando empieza cada partido</p>

      {/* Resumen */}
      <div style={styles.resumenGrid}>
        {[
          { num: totalPuntos, label: "Puntos totales", color: "var(--celeste-dark)" },
          { num: exactos, label: "Exactos", color: "#22c55e" },
          { num: ganadores, label: "Ganadores", color: "var(--celeste-dark)" },
          { num: cargados, label: "Prodes cargados", color: "var(--texto-principal)" },
        ].map((item) => (
          <div key={item.label} style={styles.resumenCard}>
            <div style={{ ...styles.resumenNum, color: item.color }}>{item.num}</div>
            <div style={styles.resumenLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Selector de grupo */}
      <div style={styles.grupoSelector}>
        {grupos.map((g) => (
          <button
            key={g}
            onClick={() => { setGrupoActivo(g); setGuardado(false); setError(""); }}
            style={{ ...styles.grupoBtn, ...(grupoActivo === g ? styles.grupoBtnActivo : {}) }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Card del grupo */}
      <div style={styles.grupoCard}>
        <div style={styles.grupoCardHeader}>
          <span style={styles.grupoLabel}>GRUPO {grupoActivo}</span>
          {guardado && (
            <span style={styles.badgeGuardado}>✓ Guardado</span>
          )}
        </div>

        {cargando ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />
            ))}
          </div>
        ) : partidosGrupo.length === 0 ? (
          <div style={styles.vacio}>
            Los partidos de este grupo aún no están cargados
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {partidosGrupo.map((partido, i) => {
              const id = partido._id.toString();
              const pred = prodesLocal[id] ?? { local: 0, visitante: 0 };
              const predExistente = predicciones.find(
                (p) => p.partidoId?.toString() === id
              );
              const yaJugo = ["FT", "AET", "PEN"].includes(partido.estado);
              const enJuego = ["1H", "2H", "HT", "ET", "BT"].includes(partido.estado);
              const bloqueado = yaJugo || enJuego || new Date(partido.fecha) <= new Date();

              return (
                <div key={id}>
                  {i > 0 && <div style={styles.divisor} />}
                  <div style={styles.filaPartido}>
                    {/* Equipo local */}
                    <div style={styles.equipoLocal}>
                      {partido.banderaLocal && (
                        <img src={partido.banderaLocal} alt={partido.local}
                          style={styles.bandera}
                          onError={(e) => { e.target.style.display = "none"; }} />
                      )}
                      <span style={styles.nombreEquipo}>{partido.local}</span>
                    </div>

                    {/* Centro: inputs o resultado */}
                    <div style={styles.centro}>
                      {yaJugo ? (
                        <div style={styles.resultadoArea}>
                          <span style={styles.resultadoReal}>
                            {partido.golesLocal} - {partido.golesVisitante}
                          </span>
                          {predExistente && (
                            <span className={`badge-puntos ${
                              predExistente.puntos === 3 ? "badge-exacto"
                              : predExistente.puntos === 1 ? "badge-ganador"
                              : "badge-error"
                            }`}>
                              {predExistente.puntos === 3 ? "⭐ 3"
                                : predExistente.puntos === 1 ? "✓ 1"
                                : predExistente.puntos === 0 ? "0" : "—"}
                            </span>
                          )}
                        </div>
                      ) : bloqueado ? (
                        <div style={styles.bloqueadoArea}>
                          <span style={styles.bloqueadoText}>
                            {enJuego ? "● En juego" : "Cerrado"}
                          </span>
                          {predExistente && (
                            <span style={styles.predCargada}>
                              {predExistente.golesLocal} - {predExistente.golesVisitante}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={styles.inputsArea}>
                          <input
                            type="number" min="0" max="20"
                            value={pred.local}
                            onChange={(e) => setGol(id, "local", e.target.value)}
                            style={styles.inputGol}
                          />
                          <span style={styles.guion}>-</span>
                          <input
                            type="number" min="0" max="20"
                            value={pred.visitante}
                            onChange={(e) => setGol(id, "visitante", e.target.value)}
                            style={styles.inputGol}
                          />
                        </div>
                      )}
                    </div>

                    {/* Equipo visitante */}
                    <div style={styles.equipoVisitante}>
                      <span style={styles.nombreEquipo}>{partido.visitante}</span>
                      {partido.banderaVisitante && (
                        <img src={partido.banderaVisitante} alt={partido.visitante}
                          style={styles.bandera}
                          onError={(e) => { e.target.style.display = "none"; }} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer del card */}
        {!cargando && partidosGrupo.some(
          (p) => p.estado === "NS" && new Date(p.fecha) > new Date()
        ) && (
          <div style={styles.cardFooter}>
            {error && <span style={styles.errorText}>⚠ {error}</span>}
            <button
              style={{ ...styles.btnActualizar, ...(guardando ? styles.btnGuardando : {}) }}
              onClick={guardarGrupo}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : `Actualizar Grupo ${grupoActivo}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  centrado: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "50vh", textAlign: "center",
  },
  tituloAcceso: { fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: 1 },
  btnLogin: {
    background: "var(--celeste)", color: "var(--blanco)", border: "none",
    padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer",
  },
  titulo: { fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 2, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: "var(--texto-secundario)", marginBottom: 20 },
  resumenGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: 10, marginBottom: 20,
  },
  resumenCard: {
    background: "var(--blanco)", border: "1px solid var(--borde)",
    borderRadius: 10, padding: "12px", textAlign: "center",
  },
  resumenNum: {
    fontFamily: "var(--font-display)", fontSize: 32, lineHeight: 1,
  },
  resumenLabel: { fontSize: 11, color: "var(--texto-secundario)", marginTop: 4 },
  grupoSelector: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  grupoBtn: {
    width: 36, height: 36, borderRadius: "50%", border: "1.5px solid var(--borde)",
    background: "var(--blanco)", color: "var(--texto-secundario)", fontSize: 13,
    fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", transition: "all 0.15s",
  },
  grupoBtnActivo: {
    background: "var(--gris-oscuro)", borderColor: "var(--gris-oscuro)", color: "var(--blanco)",
  },
  grupoCard: {
    background: "var(--blanco)", border: "1px solid var(--borde)",
    borderRadius: 12, padding: "16px 20px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  grupoCardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
  },
  grupoLabel: {
    fontSize: 11, fontWeight: 700, color: "var(--texto-secundario)",
    letterSpacing: 1.5, textTransform: "uppercase",
  },
  badgeGuardado: {
    fontSize: 12, fontWeight: 600, color: "#166534",
    background: "#dcfce7", padding: "3px 10px", borderRadius: 99,
  },
  divisor: { height: 1, background: "var(--borde)", margin: "0 -4px" },
  filaPartido: {
    display: "grid", gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center", gap: 8, padding: "10px 4px",
  },
  equipoLocal: { display: "flex", alignItems: "center", gap: 8 },
  equipoVisitante: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  bandera: {
    width: 28, height: 20, objectFit: "cover", borderRadius: 2,
    border: "1px solid var(--borde)", flexShrink: 0,
  },
  nombreEquipo: { fontSize: 14, fontWeight: 500, color: "var(--texto-principal)" },
  centro: { display: "flex", justifyContent: "center" },
  inputsArea: { display: "flex", alignItems: "center", gap: 6 },
  inputGol: {
    width: 44, height: 36, textAlign: "center",
    border: "1.5px solid var(--borde)", borderRadius: 8,
    fontSize: 16, fontWeight: 600, fontFamily: "var(--font-body)", outline: "none",
    background: "var(--blanco)",
  },
  guion: { fontSize: 18, color: "var(--texto-secundario)", fontWeight: 300 },
  resultadoArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  resultadoReal: {
    fontFamily: "var(--font-display)", fontSize: 22, color: "var(--texto-principal)",
  },
  bloqueadoArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  bloqueadoText: { fontSize: 11, color: "var(--texto-secundario)", fontStyle: "italic" },
  predCargada: {
    fontFamily: "var(--font-display)", fontSize: 18, color: "var(--celeste-dark)",
  },
  cardFooter: {
    display: "flex", alignItems: "center", justifyContent: "flex-end",
    gap: 12, marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--borde)",
    flexWrap: "wrap",
  },
  errorText: { fontSize: 13, color: "#ef4444", flex: 1 },
  btnActualizar: {
    background: "var(--celeste)", color: "var(--blanco)", border: "none",
    padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "var(--font-body)", transition: "opacity 0.2s",
  },
  btnGuardando: { opacity: 0.6 },
  vacio: {
    textAlign: "center", padding: "32px 16px",
    color: "var(--texto-secundario)", fontSize: 14,
  },
};
