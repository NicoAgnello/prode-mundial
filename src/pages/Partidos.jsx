import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePartidos, useMisPredicciones } from "../hooks/useProde";

const esArgentina = (p) =>
  p.local === "Argentina" || p.visitante === "Argentina";

function CardPartido({ partido, prediccion, onGuardar, puedeProde }) {
  const [local, setLocal] = useState(prediccion?.golesLocal ?? 0);
  const [visitante, setVisitante] = useState(prediccion?.golesVisitante ?? 0);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const yaJugo =
    partido.estado === "FT" ||
    partido.estado === "AET" ||
    partido.estado === "PEN";
  const enJuego = ["1H", "2H", "HT", "ET", "BT"].includes(partido.estado);
  const esArg = esArgentina(partido);

  const handleGuardar = async () => {
    setGuardando(true);
    await onGuardar(partido._id, parseInt(local), parseInt(visitante));
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const badgePuntos = () => {
    if (prediccion?.puntos === 3)
      return (
        <span
          style={{ ...styles.badge, background: "#dcfce7", color: "#166534" }}
        >
          ⭐ 3 pts
        </span>
      );
    if (prediccion?.puntos === 1)
      return (
        <span
          style={{ ...styles.badge, background: "#dbeafe", color: "#1e40af" }}
        >
          ✓ 1 pt
        </span>
      );
    if (prediccion?.puntos === 0)
      return (
        <span
          style={{ ...styles.badge, background: "#f1f5f9", color: "#64748b" }}
        >
          0 pts
        </span>
      );
    return null;
  };

  return (
    <div style={{ ...styles.card, ...(esArg ? styles.cardArgentina : {}) }}>
      {esArg && <div style={styles.argBadge}>🇦🇷 Argentina</div>}

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
            style={styles.bandera}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://flagcdn.com/w80/un.png";
            }}
          />
          <span style={styles.nombreEquipo}>{partido.local}</span>
        </div>

        <div style={styles.marcadorArea}>
          {yaJugo || enJuego ? (
            <div style={styles.resultado}>
              <span style={styles.gol}>{partido.golesLocal ?? "-"}</span>
              <span style={styles.guion}>-</span>
              <span style={styles.gol}>{partido.golesVisitante ?? "-"}</span>
            </div>
          ) : (
            <span style={styles.vs}>VS</span>
          )}
        </div>

        <div style={{ ...styles.equipo, alignItems: "flex-end" }}>
          <img
            src={partido.banderaVisitante}
            alt={partido.visitante}
            style={styles.bandera}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://flagcdn.com/w80/un.png";
            }}
          />
          <span style={styles.nombreEquipo}>{partido.visitante}</span>
        </div>
      </div>

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
                No cargaste prode
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
              />
              <span style={styles.guionInput}>-</span>
              <input
                type="number"
                min="0"
                max="20"
                value={visitante}
                onChange={(e) => setVisitante(e.target.value)}
                style={styles.inputGol}
              />
              <button
                onClick={handleGuardar}
                disabled={guardando}
                style={{
                  ...styles.btnGuardar,
                  ...(guardado ? styles.btnGuardado : {}),
                }}
              >
                {guardando
                  ? "..."
                  : guardado
                    ? "✓"
                    : prediccion
                      ? "Actualizar"
                      : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <span style={{ color: "var(--texto-secundario)", fontSize: 13 }}>
            Iniciá sesión para pronosticar
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
  const [grupo, setGrupo] = useState("todos");

  const grupos = [
    "todos",
    ...new Set(partidos.map((p) => p.grupo).filter(Boolean)),
  ];

  const partidosFiltrados = partidos.filter((p) => {
    const matchFiltro =
      filtro === "todos" ||
      (filtro === "proximos" && p.estado === "NS") ||
      (filtro === "jugados" && (p.estado === "FT" || p.estado === "AET")) ||
      (filtro === "en-vivo" && ["1H", "2H", "HT"].includes(p.estado)) ||
      (filtro === "argentina" && esArgentina(p));
    const matchGrupo = grupo === "todos" || p.grupo === grupo;
    return matchFiltro && matchGrupo;
  });

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>PARTIDOS</h1>
        <div style={styles.filtros}>
          {[
            { key: "todos", label: "Todos" },
            { key: "proximos", label: "Próximos" },
            { key: "en-vivo", label: "● Vivo" },
            { key: "jugados", label: "Jugados" },
            { key: "argentina", label: "🇦🇷 Argentina" },
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

      {grupos.length > 2 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {grupos.map((g) => (
            <button
              key={g}
              onClick={() => setGrupo(g)}
              style={{
                ...styles.filtroBtn,
                fontSize: 12,
                padding: "4px 10px",
                ...(grupo === g ? styles.filtroBtnActive : {}),
              }}
            >
              {g === "todos" ? "Todos los grupos" : g}
            </button>
          ))}
        </div>
      )}

      {cargando ? (
        <div style={styles.lista}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 120, borderRadius: 12 }}
            />
          ))}
        </div>
      ) : partidosFiltrados.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "var(--texto-secundario)",
          }}
        >
          No hay partidos en esta categoría
        </div>
      ) : (
        <div style={styles.lista}>
          {partidosFiltrados.map((partido) => (
            <CardPartido
              key={partido._id}
              partido={partido}
              prediccion={predicciones.find(
                (p) =>
                  p.partidoId === partido._id?.toString() ||
                  p.partidoId === partido._id,
              )}
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
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
    border: "1.5px solid #1a1a2e",
    color: "var(--texto-secundario)",
    padding: "6px 12px",
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
  lista: { display: "flex", flexDirection: "column", gap: 10 },
  card: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "14px 16px",
  },
  cardArgentina: {
    borderLeft: "4px solid var(--oro)",
    background: "#fffef5",
  },
  argBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: "#92400e",
    background: "#fef3c7",
    padding: "2px 8px",
    borderRadius: 6,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
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
    marginBottom: 12,
  },
  equipo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  bandera: {
    width: 40,
    height: 28,
    objectFit: "cover",
    borderRadius: 3,
    border: "1px solid var(--borde)",
  },
  nombreEquipo: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--texto-principal)",
    lineHeight: 1.2,
  },
  marcadorArea: { textAlign: "center" },
  resultado: { display: "flex", alignItems: "center", gap: 4 },
  gol: {
    fontFamily: "var(--font-display)",
    fontSize: 30,
    color: "var(--texto-principal)",
    minWidth: 24,
    textAlign: "center",
  },
  guion: {
    fontFamily: "var(--font-display)",
    fontSize: 24,
    color: "var(--texto-secundario)",
  },
  vs: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    color: "var(--texto-secundario)",
    letterSpacing: 2,
  },
  pronostico: { borderTop: "1px solid var(--borde)", paddingTop: 10 },
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
    border: "1.5px solid var(--borde)",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  guionInput: { fontSize: 18, color: "var(--texto-secundario)" },
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
  btnGuardado: { background: "#22c55e" },
  badge: { fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 600 },
};
