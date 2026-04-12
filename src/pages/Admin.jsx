import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Admin() {
  const { user, isAuthenticated } = useAuth0();
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(false);
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

  const llamar = async (url) => {
    setCargando(true);
    setMensaje("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "x-admin-key": "prode2026secret" },
      });
      const data = await res.json();
      setTipoMensaje(res.ok ? "ok" : "error");
      setMensaje(data.mensaje || data.error || "Completado");
      fetch("/api/partidos")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) setPartidos(d);
        });
    } catch (e) {
      setTipoMensaje("error");
      setMensaje("Error: " + e.message);
    } finally {
      setCargando(false);
    }
  };

  const sincronizarResultados = async () => {
    setCargando(true);
    setMensaje("");
    try {
      const res = await fetch("/api/admin/sincronizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "prode2026secret",
        },
        body: JSON.stringify({
          leagueId: 1,
          season: 2026,
          soloRecientes: false,
        }),
      });
      const data = await res.json();
      setTipoMensaje(res.ok ? "ok" : "error");
      setMensaje(data.mensaje || data.error);
      fetch("/api/partidos")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) setPartidos(d);
        });
    } catch (e) {
      setTipoMensaje("error");
      setMensaje("Error: " + e.message);
    } finally {
      setCargando(false);
    }
  };

  const limpiar = async () => {
    if (!confirm("¿Seguro que querés borrar todos los partidos?")) return;
    llamar("/api/admin/limpiar");
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

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardIcono}>⚽</div>
          <div style={styles.cardTitulo}>Cargar Mundial 2026</div>
          <div style={styles.cardDesc}>
            Carga los partidos de fase de grupos del Mundial 2026 con fechas,
            grupos y banderas reales.
          </div>
          <button
            style={styles.btn}
            onClick={() => llamar("/api/admin/cargar-mundial")}
            disabled={cargando}
          >
            {cargando ? "Cargando..." : "Cargar partidos"}
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcono}>🔄</div>
          <div style={styles.cardTitulo}>Sincronizar resultados</div>
          <div style={styles.cardDesc}>
            Trae los resultados reales desde API-Football. Usalo durante el
            Mundial para actualizar los scores.
          </div>
          <button
            style={styles.btn}
            onClick={sincronizarResultados}
            disabled={cargando}
          >
            {cargando ? "Sincronizando..." : "Sincronizar"}
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcono}>🏆</div>
          <div style={styles.cardTitulo}>Recalcular puntos</div>
          <div style={styles.cardDesc}>
            Compara predicciones con resultados reales y actualiza el ranking.
            Hacelo después de cada fecha.
          </div>
          <button
            style={styles.btn}
            onClick={() => llamar("/api/admin/recalcular")}
            disabled={cargando}
          >
            {cargando ? "Calculando..." : "Recalcular"}
          </button>
        </div>

        <div style={{ ...styles.card, borderTop: "3px solid #ef4444" }}>
          <div style={styles.cardIcono}>🗑️</div>
          <div style={styles.cardTitulo}>Limpiar partidos</div>
          <div style={styles.cardDesc}>
            Borra todos los partidos. Usalo solo si necesitás resetear antes de
            cargar el Mundial real.
          </div>
          <button
            style={{ ...styles.btn, background: "#ef4444" }}
            onClick={limpiar}
            disabled={cargando}
          >
            Limpiar todo
          </button>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={styles.seccionTitulo}>
          PARTIDOS EN LA DB ({partidos.length})
        </h2>
        {partidos.length === 0 ? (
          <div style={styles.vacio}>
            No hay partidos — usá "Cargar Mundial 2026"
          </div>
        ) : (
          <div style={styles.tablaWrapper}>
            <table style={styles.tabla}>
              <thead>
                <tr>
                  {[
                    "Grupo",
                    "Local",
                    "Visitante",
                    "Fecha",
                    "Estado",
                    "Resultado",
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partidos.slice(0, 20).map((p) => (
                  <tr
                    key={p._id}
                    style={{
                      ...styles.tr,
                      ...(p.local === "Argentina" || p.visitante === "Argentina"
                        ? { background: "#fffbeb" }
                        : {}),
                    }}
                  >
                    <td style={styles.td}>{p.grupo}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
            {partidos.length > 20 && (
              <p
                style={{
                  textAlign: "center",
                  padding: 12,
                  fontSize: 13,
                  color: "var(--texto-secundario)",
                }}
              >
                Mostrando 20 de {partidos.length} partidos
              </p>
            )}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 16,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderTop: "3px solid var(--celeste)",
  },
  cardIcono: { fontSize: 28 },
  cardTitulo: { fontWeight: 600, fontSize: 15 },
  cardDesc: {
    fontSize: 13,
    color: "var(--texto-secundario)",
    lineHeight: 1.6,
    flex: 1,
  },
  btn: {
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
  seccionTitulo: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 12,
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
