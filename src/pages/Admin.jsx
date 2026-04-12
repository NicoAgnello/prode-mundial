import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LIGAS_TEST = [
  { id: 39, nombre: "Premier League", bandera: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", season: 2025 },
  { id: 140, nombre: "La Liga", bandera: "🇪🇸", season: 2025 },
  { id: 2, nombre: "Champions League", bandera: "⭐", season: 2025 },
  { id: 128, nombre: "Liga Argentina", bandera: "🇦🇷", season: 2025 },
];

export default function Admin() {
  const { user, isAuthenticated } = useAuth0();
  const [partidos, setPartidos] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("ok");

  const esAdmin = user?.email === "nikoagnello1@gmail.com";
  useEffect(() => {
    if (!esAdmin) return;
    fetch("/api/partidos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPartidos(data);
      });
  }, [esAdmin]);

  const sincronizarLiga = async (leagueId, season, soloRecientes = true) => {
    setSincronizando(true);
    setMensaje("");
    try {
      const res = await fetch("/api/admin/sincronizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "prode2026secret",
        },
        body: JSON.stringify({ leagueId, season, soloRecientes }),
      });
      const data = await res.json();
      setTipoMensaje("ok");
      setMensaje(
        data.mensaje || `✓ ${data.actualizados} partidos sincronizados`,
      );
      fetch("/api/partidos")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) setPartidos(d);
        });
    } catch (e) {
      setTipoMensaje("error");
      setMensaje("Error al sincronizar: " + e.message);
    } finally {
      setSincronizando(false);
    }
  };

  const recalcularPuntos = async () => {
    setSincronizando(true);
    setMensaje("");
    try {
      const res = await fetch("/api/admin/recalcular", {
        method: "POST",
        headers: { "x-admin-key": "prode2026secret" },
      });
      const data = await res.json();
      setTipoMensaje("ok");
      setMensaje(
        `✓ Puntos recalculados: ${data.prediccionesActualizadas} predicciones`,
      );
    } catch {
      setTipoMensaje("error");
      setMensaje("Error al recalcular");
    } finally {
      setSincronizando(false);
    }
  };

  const limpiarPartidos = async () => {
    if (!confirm("¿Seguro que querés borrar todos los partidos de prueba?"))
      return;
    setSincronizando(true);
    try {
      const res = await fetch("/api/admin/limpiar", {
        method: "POST",
        headers: { "x-admin-key": "prode2026secret" },
      });
      const data = await res.json();
      setTipoMensaje("ok");
      setMensaje(`✓ ${data.eliminados} partidos eliminados`);
      setPartidos([]);
    } catch {
      setTipoMensaje("error");
      setMensaje("Error al limpiar");
    } finally {
      setSincronizando(false);
    }
  };

  if (!isAuthenticated || !esAdmin) {
    return (
      <div style={styles.centrado}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <h2 style={styles.titulo}>Acceso restringido</h2>
        <p style={{ color: "var(--texto-secundario)" }}>
          Esta sección es solo para administradores.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>PANEL ADMIN</h1>

      {mensaje && (
        <div
          style={{
            ...styles.mensajeBox,
            background: tipoMensaje === "ok" ? "#dcfce7" : "#fee2e2",
            color: tipoMensaje === "ok" ? "#166534" : "#991b1b",
            borderColor: tipoMensaje === "ok" ? "#86efac" : "#fca5a5",
          }}
        >
          {mensaje}
        </div>
      )}
      <button
        style={{
          ...styles.ligaBtn,
          borderColor: "var(--celeste)",
          marginBottom: 12,
        }}
        onClick={() => sincronizarLiga(39, 2025, true)}
        disabled={sincronizando}
      >
        <span style={{ fontSize: 24 }}>📅</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Partidos de hoy</div>
          <div style={{ fontSize: 12, color: "var(--texto-secundario)" }}>
            Todos los partidos de hoy
          </div>
        </div>
      </button>
      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>🧪 TESTING — Ligas reales</h2>
        <p style={styles.seccionDesc}>
          Cargá los últimos 10 partidos terminados de estas ligas para probar el
          flujo completo sin esperar el Mundial.
        </p>
        <div style={styles.ligasGrid}>
          {LIGAS_TEST.map((liga) => (
            <button
              key={liga.id}
              style={styles.ligaBtn}
              onClick={() => sincronizarLiga(liga.id, liga.season)}
              disabled={sincronizando}
            >
              <span style={{ fontSize: 24 }}>{liga.bandera}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {liga.nombre}
                </div>
                <div style={{ fontSize: 12, color: "var(--texto-secundario)" }}>
                  Últimos 10 partidos
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>⚙️ ACCIONES</h2>
        <div style={styles.accionesGrid}>
          <div style={styles.accionCard}>
            <div style={styles.accionIcono}>🔄</div>
            <div style={styles.accionTitulo}>Sincronizar Mundial 2026</div>
            <div style={styles.accionDesc}>
              Trae todos los partidos del Mundial desde API-Football. Usalo
              cuando empiece el torneo en junio 2026.
            </div>
            <button
              style={styles.btnAccion}
              onClick={() => sincronizarLiga(1, 2026, false)}
              disabled={sincronizando}
            >
              {sincronizando ? "Sincronizando..." : "Sincronizar Mundial"}
            </button>
          </div>

          <div style={styles.accionCard}>
            <div style={styles.accionIcono}>🏆</div>
            <div style={styles.accionTitulo}>Recalcular puntos</div>
            <div style={styles.accionDesc}>
              Compara todas las predicciones con los resultados y actualiza el
              ranking automáticamente.
            </div>
            <button
              style={styles.btnAccion}
              onClick={recalcularPuntos}
              disabled={sincronizando}
            >
              {sincronizando ? "Calculando..." : "Recalcular puntos"}
            </button>
          </div>

          <div style={{ ...styles.accionCard, borderTop: "3px solid #ef4444" }}>
            <div style={styles.accionIcono}>🗑️</div>
            <div style={styles.accionTitulo}>Limpiar partidos de prueba</div>
            <div style={styles.accionDesc}>
              Borra todos los partidos cargados. Usalo antes de cargar los del
              Mundial real.
            </div>
            <button
              style={{ ...styles.btnAccion, background: "#ef4444" }}
              onClick={limpiarPartidos}
              disabled={sincronizando}
            >
              Limpiar todo
            </button>
          </div>
        </div>
      </div>

      <div style={styles.seccion}>
        <h2 style={styles.seccionTitulo}>
          PARTIDOS EN LA DB ({partidos.length})
        </h2>
        {partidos.length === 0 ? (
          <div style={styles.vacio}>
            No hay partidos cargados — usá los botones de testing de arriba
          </div>
        ) : (
          <div style={styles.tablaWrapper}>
            <table style={styles.tabla}>
              <thead>
                <tr>
                  {[
                    "Local",
                    "Visitante",
                    "Fecha",
                    "Estado",
                    "Resultado",
                    "Liga",
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partidos.slice(0, 20).map((p) => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>{p.local}</td>
                    <td style={styles.td}>{p.visitante}</td>
                    <td style={styles.td}>
                      {new Date(p.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.estadoBadge,
                          background: p.estado === "FT" ? "#dcfce7" : "#f1f5f9",
                          color: p.estado === "FT" ? "#166534" : "#475569",
                        }}
                      >
                        {p.estado === "FT"
                          ? "Terminado"
                          : p.estado === "NS"
                            ? "Pendiente"
                            : p.estado}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {p.estado === "FT"
                        ? `${p.golesLocal} - ${p.golesVisitante}`
                        : "-"}
                    </td>
                    <td style={styles.td}>{p.ronda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    letterSpacing: 2,
    marginBottom: 20,
  },
  mensajeBox: {
    border: "1px solid",
    borderRadius: 10,
    padding: "10px 16px",
    marginBottom: 20,
    fontSize: 14,
  },
  seccion: { marginBottom: 32 },
  seccionTitulo: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 8,
  },
  seccionDesc: {
    fontSize: 14,
    color: "var(--texto-secundario)",
    marginBottom: 14,
  },
  ligasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },
  ligaBtn: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "var(--font-body)",
  },
  accionesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  accionCard: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 16,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderTop: "3px solid var(--celeste)",
  },
  accionIcono: { fontSize: 28 },
  accionTitulo: { fontWeight: 600, fontSize: 15 },
  accionDesc: {
    fontSize: 13,
    color: "var(--texto-secundario)",
    lineHeight: 1.6,
    flex: 1,
  },
  btnAccion: {
    background: "var(--gris-oscuro)",
    color: "var(--blanco)",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
    fontFamily: "var(--font-body)",
  },
  vacio: {
    textAlign: "center",
    padding: "32px",
    background: "var(--blanco)",
    borderRadius: 12,
    border: "1px solid var(--borde)",
    color: "var(--texto-secundario)",
  },
  tablaWrapper: {
    overflowX: "auto",
    borderRadius: 12,
    border: "1px solid var(--borde)",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    background: "var(--blanco)",
    fontSize: 14,
  },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 12,
    color: "var(--texto-secundario)",
    background: "var(--gris-suave)",
    borderBottom: "1px solid var(--borde)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tr: { borderBottom: "1px solid var(--borde)" },
  td: { padding: "10px 14px", color: "var(--texto-principal)" },
  estadoBadge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 6,
    fontWeight: 600,
  },
};
