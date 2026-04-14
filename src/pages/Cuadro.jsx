import { useState, useEffect } from "react";

const FASES = ["16avos", "Octavos", "Cuartos", "Semis", "Final"];
const CRUCES_INICIALES = [
  { id: "r16_1", fase: "16avos", local: "1E", visitante: "3A/B/C/D/F" },
  { id: "r16_2", fase: "16avos", local: "1I", visitante: "3C/D/F/G/H" },
  { id: "r16_3", fase: "16avos", local: "2A", visitante: "2B" },
  { id: "r16_4", fase: "16avos", local: "1F", visitante: "2C" },
  { id: "r16_5", fase: "16avos", local: "2K", visitante: "2L" },
  { id: "r16_6", fase: "16avos", local: "1H", visitante: "2J" },
  { id: "r16_7", fase: "16avos", local: "1D", visitante: "3B/E/F/I/J" },
  { id: "r16_8", fase: "16avos", local: "1G", visitante: "3A/E/H/I/J" },
  { id: "r16_9", fase: "16avos", local: "1C", visitante: "2F" },
  { id: "r16_10", fase: "16avos", local: "2E", visitante: "2I" },
  { id: "r16_11", fase: "16avos", local: "1A", visitante: "3C/E/F/H/I" },
  { id: "r16_12", fase: "16avos", local: "1L", visitante: "3E/H/I/J/K" },
  { id: "r16_13", fase: "16avos", local: "1J", visitante: "2H" },
  { id: "r16_14", fase: "16avos", local: "2D", visitante: "2G" },
  { id: "r16_15", fase: "16avos", local: "1B", visitante: "3E/F/G/I/J" },
  { id: "r16_16", fase: "16avos", local: "1K", visitante: "3D/E/I/J/L" },
];

function TarjetaCruce({ cruce }) {
  const esArgentina =
    cruce.local === "Argentina" || cruce.visitante === "Argentina";

  return (
    <div
      style={{
        ...styles.cruce,
        ...(esArgentina ? styles.cruceArgentina : {}),
        ...(cruce.definido ? {} : styles.crucePendiente),
      }}
    >
      <div style={styles.equipo}>
        {cruce.banderaLocal && (
          <img
            src={cruce.banderaLocal}
            alt={cruce.local}
            style={styles.banderita}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <span
          style={{
            ...styles.nombreEquipo,
            ...(cruce.definido ? {} : styles.nombrePendiente),
          }}
        >
          {cruce.local}
        </span>
        {cruce.golesLocal !== null && cruce.golesLocal !== undefined && (
          <span style={styles.gol}>{cruce.golesLocal}</span>
        )}
      </div>
      <div style={styles.separador}>-</div>
      <div style={{ ...styles.equipo, justifyContent: "flex-end" }}>
        {cruce.golesVisitante !== null &&
          cruce.golesVisitante !== undefined && (
            <span style={styles.gol}>{cruce.golesVisitante}</span>
          )}
        <span
          style={{
            ...styles.nombreEquipo,
            ...(cruce.definido ? {} : styles.nombrePendiente),
            textAlign: "right",
          }}
        >
          {cruce.visitante}
        </span>
        {cruce.banderaVisitante && (
          <img
            src={cruce.banderaVisitante}
            alt={cruce.visitante}
            style={styles.banderita}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
      {cruce.estado === "FT" && <div style={styles.cruceTerminado}>FIN</div>}
    </div>
  );
}

export default function Cuadro() {
  const [partidos, setPartidos] = useState([]);
  const [faseActiva, setFaseActiva] = useState("16avos");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/partidos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPartidos(data);
      })
      .finally(() => setCargando(false));
  }, []);

  // Separar partidos por fase
  const gruposPartidos = partidos.filter(
    (p) => p.grupo?.startsWith("Grupo") || p.ronda?.startsWith("Grupo"),
  );
  const eliminatoriaPartidos = partidos.filter(
    (p) => !p.grupo?.startsWith("Grupo") && !p.ronda?.startsWith("Grupo"),
  );

  // Armar cruces de eliminatorias desde la DB o usar los predefinidos
  const crucesEliminatorias =
    eliminatoriaPartidos.length > 0
      ? eliminatoriaPartidos.map((p) => ({
          id: p._id,
          fase: p.ronda || p.grupo,
          local: p.local,
          visitante: p.visitante,
          banderaLocal: p.banderaLocal,
          banderaVisitante: p.banderaVisitante,
          golesLocal: p.golesLocal,
          golesVisitante: p.golesVisitante,
          estado: p.estado,
          definido: true,
        }))
      : CRUCES_INICIALES;
  const crucesPorFase = {
    "16avos": crucesEliminatorias.filter(
      (c) =>
        c.fase === "16avos" ||
        c.fase?.includes("Round of 32") ||
        c.fase?.includes("16"),
    ),
    Octavos: crucesEliminatorias.filter(
      (c) =>
        c.fase === "Octavos" ||
        c.fase?.includes("Octavo") ||
        c.fase?.includes("Round of 16"),
    ),
    Cuartos: crucesEliminatorias.filter(
      (c) => c.fase === "Cuartos" || c.fase?.includes("Quarter"),
    ),
    Semis: crucesEliminatorias.filter(
      (c) => c.fase === "Semis" || c.fase?.includes("Semi"),
    ),
    Final: crucesEliminatorias.filter((c) => c.fase === "Final"),
  };

  // Si no hay datos de la API para esa fase, mostrar los predefinidos
  if (crucesPorFase["16avos"].length === 0) {
    crucesPorFase["16avos"] = CRUCES_INICIALES;
  }

  const fasesVacias = ["Octavos", "Cuartos", "Semis", "Final"];
  fasesVacias.forEach((fase) => {
    if (crucesPorFase[fase].length === 0) {
      const cantidad =
        fase === "Octavos"
          ? 8
          : fase === "Cuartos"
            ? 4
            : fase === "Semis"
              ? 2
              : 1;
      crucesPorFase[fase] = Array.from({ length: cantidad }, (_, i) => ({
        id: `${fase}_${i}`,
        fase,
        local: "Por definir",
        visitante: "Por definir",
        definido: false,
      }));
    }
  });

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.titulo}>CRUCES</h1>
        <span style={styles.sub}>Fase eliminatoria del Mundial 2026</span>
      </div>

      {/* Info grupos */}
      <div style={styles.infoBox}>
        <span style={{ fontSize: 16 }}>⚽</span>
        <span>
          <strong>Fase de grupos en curso</strong> — los cruces de 16avos se
          confirman cuando terminen los grupos. La gente ya puede predecir los
          partidos de grupos en la sección{" "}
          <a href="/partidos" style={{ color: "var(--celeste)" }}>
            Partidos
          </a>
          .
        </span>
      </div>

      {/* Tabs de fases */}
      <div style={styles.tabs}>
        {FASES.map((fase) => (
          <button
            key={fase}
            onClick={() => setFaseActiva(fase)}
            style={{
              ...styles.tab,
              ...(faseActiva === fase ? styles.tabActivo : {}),
            }}
          >
            {fase}
            {crucesPorFase[fase]?.some((c) => c.definido) && (
              <span style={styles.tabDot} />
            )}
          </button>
        ))}
      </div>

      {/* Cruces de la fase activa */}
      {cargando ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 72, borderRadius: 12 }}
            />
          ))}
        </div>
      ) : (
        <div style={styles.crucesLista}>
          {(crucesPorFase[faseActiva] || []).map((cruce, i) => (
            <TarjetaCruce key={cruce.id || i} cruce={cruce} />
          ))}
        </div>
      )}

      {/* Leyenda */}
      <div style={styles.leyenda}>
        <span style={styles.leyendaItem}>
          <span style={{ ...styles.leyendaDot, background: "var(--oro)" }} />{" "}
          Argentina
        </span>
        <span style={styles.leyendaItem}>
          <span style={{ ...styles.leyendaDot, background: "#e2e8f0" }} /> Por
          definir
        </span>
        <span style={styles.leyendaItem}>
          <span style={{ ...styles.leyendaDot, background: "#dcfce7" }} />{" "}
          Terminado
        </span>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: 8 },
  titulo: { fontFamily: "var(--font-display)", fontSize: 36, letterSpacing: 2 },
  sub: { color: "var(--texto-secundario)", fontSize: 14 },
  infoBox: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "var(--celeste-light)",
    border: "1px solid var(--celeste)",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 20,
    fontSize: 14,
    color: "var(--texto-principal)",
    lineHeight: 1.5,
  },
  tabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  tab: {
    background: "var(--blanco)",
    border: "1.5px solid #1a1a2e",
    color: "var(--texto-secundario)",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  tabActivo: {
    background: "var(--celeste)",
    borderColor: "var(--celeste)",
    color: "var(--blanco)",
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
  },
  crucesLista: { display: "flex", flexDirection: "column", gap: 8 },
  cruce: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  cruceArgentina: {
    borderLeft: "4px solid var(--oro)",
    background: "#fffef5",
  },
  crucePendiente: {
    background: "#f8fafc",
    borderStyle: "dashed",
  },
  equipo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  banderita: {
    width: 28,
    height: 20,
    objectFit: "cover",
    borderRadius: 2,
    border: "1px solid var(--borde)",
    flexShrink: 0,
  },
  nombreEquipo: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--texto-principal)",
  },
  nombrePendiente: {
    color: "var(--texto-secundario)",
    fontWeight: 400,
    fontStyle: "italic",
  },
  gol: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    color: "var(--texto-principal)",
    minWidth: 20,
    textAlign: "center",
  },
  separador: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    color: "var(--texto-secundario)",
    flexShrink: 0,
  },
  cruceTerminado: {
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 10,
    fontWeight: 700,
    color: "#166534",
    background: "#dcfce7",
    padding: "1px 6px",
    borderRadius: 4,
  },
  leyenda: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 20,
    padding: "12px 0",
    borderTop: "1px solid var(--borde)",
  },
  leyendaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--texto-secundario)",
  },
  leyendaDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    display: "inline-block",
  },
};
