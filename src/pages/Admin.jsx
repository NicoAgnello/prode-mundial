import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const ADMIN_KEY = "prode2026secret";

export default function Admin() {
  const { user, isAuthenticated } = useAuth0();
  const [partidos, setPartidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("ok");
  const [seccion, setSeccion] = useState("principal");
  const [partidoSeleccionado, setPartidoSeleccionado] = useState("");
  const [prediccionesPartido, setPrediccionesPartido] = useState([]);
  const [usuarioABorrar, setUsuarioABorrar] = useState("");

  const esAdmin = user?.email === "nikoagnello1@gmail.com";

  useEffect(() => {
    if (!esAdmin) return;
    cargarPartidos();
    cargarUsuarios();
  }, [esAdmin]);

  const cargarPartidos = () => {
    fetch("/api/partidos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPartidos(data);
      });
  };

  const cargarUsuarios = () => {
    fetch("/api/admin/usuarios", {
      headers: { "x-admin-key": ADMIN_KEY },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsuarios(data);
      });
  };

  const mostrarMensaje = (msg, tipo = "ok") => {
    setMensaje(msg);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(""), 5000);
  };

  const llamarPost = async (url, body = {}, confirmMsg = null) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setCargando(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      mostrarMensaje(data.mensaje || data.error, res.ok ? "ok" : "error");
      cargarPartidos();
      cargarUsuarios();
    } catch (e) {
      mostrarMensaje("Error de conexión: " + e.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const verPrediccionesPartido = async () => {
    if (!partidoSeleccionado) return;
    const res = await fetch(
      `/api/admin/predicciones-partido?partidoId=${partidoSeleccionado}`,
      {
        headers: { "x-admin-key": ADMIN_KEY },
      },
    );
    const data = await res.json();
    if (Array.isArray(data)) setPrediccionesPartido(data);
    else mostrarMensaje(data.error, "error");
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
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>PANEL ADMIN</h1>
        <span style={{ fontSize: 13, color: "var(--texto-secundario)" }}>
          {usuarios.length} usuarios · {partidos.length} partidos
        </span>
      </div>

      {mensaje && (
        <div
          style={{
            ...styles.mensajeBox,
            background: tipoMensaje === "ok" ? "#dcfce7" : "#fee2e2",
            color: tipoMensaje === "ok" ? "#166534" : "#991b1b",
            borderColor: tipoMensaje === "ok" ? "#86efac" : "#fca5a5",
          }}
        >
          {tipoMensaje === "ok" ? "✓" : "⚠"} {mensaje}
        </div>
      )}

      {/* Tabs de secciones */}
      <div style={styles.tabs}>
        {[
          { key: "principal", label: "⚙️ Principal" },
          { key: "usuarios", label: `👥 Usuarios (${usuarios.length})` },
          { key: "partidos", label: `⚽ Partidos (${partidos.length})` },
          { key: "utilidades", label: "🔧 Utilidades" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSeccion(t.key)}
            style={{
              ...styles.tab,
              ...(seccion === t.key ? styles.tabActivo : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SECCIÓN PRINCIPAL */}
      {seccion === "principal" && (
        <div>
          <div style={styles.infoBox}>
            <strong>📋 Flujo normal del Mundial:</strong>
            <ol style={{ margin: "8px 0 0 20px", lineHeight: 2 }}>
              <li>
                Cargá los partidos del Mundial antes de que empiece (junio 2026)
              </li>
              <li>
                Los participantes cargan sus prodes en la sección Partidos
              </li>
              <li>
                Cuando empiece el torneo, sincronizá resultados después de cada
                fecha
              </li>
              <li>Recalculá puntos para actualizar el ranking</li>
            </ol>
          </div>

          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardIcono}>⚽</div>
              <div style={styles.cardTitulo}>Cargar Mundial 2026</div>
              <div style={styles.cardDesc}>
                Carga los 72 partidos de fase de grupos con fechas, grupos y
                banderas reales.
                <strong
                  style={{ color: "#ef4444", display: "block", marginTop: 4 }}
                >
                  ⚠ Esto borra los partidos de prueba existentes.
                </strong>
              </div>
              <button
                style={styles.btn}
                onClick={() =>
                  llamarPost(
                    "/api/admin/cargar-mundial",
                    {},
                    "¿Cargar los partidos del Mundial? Esto va a borrar los partidos de prueba actuales.",
                  )
                }
                disabled={cargando}
              >
                {cargando ? "Cargando..." : "Cargar partidos"}
              </button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcono}>🔄</div>
              <div style={styles.cardTitulo}>Sincronizar resultados</div>
              <div style={styles.cardDesc}>
                Trae los resultados reales desde API-Football y actualiza los
                partidos jugados. Usalo durante el Mundial después de cada fecha
                de juego.
              </div>
              <button
                style={styles.btn}
                onClick={() =>
                  llamarPost("/api/admin/sincronizar", {
                    leagueId: 1,
                    season: 2026,
                    soloRecientes: false,
                  })
                }
                disabled={cargando}
              >
                {cargando ? "Sincronizando..." : "Sincronizar"}
              </button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcono}>🏆</div>
              <div style={styles.cardTitulo}>Recalcular puntos</div>
              <div style={styles.cardDesc}>
                Compara todas las predicciones con los resultados y actualiza el
                ranking. Hacelo siempre después de sincronizar resultados.
              </div>
              <button
                style={styles.btn}
                onClick={() => llamarPost("/api/admin/recalcular")}
                disabled={cargando}
              >
                {cargando ? "Calculando..." : "Recalcular"}
              </button>
            </div>

            <div style={{ ...styles.card, borderTop: "3px solid #ef4444" }}>
              <div style={styles.cardIcono}>🗑️</div>
              <div style={styles.cardTitulo}>Limpiar partidos</div>
              <div style={styles.cardDesc}>
                Borra todos los partidos de la base de datos.
                <strong
                  style={{ color: "#ef4444", display: "block", marginTop: 4 }}
                >
                  ⚠ Acción irreversible. Las predicciones quedan huérfanas.
                </strong>
              </div>
              <button
                style={{ ...styles.btn, background: "#ef4444" }}
                onClick={() =>
                  llamarPost(
                    "/api/admin/limpiar",
                    {},
                    "¿Seguro? Esto borra TODOS los partidos y es irreversible.",
                  )
                }
                disabled={cargando}
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN USUARIOS */}
      {seccion === "usuarios" && (
        <div>
          <p style={styles.seccionDesc}>
            Lista de todos los usuarios registrados. Podés ver sus estadísticas
            y borrar sus predicciones si hay algún problema.
          </p>
          {usuarios.length === 0 ? (
            <div style={styles.vacio}>No hay usuarios registrados todavía</div>
          ) : (
            <div style={styles.tablaWrapper}>
              <table style={styles.tabla}>
                <thead>
                  <tr>
                    {[
                      "Usuario",
                      "Email",
                      "Prodes",
                      "Puntos",
                      "Último acceso",
                      "Acciones",
                    ].map((h) => (
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.userId} style={styles.tr}>
                      <td style={styles.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {u.foto && (
                            <img
                              src={u.foto}
                              alt=""
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <span style={{ fontWeight: 500 }}>
                            {u.nombre || "Sin nombre"}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.totalPredicciones}</td>
                      <td style={styles.td}>
                        <strong style={{ color: "var(--celeste-dark)" }}>
                          {u.puntos} pts
                        </strong>
                      </td>
                      <td style={styles.td}>
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleDateString("es-AR")
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{
                            ...styles.btnPequeno,
                            background: "#fee2e2",
                            color: "#991b1b",
                          }}
                          onClick={() =>
                            llamarPost(
                              "/api/admin/limpiar-predicciones",
                              { userId: u.userId },
                              `¿Borrar todas las predicciones de ${u.nombre}? Esta acción es irreversible.`,
                            )
                          }
                        >
                          Borrar prodes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN PARTIDOS */}
      {seccion === "partidos" && (
        <div>
          <p style={styles.seccionDesc}>
            Lista de partidos en la base de datos. Los partidos con fondo
            amarillo son de Argentina.
          </p>

          {/* Ver predicciones de un partido */}
          <div
            style={{
              ...styles.card,
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={styles.cardTitulo}>
              🔍 Ver predicciones de un partido
            </div>
            <div style={styles.cardDesc}>
              Seleccioná un partido para ver qué pronosticó cada participante.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={partidoSeleccionado}
                onChange={(e) => {
                  setPartidoSeleccionado(e.target.value);
                  setPrediccionesPartido([]);
                }}
                style={styles.select}
              >
                <option value="">— Seleccioná un partido —</option>
                {partidos.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.local} vs {p.visitante} ({p.grupo})
                    {p.estado === "FT"
                      ? ` — ${p.golesLocal}-${p.golesVisitante}`
                      : " — Pendiente"}
                  </option>
                ))}
              </select>
              <button
                style={styles.btn}
                onClick={verPrediccionesPartido}
                disabled={!partidoSeleccionado || cargando}
              >
                Ver predicciones
              </button>
            </div>

            {prediccionesPartido.length > 0 && (
              <div style={styles.tablaWrapper}>
                <table style={styles.tabla}>
                  <thead>
                    <tr>
                      {["Usuario", "Pronóstico", "Puntos", "Cargado"].map(
                        (h) => (
                          <th key={h} style={styles.th}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {prediccionesPartido.map((p) => (
                      <tr key={p._id} style={styles.tr}>
                        <td style={styles.td}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {p.foto && (
                              <img
                                src={p.foto}
                                alt=""
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                }}
                              />
                            )}
                            {p.nombre}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <strong>
                            {p.golesLocal} - {p.golesVisitante}
                          </strong>
                        </td>
                        <td style={styles.td}>
                          {p.puntos === null ? (
                            <span style={{ color: "var(--texto-secundario)" }}>
                              Pendiente
                            </span>
                          ) : p.puntos === 3 ? (
                            <span style={{ color: "#166534", fontWeight: 700 }}>
                              ⭐ 3 pts
                            </span>
                          ) : p.puntos === 1 ? (
                            <span style={{ color: "#1e40af", fontWeight: 700 }}>
                              ✓ 1 pt
                            </span>
                          ) : (
                            <span style={{ color: "#64748b" }}>0 pts</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {new Date(p.createdAt).toLocaleDateString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {partidoSeleccionado && prediccionesPartido.length === 0 && (
              <p style={{ color: "var(--texto-secundario)", fontSize: 13 }}>
                Nadie cargó prode para este partido todavía.
              </p>
            )}
          </div>

          {/* Tabla de partidos */}
          {partidos.length === 0 ? (
            <div style={styles.vacio}>
              No hay partidos — usá "Cargar Mundial 2026" en la sección
              Principal
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
                  {partidos.map((p) => (
                    <tr
                      key={p._id}
                      style={{
                        ...styles.tr,
                        ...(p.local === "Argentina" ||
                        p.visitante === "Argentina"
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
                            background:
                              p.estado === "FT" ? "#dcfce7" : "#f1f5f9",
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
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN UTILIDADES */}
      {seccion === "utilidades" && (
        <div>
          <div style={styles.infoBox}>
            <strong>🔧 Estas herramientas son para casos de emergencia.</strong>{" "}
            Usálas solo si hay un problema específico con un usuario o con los
            puntos.
          </div>

          <div style={styles.grid}>
            <div style={{ ...styles.card, borderTop: "3px solid #f59e0b" }}>
              <div style={styles.cardIcono}>🔁</div>
              <div style={styles.cardTitulo}>Resetear todos los puntos</div>
              <div style={styles.cardDesc}>
                Pone todos los puntos en null para poder recalcular desde cero.
                Útil si hubo un error en el recálculo o si cambiaron las reglas
                de puntaje.
                <strong
                  style={{ color: "#92400e", display: "block", marginTop: 4 }}
                >
                  ⚠ Después tenés que volver a recalcular desde la sección
                  Principal.
                </strong>
              </div>
              <button
                style={{ ...styles.btn, background: "#f59e0b" }}
                onClick={() =>
                  llamarPost(
                    "/api/admin/resetear-puntos",
                    {},
                    "¿Resetear todos los puntos? Después tenés que recalcular manualmente.",
                  )
                }
                disabled={cargando}
              >
                {cargando ? "Reseteando..." : "Resetear puntos"}
              </button>
            </div>

            <div style={{ ...styles.card, borderTop: "3px solid #ef4444" }}>
              <div style={styles.cardIcono}>🗑️</div>
              <div style={styles.cardTitulo}>Borrar todas las predicciones</div>
              <div style={styles.cardDesc}>
                Borra las predicciones de todos los usuarios.
                <strong
                  style={{ color: "#ef4444", display: "block", marginTop: 4 }}
                >
                  ⚠ Acción irreversible. Para borrar las de un usuario
                  específico usá la sección Usuarios.
                </strong>
              </div>
              <button
                style={{ ...styles.btn, background: "#ef4444" }}
                onClick={() =>
                  llamarPost(
                    "/api/admin/limpiar-predicciones",
                    {},
                    "¿Borrar TODAS las predicciones de TODOS los usuarios? Esto es irreversible.",
                  )
                }
                disabled={cargando}
              >
                {cargando ? "Borrando..." : "Borrar todo"}
              </button>
            </div>
          </div>
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
  pageHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    letterSpacing: 2,
  },
  mensajeBox: {
    border: "1px solid",
    borderRadius: 10,
    padding: "10px 16px",
    marginBottom: 16,
    fontSize: 14,
  },
  tabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 },
  tab: {
    background: "var(--blanco)",
    border: "1.5px solid #1a1a2e",
    color: "var(--texto-secundario)",
    padding: "7px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    outline: "none",
  },
  tabActivo: {
    background: "var(--gris-oscuro)",
    borderColor: "var(--gris-oscuro)",
    color: "var(--blanco)",
  },
  infoBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 1.6,
    color: "var(--texto-principal)",
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
  btnPequeno: {
    border: "none",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  seccionDesc: {
    fontSize: 14,
    color: "var(--texto-secundario)",
    marginBottom: 16,
  },
  select: {
    flex: 1,
    minWidth: 200,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--borde)",
    fontSize: 13,
    fontFamily: "var(--font-body)",
    outline: "none",
    background: "var(--blanco)",
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
