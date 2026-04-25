import { useState } from "react";
import { usePartidos, usePosiciones } from "../hooks/useProde";

const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

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
    return <div style={styles.vacio}>Cargando posiciones...</div>;
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

const FASES_ELIM = [
  { key: "r32",   label: "16avos",   keys: ["Round of 32", "16avos"] },
  { key: "r16",   label: "Octavos",  keys: ["Round of 16", "Octavos"] },
  { key: "qf",    label: "Cuartos",  keys: ["Quarter", "Cuartos"] },
  { key: "sf",    label: "Semis",    keys: ["Semi", "Semis"] },
  { key: "final", label: "Final",    keys: ["Final"] },
  { key: "3er",   label: "3° Puesto", keys: ["Third", "3er", "3°", "Tercer"] },
];

function CruceCard({ partido }) {
  const yaJugo = ["FT", "AET", "PEN"].includes(partido.estado);
  const enJuego = ["1H", "2H", "HT", "ET", "BT"].includes(partido.estado);
  const pendiente = (nombre) => !nombre || nombre === "Por definir";

  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", {
    weekday: "short", day: "2-digit", month: "short",
  });
  const hora = new Date(partido.fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={el.card}>
      {/* Equipo local */}
      <div style={el.equipo}>
        {partido.banderaLocal && !pendiente(partido.local) && (
          <img src={partido.banderaLocal} alt={partido.local} style={el.bandera}
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <span style={pendiente(partido.local) ? el.equipoPendiente : el.equipoNombre}>
          {pendiente(partido.local) ? "Por definir" : partido.local}
        </span>
      </div>

      {/* Centro */}
      <div style={el.centro}>
        {yaJugo || enJuego ? (
          <div style={el.marcadorWrap}>
            <span style={el.marcador}>
              {partido.golesLocal ?? "–"} - {partido.golesVisitante ?? "–"}
            </span>
            {yaJugo && <span style={el.badgeFin}>FIN</span>}
            {enJuego && <span style={el.badgeLive}>● EN VIVO</span>}
          </div>
        ) : (
          <div style={el.fechaWrap}>
            <span style={el.fechaText}>{fecha}</span>
            <span style={el.horaText}>{hora}</span>
          </div>
        )}
      </div>

      {/* Equipo visitante */}
      <div style={{ ...el.equipo, justifyContent: "flex-end" }}>
        <span style={pendiente(partido.visitante) ? el.equipoPendiente : el.equipoNombre}>
          {pendiente(partido.visitante) ? "Por definir" : partido.visitante}
        </span>
        {partido.banderaVisitante && !pendiente(partido.visitante) && (
          <img src={partido.banderaVisitante} alt={partido.visitante} style={el.bandera}
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
      </div>
    </div>
  );
}

function Eliminatorias({ partidos }) {
  const byFase = (fase) =>
    partidos
      .filter((p) => fase.keys.some((k) => p.ronda?.includes(k) || p.grupo?.includes(k)))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const fasesConDatos = FASES_ELIM.filter((f) => byFase(f).length > 0);
  const [faseActiva, setFaseActiva] = useState(fasesConDatos[0]?.key ?? "r32");

  const faseActual = FASES_ELIM.find((f) => f.key === faseActiva);
  const partidosFase = faseActual ? byFase(faseActual) : [];

  if (partidos.length === 0) {
    return (
      <div style={styles.infoElim}>
        <span style={{ fontSize: 20 }}>⏳</span>
        <span>Los cruces se definen cuando terminen los grupos. Volvé en junio de 2026.</span>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs de fases */}
      <div style={el.faseTabs}>
        {FASES_ELIM.map((f) => {
          const tiene = byFase(f).length > 0;
          return (
            <button
              key={f.key}
              onClick={() => setFaseActiva(f.key)}
              style={{
                ...el.faseTab,
                ...(faseActiva === f.key ? el.faseTabActivo : {}),
                ...(tiene ? {} : { opacity: 0.4 }),
              }}
            >
              {f.label}
              {tiene && <span style={el.faseDot} />}
            </button>
          );
        })}
      </div>

      {/* Partidos de la fase */}
      {partidosFase.length === 0 ? (
        <div style={styles.vacio}>
          Los partidos de esta fase aún no están definidos
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {partidosFase.map((p) => (
            <CruceCard key={p._id} partido={p} />
          ))}
        </div>
      )}
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
  vacio: {
    textAlign: "center",
    padding: "32px 16px",
    color: "var(--texto-secundario)",
    fontSize: 14,
  },
};

const el = {
  faseTabs: {
    display: "flex",
    gap: 4,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  faseTab: {
    background: "var(--blanco)",
    border: "1.5px solid var(--borde)",
    borderRadius: 20,
    color: "var(--texto-secundario)",
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
  },
  faseTabActivo: {
    background: "var(--gris-oscuro)",
    borderColor: "var(--gris-oscuro)",
    color: "var(--blanco)",
    fontWeight: 600,
  },
  faseDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    flexShrink: 0,
  },
  card: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  equipo: {
    display: "flex",
    alignItems: "center",
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
  equipoNombre: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--texto-principal)",
  },
  equipoPendiente: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--texto-secundario)",
    fontStyle: "italic",
  },
  centro: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 90,
  },
  marcadorWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  marcador: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    color: "var(--texto-principal)",
  },
  badgeFin: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--texto-secundario)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  badgeLive: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ef4444",
  },
  fechaWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  },
  fechaText: {
    fontSize: 12,
    color: "var(--texto-secundario)",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  horaText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--texto-principal)",
  },
};
