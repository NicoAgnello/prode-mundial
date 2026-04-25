import { useState } from "react";
import { usePartidos, usePosiciones } from "../hooks/useProde";

const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const FASES_ELIM = ["16avos", "Octavos", "Cuartos", "Semis", "Final"];

function GrupoSelector({ grupos, activo, onSelect }) {
  return (
    <div style={styles.grupoSelector}>
      {grupos.map((g) => (
        <button
          key={g}
          onClick={() => onSelect(g)}
          style={{ ...styles.grupoBtn, ...(activo === g ? styles.grupoBtnActivo : {}) }}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

function FilaPartido({ partido }) {
  const yaJugo = ["FT", "AET", "PEN"].includes(partido.estado);
  const enJuego = ["1H", "2H", "HT", "ET", "BT"].includes(partido.estado);

  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
  const hora = new Date(partido.fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={styles.filaPartido}>
      <div style={styles.equipoLocal}>
        {partido.banderaLocal && (
          <img src={partido.banderaLocal} alt={partido.local} style={styles.bandera}
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <span style={styles.nombreEquipo}>{partido.local}</span>
      </div>

      <div style={styles.centroPartido}>
        {yaJugo || enJuego ? (
          <div style={styles.marcadorFinal}>
            <span>{partido.golesLocal ?? "-"}</span>
            <span style={{ color: "var(--texto-secundario)", margin: "0 4px" }}>-</span>
            <span>{partido.golesVisitante ?? "-"}</span>
          </div>
        ) : (
          <div style={styles.fechaHora}>
            <span style={styles.fechaTexto}>{fecha}</span>
            <span style={styles.horaTexto}>{hora}</span>
          </div>
        )}
        {enJuego && <span style={styles.badgeLive}>● EN VIVO</span>}
      </div>

      <div style={styles.equipoVisitante}>
        <span style={styles.nombreEquipo}>{partido.visitante}</span>
        {partido.banderaVisitante && (
          <img src={partido.banderaVisitante} alt={partido.visitante} style={styles.bandera}
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
      </div>
    </div>
  );
}

function TablaGrupo({ equipos }) {
  if (!equipos || equipos.length === 0) {
    return (
      <div style={styles.vacio}>
        Los partidos de este grupo aún no comenzaron
      </div>
    );
  }

  return (
    <div style={styles.tablaWrapper}>
      <table style={styles.tabla}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={{ ...styles.th, textAlign: "left" }}>Equipo</th>
            {["PJ", "G", "E", "P", "DG", "Pts"].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {equipos.map((eq, i) => (
            <tr key={eq.nombre} style={{ ...styles.tr, ...(i < 2 ? styles.trClasifica : {}) }}>
              <td style={{ ...styles.td, color: "var(--texto-secundario)", fontWeight: 600 }}>
                {i + 1}
              </td>
              <td style={styles.td}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {eq.bandera && (
                    <img src={eq.bandera} alt={eq.nombre} style={styles.banderaTabla}
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <span style={{ fontWeight: 500 }}>{eq.nombre}</span>
                </div>
              </td>
              {[eq.pj, eq.g, eq.e, eq.p, eq.dg, eq.pts].map((v, j) => (
                <td key={j} style={{
                  ...styles.td,
                  fontWeight: j === 5 ? 700 : 400,
                  color: j === 5 ? "var(--texto-principal)" : "var(--texto-secundario)",
                }}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Eliminatorias({ partidos }) {
  const [faseActiva, setFaseActiva] = useState("16avos");

  const porFase = {
    "16avos": partidos.filter(
      (p) => p.ronda?.includes("Round of 32") || p.grupo?.includes("Round of 32") || p.ronda?.includes("16avos")
    ),
    Octavos: partidos.filter(
      (p) => p.ronda?.includes("Round of 16") || p.grupo?.includes("Octavos")
    ),
    Cuartos: partidos.filter(
      (p) => p.ronda?.includes("Quarter") || p.grupo?.includes("Cuartos")
    ),
    Semis: partidos.filter(
      (p) => p.ronda?.includes("Semi") || p.grupo?.includes("Semis")
    ),
    Final: partidos.filter(
      (p) => p.ronda === "Final" || p.grupo === "Final"
    ),
  };

  const hayDatos = partidos.length > 0;

  return (
    <div>
      <div style={styles.faseTabs}>
        {FASES_ELIM.map((f) => (
          <button
            key={f}
            onClick={() => setFaseActiva(f)}
            style={{ ...styles.faseTab, ...(faseActiva === f ? styles.faseTabActivo : {}) }}
          >
            {f}
            {porFase[f]?.length > 0 && <span style={styles.faseDot} />}
          </button>
        ))}
      </div>

      {!hayDatos ? (
        <div style={styles.infoElim}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <span>Los cruces se confirman cuando terminen los grupos. Igual podés ver la estructura inicial.</span>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(porFase[faseActiva] ?? []).length === 0 ? (
          <div style={styles.vacio}>No hay partidos cargados para esta fase todavía</div>
        ) : (
          porFase[faseActiva].map((p) => (
            <div key={p._id} style={styles.cruceCard}>
              <div style={styles.cruceEquipo}>
                {p.banderaLocal && (
                  <img src={p.banderaLocal} alt={p.local} style={styles.banderaCruce}
                    onError={(e) => { e.target.style.display = "none"; }} />
                )}
                <span style={p.local === "Por definir" ? styles.pendiente : styles.cruceNombre}>
                  {p.local}
                </span>
              </div>
              <div style={styles.cruceMarcador}>
                {p.estado === "FT" ? (
                  <span style={styles.marcadorElim}>
                    {p.golesLocal} - {p.golesVisitante}
                  </span>
                ) : (
                  <span style={styles.cruceSep}>VS</span>
                )}
              </div>
              <div style={{ ...styles.cruceEquipo, justifyContent: "flex-end" }}>
                <span style={p.visitante === "Por definir" ? styles.pendiente : styles.cruceNombre}>
                  {p.visitante}
                </span>
                {p.banderaVisitante && (
                  <img src={p.banderaVisitante} alt={p.visitante} style={styles.banderaCruce}
                    onError={(e) => { e.target.style.display = "none"; }} />
                )}
              </div>
              {p.estado === "FT" && <div style={styles.finBadge}>FIN</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Fixture() {
  const { partidos, cargando } = usePartidos();
  const { posiciones, cargando: cargandoPos } = usePosiciones();
  const [tab, setTab] = useState("fixture");
  const [grupoActivo, setGrupoActivo] = useState("A");

  const gruposDisponibles = [
    ...new Set(
      partidos
        .map((p) => (p.grupo || p.ronda || "").replace("Grupo ", ""))
        .filter((g) => LETRAS.includes(g))
    ),
  ].sort();
  const grupos = gruposDisponibles.length > 0 ? gruposDisponibles : LETRAS;

  const grupoKey = `Grupo ${grupoActivo}`;
  const partidosGrupo = partidos
    .filter((p) => p.grupo === grupoKey || p.ronda === grupoKey)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const eliminatoriaPartidos = partidos.filter(
    (p) => !p.grupo?.startsWith("Grupo") && !p.ronda?.startsWith("Grupo")
  );

  return (
    <div>
      <h1 style={styles.titulo}>FIXTURE</h1>

      {/* Tabs principales */}
      <div style={styles.mainTabs}>
        {[
          { key: "fixture", label: "Fixture" },
          { key: "posiciones", label: "Posiciones" },
          { key: "eliminatorias", label: "Eliminatorias" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ ...styles.mainTab, ...(tab === t.key ? styles.mainTabActivo : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selector de grupo (solo en fixture y posiciones) */}
      {tab !== "eliminatorias" && (
        <GrupoSelector grupos={grupos} activo={grupoActivo} onSelect={setGrupoActivo} />
      )}

      {/* FIXTURE */}
      {tab === "fixture" && (
        <div style={styles.card}>
          <div style={styles.grupoLabel}>GRUPO {grupoActivo}</div>
          {cargando ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
              ))}
            </div>
          ) : partidosGrupo.length === 0 ? (
            <div style={styles.vacio}>No hay partidos cargados todavía</div>
          ) : (
            <div style={styles.listaPartidos}>
              {partidosGrupo.map((p, i) => (
                <div key={p._id}>
                  {i > 0 && <div style={styles.divisor} />}
                  <FilaPartido partido={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POSICIONES */}
      {tab === "posiciones" && (
        <div style={styles.card}>
          <div style={styles.grupoLabel}>GRUPO {grupoActivo}</div>
          {cargandoPos ? (
            <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
          ) : (
            <TablaGrupo equipos={posiciones[grupoKey]} />
          )}
        </div>
      )}

      {/* ELIMINATORIAS */}
      {tab === "eliminatorias" && (
        <Eliminatorias partidos={eliminatoriaPartidos} />
      )}
    </div>
  );
}

const styles = {
  titulo: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    letterSpacing: 2,
    marginBottom: 16,
  },
  mainTabs: {
    display: "flex",
    gap: 4,
    marginBottom: 16,
    borderBottom: "1px solid var(--borde)",
    paddingBottom: 0,
  },
  mainTab: {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "var(--texto-secundario)",
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    marginBottom: -1,
    transition: "all 0.15s",
  },
  mainTabActivo: {
    color: "var(--texto-principal)",
    borderBottomColor: "var(--gris-oscuro)",
    fontWeight: 600,
  },
  grupoSelector: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  grupoBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1.5px solid var(--borde)",
    background: "var(--blanco)",
    color: "var(--texto-secundario)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },
  grupoBtnActivo: {
    background: "var(--gris-oscuro)",
    borderColor: "var(--gris-oscuro)",
    color: "var(--blanco)",
  },
  card: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "16px 20px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  grupoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--texto-secundario)",
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  listaPartidos: {},
  divisor: { height: 1, background: "var(--borde)", margin: "0 -4px" },
  filaPartido: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 8,
    padding: "10px 4px",
  },
  equipoLocal: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  equipoVisitante: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  bandera: {
    width: 28,
    height: 20,
    objectFit: "cover",
    borderRadius: 2,
    border: "1px solid var(--borde)",
    flexShrink: 0,
  },
  nombreEquipo: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--texto-principal)",
  },
  centroPartido: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    minWidth: 80,
  },
  fechaHora: { display: "flex", flexDirection: "column", alignItems: "center" },
  fechaTexto: {
    fontSize: 13,
    color: "var(--texto-secundario)",
    fontWeight: 500,
  },
  horaTexto: { fontSize: 11, color: "var(--texto-secundario)" },
  marcadorFinal: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    color: "var(--texto-principal)",
  },
  badgeLive: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ef4444",
    animation: "pulse 1.5s infinite",
  },
  // Tabla posiciones
  tablaWrapper: { overflowX: "auto", margin: "0 -4px" },
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: {
    padding: "8px 10px",
    textAlign: "center",
    fontWeight: 600,
    fontSize: 11,
    color: "var(--texto-secundario)",
    borderBottom: "1px solid var(--borde)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tr: { borderBottom: "1px solid var(--borde)" },
  trClasifica: { background: "#f0fdf4" },
  td: { padding: "10px 10px", textAlign: "center", color: "var(--texto-principal)" },
  banderaTabla: {
    width: 24,
    height: 16,
    objectFit: "cover",
    borderRadius: 2,
    border: "1px solid var(--borde)",
    flexShrink: 0,
  },
  // Eliminatorias
  faseTabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  faseTab: {
    background: "var(--blanco)",
    border: "1.5px solid var(--borde)",
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
  faseTabActivo: {
    background: "var(--gris-oscuro)",
    borderColor: "var(--gris-oscuro)",
    color: "var(--blanco)",
  },
  faseDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
  },
  infoElim: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "var(--celeste-light)",
    border: "1px solid var(--celeste)",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 16,
    fontSize: 14,
    color: "var(--texto-principal)",
    lineHeight: 1.5,
  },
  cruceCard: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  cruceEquipo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  banderaCruce: {
    width: 28,
    height: 20,
    objectFit: "cover",
    borderRadius: 2,
    border: "1px solid var(--borde)",
    flexShrink: 0,
  },
  cruceNombre: { fontSize: 14, fontWeight: 600 },
  pendiente: {
    fontSize: 13,
    color: "var(--texto-secundario)",
    fontStyle: "italic",
  },
  cruceMarcador: { textAlign: "center", minWidth: 60 },
  cruceSep: {
    fontFamily: "var(--font-display)",
    fontSize: 16,
    color: "var(--texto-secundario)",
    letterSpacing: 2,
  },
  marcadorElim: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    color: "var(--texto-principal)",
  },
  finBadge: {
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
  vacio: {
    textAlign: "center",
    padding: "32px 16px",
    color: "var(--texto-secundario)",
    fontSize: 14,
  },
};
