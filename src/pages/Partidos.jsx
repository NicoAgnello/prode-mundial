import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePartidos, useMisPredicciones } from "../hooks/useProde";

function CardPartido({ partido, prediccion, onGuardar, puedeProde }) {
  const [local, setLocal] = useState(prediccion?.golesLocal ?? "");
  const [visitante, setVisitante] = useState(prediccion?.golesVisitante ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const yaJugo = partido.estado === "FT";
  const enJuego =
    partido.estado === "1H" ||
    partido.estado === "2H" ||
    partido.estado === "HT";

  const handleGuardar = async () => {
    if (local === "" || visitante === "") return;
    setGuardando(true);
    await onGuardar(partido._id, parseInt(local), parseInt(visitante));
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const badgePuntos = () => {
    if (!prediccion?.puntos && prediccion?.puntos !== 0) return null;
    if (prediccion.puntos === 3)
      return <span className="badge-puntos badge-exacto">⭐ 3 pts</span>;
    if (prediccion.puntos === 1)
      return <span className="badge-puntos badge-ganador">✓ 1 pt</span>;
    return <span className="badge-puntos badge-error">0 pts</span>;
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.grupo}>{partido.grupo || partido.ronda}</span>
        <span style={styles.fecha}>
          {new Date(partido.fecha).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {enJuego && <span style={styles.badgeLive}>● EN VIVO</span>}
      </div>

      <div style={styles.equipos}>
        <div style={styles.equipo}>
          <img
            src={partido.banderaLocal}
            alt={partido.local}
            style={{ width: 36, height: 36, objectFit: "contain" }}
            onError={(e) => (e.target.style.display = "none")}
          />
          <span style={styles.nombreEquipo}>{partido.local}</span>
        </div>

        <div style={styles.marcadorArea}>
          {yaJugo || enJuego ? (
            <div style={styles.resultado}>
              <span style={styles.gol}>{partido.golesLocal}</span>
              <span style={styles.guion}>-</span>
              <span style={styles.gol}>{partido.golesVisitante}</span>
            </div>
          ) : (
            <span style={styles.vs}>VS</span>
          )}
        </div>

        <div style={{ ...styles.equipo, alignItems: "flex-end" }}>
          <img
            src={partido.banderaVisitante}
            alt={partido.visitante}
            style={{ width: 36, height: 36, objectFit: "contain" }}
            onError={(e) => (e.target.style.display = "none")}
          />
          <span style={styles.nombreEquipo}>{partido.visitante}</span>
        </div>
      </div>

      {/* Predicción */}
      <div style={styles.pronostico}>
        {yaJugo ? (
          <div style={styles.resultadoProde}>
            {prediccion ? (
              <>
                <span style={styles.prodeLabel}>
                  Tu prode: {prediccion.golesLocal} -{" "}
                  {prediccion.golesVisitante}
                </span>
                {badgePuntos()}
              </>
            ) : (
              <span style={{ color: "var(--texto-secundario)", fontSize: 13 }}>
                No cargaste prode para este partido
              </span>
            )}
          </div>
        ) : puedeProde ? (
          <div style={styles.inputArea}>
            <span style={styles.prodeLabel}>Tu pronóstico:</span>
            <div style={styles.inputRow}>
              <input
                type="number"
                min="0"
                max="20"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                style={styles.inputGol}
                placeholder="0"
              />
              <span style={styles.guionInput}>-</span>
              <input
                type="number"
                min="0"
                max="20"
                value={visitante}
                onChange={(e) => setVisitante(e.target.value)}
                style={styles.inputGol}
                placeholder="0"
              />
              <button
                onClick={handleGuardar}
                disabled={guardando || local === "" || visitante === ""}
                style={{
                  ...styles.btnGuardar,
                  ...(guardado ? styles.btnGuardado : {}),
                }}
              >
                {guardando
                  ? "..."
                  : guardado
                    ? "✓ Guardado"
                    : prediccion
                      ? "Actualizar"
                      : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <span style={{ color: "var(--texto-secundario)", fontSize: 13 }}>
            Iniciá sesión para cargar tu prode
          </span>
        )}
      </div>
    </div>
  );
}

export default function Partidos() {
  const { isAuthenticated, user } = useAuth0();
  const { partidos, cargando } = usePartidos();
  const { predicciones, guardar } = useMisPredicciones(user?.sub);
  const [filtro, setFiltro] = useState("todos");

  const partidosFiltrados = partidos.filter((p) => {
    if (filtro === "proximos") return p.estado === "NS";
    if (filtro === "jugados") return p.estado === "FT";
    if (filtro === "en-vivo") return ["1H", "2H", "HT"].includes(p.estado);
    return true;
  });

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>PARTIDOS</h1>
        <div style={styles.filtros}>
          {[
            { key: "todos", label: "Todos" },
            { key: "proximos", label: "Próximos" },
            { key: "en-vivo", label: "● En vivo" },
            { key: "jugados", label: "Jugados" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              style={{
                ...styles.filtroBtn,
                ...(filtro === f.key ? styles.filtroBtnActive : {}),
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div style={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 180, borderRadius: 12 }}
            />
          ))}
        </div>
      ) : (
        <div style={styles.grid}>
          {partidosFiltrados.map((partido) => (
            <CardPartido
              key={partido._id}
              partido={partido}
              prediccion={predicciones.find((p) => p.partidoId === partido._id)}
              onGuardar={guardar}
              puedeProde={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    letterSpacing: 2,
    color: "var(--texto-principal)",
  },
  filtros: { display: "flex", gap: 6, flexWrap: "wrap" },
  filtroBtn: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    color: "var(--texto-secundario)",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    transition: "all 0.2s",
  },
  filtroBtnActive: {
    background: "var(--celeste)",
    borderColor: "var(--celeste)",
    color: "var(--blanco)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },
  card: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: "var(--radio-lg)",
    padding: "16px",
    transition: "box-shadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  grupo: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--celeste-dark)",
    background: "var(--celeste-light)",
    padding: "2px 8px",
    borderRadius: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fecha: { fontSize: 12, color: "var(--texto-secundario)", flex: 1 },
  badgeLive: {
    fontSize: 11,
    fontWeight: 700,
    color: "#ef4444",
    animation: "pulse 1.5s infinite",
  },
  equipos: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  equipo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  bandera: { fontSize: 28 },
  nombreEquipo: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--texto-principal)",
  },
  marcadorArea: { textAlign: "center" },
  resultado: { display: "flex", alignItems: "center", gap: 4 },
  gol: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    color: "var(--texto-principal)",
    minWidth: 28,
    textAlign: "center",
  },
  guion: {
    fontFamily: "var(--font-display)",
    fontSize: 28,
    color: "var(--texto-secundario)",
  },
  vs: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    color: "var(--texto-secundario)",
    letterSpacing: 2,
  },
  pronostico: {
    borderTop: "1px solid var(--borde)",
    paddingTop: 12,
  },
  prodeLabel: {
    fontSize: 12,
    color: "var(--texto-secundario)",
    marginBottom: 6,
    display: "block",
  },
  resultadoProde: { display: "flex", alignItems: "center", gap: 8 },
  inputArea: {},
  inputRow: { display: "flex", alignItems: "center", gap: 6 },
  inputGol: {
    width: 44,
    height: 36,
    textAlign: "center",
    border: "1px solid var(--borde)",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  guionInput: { fontSize: 20, color: "var(--texto-secundario)" },
  btnGuardar: {
    background: "var(--celeste)",
    color: "var(--blanco)",
    border: "none",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: 4,
    transition: "all 0.2s",
  },
  btnGuardado: {
    background: "#22c55e",
  },
};
