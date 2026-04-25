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

// Bracket slot: dark box with team name
function BracketSlot({ nombre, bandera, resultado }) {
  const pendiente = !nombre || nombre === "Por definir";
  return (
    <div style={bk.slot}>
      <div style={bk.slotInner}>
        {bandera && !pendiente && (
          <img src={bandera} alt={nombre} style={bk.banderita}
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <span style={pendiente ? bk.slotPendiente : bk.slotNombre}>
          {pendiente ? "?" : nombre}
        </span>
        {resultado != null && (
          <span style={bk.slotGol}>{resultado}</span>
        )}
      </div>
    </div>
  );
}

// A pair of slots stacked, connected on the right to a center line
function BracketPair({ local, visitante, resultado }) {
  return (
    <div style={bk.pair}>
      <BracketSlot
        nombre={local?.nombre}
        bandera={local?.bandera}
        resultado={resultado ? resultado.golesLocal : null}
      />
      <div style={bk.slotGap} />
      <BracketSlot
        nombre={visitante?.nombre}
        bandera={visitante?.bandera}
        resultado={resultado ? resultado.golesVisitante : null}
      />
    </div>
  );
}

// SLOT_H=34, INNER_GAP=4, PAIR_H=72, PERIOD_R32=88 → 8 pairs total H=704
const SLOT_H = 34;
const INNER_GAP = 4;
const PAIR_H = SLOT_H * 2 + INNER_GAP; // 72
const PERIOD = 88; // base period for R32 (72 + 16 gap)
const TOTAL_H = 8 * PERIOD; // 704

// Column with absolute positioning to align pairs with bracket connectors
function BracketColumn({ matches, period }) {
  return (
    <div style={{ position: "relative", height: TOTAL_H, width: 110, flexShrink: 0 }}>
      {matches.map((m, i) => {
        const top = i * period + (period - PAIR_H) / 2;
        return (
          <div key={i} style={{ position: "absolute", top, left: 0, width: 110 }}>
            <BracketPair local={m?.local} visitante={m?.visitante} resultado={m} />
          </div>
        );
      })}
    </div>
  );
}

// SVG connector lines between rounds
function Connector({ n, period, lado = "left" }) {
  const x0 = lado === "left" ? 0 : 20;
  const x1 = lado === "left" ? 20 : 0;
  // n=1: SF→Final, just a single horizontal line at mid-height
  if (n === 1) {
    const ymid = TOTAL_H / 2;
    return (
      <svg width={20} height={TOTAL_H} style={{ flexShrink: 0 }}>
        <line x1={x0} y1={ymid} x2={x1} y2={ymid} stroke="#74acdf" strokeWidth={2} />
      </svg>
    );
  }
  const pairs = n / 2;
  return (
    <svg width={20} height={TOTAL_H} style={{ flexShrink: 0 }}>
      {Array.from({ length: pairs }).map((_, i) => {
        const y1 = i * 2 * period + period / 2;
        const y2 = i * 2 * period + period * 1.5;
        const ymid = (y1 + y2) / 2;
        return (
          <g key={i}>
            <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="#4a5568" strokeWidth={1.5} />
            <line x1={x0} y1={y2} x2={x1} y2={y2} stroke="#4a5568" strokeWidth={1.5} />
            <line x1={x1} y1={y1} x2={x1} y2={y2} stroke="#4a5568" strokeWidth={1.5} />
            <line x1={x1} y1={ymid} x2={x0} y2={ymid} stroke="#74acdf" strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
}

function Eliminatorias({ partidos }) {

  const toSlot = (nombre, bandera) => ({ nombre: nombre || "?", bandera: bandera || "" });

  const byRonda = (keys) =>
    partidos.filter((p) => keys.some((k) => p.ronda?.includes(k) || p.grupo?.includes(k)));

  const r32 = byRonda(["Round of 32", "16avos"]);
  const r16 = byRonda(["Round of 16", "Octavos"]);
  const qf  = byRonda(["Quarter", "Cuartos"]);
  const sf  = byRonda(["Semi", "Semis"]);
  const final  = byRonda(["Final"]);
  const tercer = byRonda(["Third", "3er", "3°", "Tercer"]);

  const mkMatch = (p) =>
    p ? {
      local: toSlot(p.local, p.banderaLocal),
      visitante: toSlot(p.visitante, p.banderaVisitante),
      golesLocal: p.golesLocal,
      golesVisitante: p.golesVisitante,
      ft: ["FT", "AET", "PEN"].includes(p.estado),
    } : null;

  const fill = (arr, len) =>
    [...arr.slice(0, len), ...Array(Math.max(0, len - arr.length)).fill(null)].map(mkMatch);

  const P_R32 = PERIOD;       // 88
  const P_R16 = PERIOD * 2;   // 176
  const P_QF  = PERIOD * 4;   // 352
  const P_SF  = PERIOD * 8;   // 704

  const finalMatch  = mkMatch(final[0] || null);
  const tercerMatch = mkMatch(tercer[0] || null);

  return (
    <div style={bk.outer}>
      <div style={bk.scrollWrap}>
        <div style={bk.bracket}>
          {/* LEFT: R32 → R16 → QF → SF */}
          <BracketColumn matches={fill(r32.slice(0, 8), 8)} period={P_R32} />
          <Connector n={8} period={P_R32} lado="left" />
          <BracketColumn matches={fill(r16.slice(0, 4), 4)} period={P_R16} />
          <Connector n={4} period={P_R16} lado="left" />
          <BracketColumn matches={fill(qf.slice(0, 2), 2)} period={P_QF} />
          <Connector n={2} period={P_QF} lado="left" />
          <BracketColumn matches={fill(sf.slice(0, 1), 1)} period={P_SF} />
          <Connector n={1} period={P_SF} lado="left" />

          {/* CENTER */}
          <div style={bk.center}>
            <div style={bk.centerLabel}>FINAL</div>
            <BracketPair
              local={finalMatch?.local}
              visitante={finalMatch?.visitante}
              resultado={finalMatch?.ft ? finalMatch : null}
            />
            <div style={bk.tercerLabel}>3° y 4° PUESTO</div>
            <BracketPair
              local={tercerMatch?.local}
              visitante={tercerMatch?.visitante}
              resultado={tercerMatch?.ft ? tercerMatch : null}
            />
          </div>

          {/* RIGHT: SF → QF → R16 → R32 */}
          <Connector n={1} period={P_SF} lado="right" />
          <BracketColumn matches={fill(sf.slice(1), 1)} period={P_SF} />
          <Connector n={2} period={P_QF} lado="right" />
          <BracketColumn matches={fill(qf.slice(2), 2)} period={P_QF} />
          <Connector n={4} period={P_R16} lado="right" />
          <BracketColumn matches={fill(r16.slice(4), 4)} period={P_R16} />
          <Connector n={8} period={P_R32} lado="right" />
          <BracketColumn matches={fill(r32.slice(8), 8)} period={P_R32} />
        </div>
      </div>

      {partidos.length === 0 && (
        <div style={styles.infoElim}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <span>Los cruces se definen cuando terminen los grupos.</span>
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

const bk = {
  outer: { marginTop: 4 },
  scrollWrap: { overflowX: "auto", overflowY: "hidden", paddingBottom: 12, margin: "0 -4px" },
  bracket: {
    display: "flex",
    alignItems: "flex-start",
    gap: 0,
    width: 1210,
    padding: "16px 8px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    flexShrink: 0,
  },
  pair: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  slotGap: { height: 4 },
  slot: {
    width: 110,
    height: 34,
    background: "#1a1a2e",
    borderRadius: 6,
    overflow: "hidden",
    border: "1px solid #2d3748",
  },
  slotInner: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "0 8px",
    height: "100%",
  },
  banderita: {
    width: 20,
    height: 14,
    objectFit: "cover",
    borderRadius: 2,
    flexShrink: 0,
  },
  slotNombre: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: 500,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  slotPendiente: {
    color: "#4a5568",
    fontSize: 16,
    fontWeight: 700,
    flex: 1,
    textAlign: "center",
  },
  slotGol: {
    color: "#74acdf",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    minWidth: 14,
    textAlign: "right",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "0 12px",
    flexShrink: 0,
    height: 704,
  },
  centerLabel: {
    fontFamily: "var(--font-display)",
    fontSize: 13,
    letterSpacing: 2,
    color: "#74acdf",
    textAlign: "center",
  },
  tercerLabel: {
    fontFamily: "var(--font-display)",
    fontSize: 10,
    letterSpacing: 1,
    color: "var(--texto-secundario)",
    textAlign: "center",
    marginTop: 16,
  },
};
