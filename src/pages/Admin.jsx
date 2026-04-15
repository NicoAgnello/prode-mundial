import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function GruposAdmin({ llamarPost, cargando, userId }) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [grupos, setGrupos] = useState([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(true);

  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    setCargandoGrupos(true);
    try {
      const res = await fetch("/api/admin/acciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": userId,
        },
        body: JSON.stringify({ action: "listar-grupos" }),
      });
      const data = await res.json();
      if (data.grupos) setGrupos(data.grupos);
    } catch {
    } finally {
      setCargandoGrupos(false);
    }
  };

  const crearGrupo = async () => {
    await llamarPost(
      "/api/admin/acciones",
      { action: "crear-grupo", nombre, codigo },
      null,
    );
    setNombre("");
    setCodigo("");
    cargarGrupos();
  };

  return (
    <div>
      <div style={styles.infoBox}>
        <strong>🔑 Grupos de participantes.</strong> Creá un código por grupo y
        compartíselo a cada grupo de personas que quiera participar en su propio
        ranking separado.
      </div>

      {/* Crear grupo */}
      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={styles.cardTitulo}>Crear nuevo grupo</div>
        <div style={styles.cardDesc}>
          El código es lo que los usuarios van a ingresar para unirse. Usá algo
          fácil de recordar.
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 8,
          }}
        >
          <input
            placeholder="Nombre del grupo (ej: Leibnitz 2026)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={styles.select}
          />
          <input
            placeholder="Código (ej: LEIBNITZ2026)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            maxLength={20}
            style={{ ...styles.select, letterSpacing: 2, fontWeight: 700 }}
          />
          <button
            style={styles.btn}
            disabled={cargando || !nombre.trim() || !codigo.trim()}
            onClick={crearGrupo}
          >
            {cargando ? "Creando..." : "Crear grupo"}
          </button>
        </div>
      </div>

      {/* Lista de grupos */}
      <div style={styles.cardTitulo}>Grupos existentes</div>
      <p style={{ ...styles.seccionDesc, marginTop: 4 }}>
        Estos son los grupos creados. Compartí el código con cada grupo de
        participantes.
      </p>
      {cargandoGrupos ? (
        <div style={{ color: "var(--texto-secundario)", fontSize: 13 }}>
          Cargando grupos...
        </div>
      ) : grupos.length === 0 ? (
        <div style={styles.vacio}>No hay grupos creados todavía</div>
      ) : (
        <div style={styles.tablaWrapper}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                {["Nombre", "Código", "Miembros", "Creado"].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => (
                <tr key={g._id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{g.nombre}</strong>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        letterSpacing: 2,
                        fontSize: 13,
                        background: "var(--celeste-light)",
                        color: "var(--celeste-dark)",
                        padding: "2px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {g.codigo}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 600 }}>{g.miembros}</span>
                    <span
                      style={{ color: "var(--texto-secundario)", fontSize: 12 }}
                    >
                      {" "}
                      usuarios
                    </span>
                  </td>
                  <td style={styles.td}>
                    {g.creadoAt
                      ? new Date(g.creadoAt).toLocaleDateString("es-AR")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
      method: "GET",
      headers: { "x-admin-id": user?.sub || "" },
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
          "x-admin-id": user.sub,
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
      { headers: { "x-admin-id": user?.sub || "" } },
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

      <div style={styles.tabs}>
        {[
          { key: "principal", label: "⚙️ Principal" },
          { key: "usuarios", label: `👥 Usuarios (${usuarios.length})` },
          { key: "partidos", label: `⚽ Partidos (${partidos.length})` },
          { key: "utilidades", label: "🔧 Utilidades" },
          { key: "grupos", label: "🔑 Grupos" },
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

      {/* PRINCIPAL */}
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
                Durante el torneo, sincronizá los resultados manualmente desde
                acá cuando quieras.
              </li>
              <li>
                La sincronización bloquea predicciones y calcula puntos sola —
                no hace falta recalcular aparte.
              </li>
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
                disabled={cargando}
                onClick={() =>
                  llamarPost(
                    "/api/admin/cargar-mundial",
                    {},
                    "¿Cargar los partidos del Mundial? Esto va a borrar los partidos actuales.",
                  )
                }
              >
                {cargando ? "Cargando..." : "Cargar partidos"}
              </button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcono}>🔄</div>
              <div style={styles.cardTitulo}>Sincronizar resultados</div>
              <div style={styles.cardDesc}>
                Trae los resultados desde football-data.org, bloquea las
                predicciones de partidos que ya empezaron y calcula los puntos
                automáticamente. El cron lo corre solo cada 30 min durante el
                Mundial.
              </div>
              <button
                style={styles.btn}
                disabled={cargando}
                onClick={() => llamarPost("/api/admin/sincronizar", {})}
              >
                {cargando ? "Sincronizando..." : "Sincronizar ahora"}
              </button>
            </div>


            <div style={styles.card}>
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
                disabled={cargando}
                onClick={() =>
                  llamarPost(
                    "/api/admin/acciones",
                    { action: "limpiar-partidos" },
                    "¿Seguro? Esto borra TODOS los partidos y es irreversible.",
                  )
                }
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USUARIOS */}
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
                      "Grupo",
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
                      <td style={styles.td}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color:
                              u.grupoNombre === "—"
                                ? "var(--texto-secundario)"
                                : "var(--celeste-dark)",
                            background:
                              u.grupoNombre === "—"
                                ? "#f1f5f9"
                                : "var(--celeste-light)",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {u.grupoNombre}
                        </span>
                      </td>
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
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <button
                            style={{
                              ...styles.btnPequeno,
                              background: "#fee2e2",
                              color: "#991b1b",
                            }}
                            onClick={() =>
                              llamarPost(
                                "/api/admin/acciones",
                                {
                                  action: "limpiar-predicciones",
                                  targetUserId: u.userId,
                                },
                                `¿Borrar todas las predicciones de ${u.nombre}? Esta acción es irreversible.`,
                              )
                            }
                          >
                            Borrar prodes
                          </button>
                          <button
                            style={{
                              ...styles.btnPequeno,
                              background: "#fef3c7",
                              color: "#92400e",
                            }}
                            onClick={() =>
                              llamarPost(
                                "/api/admin/acciones",
                                { action: "resetear-grupo", targetUserId: u.userId },
                                `¿Resetear el grupo de ${u.nombre}? Podrá ingresar un nuevo código.`,
                              )
                            }
                          >
                            Resetear grupo
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PARTIDOS */}
      {seccion === "partidos" && (
        <div>
          <p style={styles.seccionDesc}>
            Lista de partidos en la base de datos. Los partidos con fondo
            amarillo son de Argentina.
          </p>
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

      {/* UTILIDADES */}
      {seccion === "utilidades" && (
        <div>
          <div style={styles.infoBox}>
            <strong>🔧 Estas herramientas son para casos de emergencia.</strong>{" "}
            Usálas solo si hay un problema específico con un usuario o con los
            puntos.
          </div>
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardIcono}>🔁</div>
              <div style={styles.cardTitulo}>Resetear todos los puntos</div>
              <div style={styles.cardDesc}>
                Pone todos los puntos en null para poder recalcular desde cero.
                <strong
                  style={{ color: "#92400e", display: "block", marginTop: 4 }}
                >
                  ⚠ Después usá el botón "Recalcular puntos" más abajo.
                </strong>
              </div>
              <button
                style={{ ...styles.btn, background: "#f59e0b" }}
                disabled={cargando}
                onClick={() =>
                  llamarPost(
                    "/api/admin/acciones",
                    { action: "resetear-puntos" },
                    "¿Resetear todos los puntos? Después tenés que recalcular manualmente.",
                  )
                }
              >
                {cargando ? "Reseteando..." : "Resetear puntos"}
              </button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcono}>🏆</div>
              <div style={styles.cardTitulo}>Recalcular puntos</div>
              <div style={styles.cardDesc}>
                Recalcula puntos manualmente para todos los partidos terminados.
                <strong
                  style={{ color: "#92400e", display: "block", marginTop: 4 }}
                >
                  ⚠ Solo necesario si algo falló en la sincronización automática.
                </strong>
              </div>
              <button
                style={styles.btn}
                disabled={cargando}
                onClick={() =>
                  llamarPost("/api/admin/acciones", { action: "recalcular" })
                }
              >
                {cargando ? "Calculando..." : "Recalcular"}
              </button>
            </div>

            <div style={styles.card}>
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
                disabled={cargando}
                onClick={() =>
                  llamarPost(
                    "/api/admin/acciones",
                    { action: "limpiar-predicciones" },
                    "¿Borrar TODAS las predicciones de TODOS los usuarios? Esto es irreversible.",
                  )
                }
              >
                {cargando ? "Borrando..." : "Borrar todo"}
              </button>
            </div>
          </div>
        </div>
      )}
      {seccion === "grupos" && (
        <GruposAdmin
          llamarPost={llamarPost}
          cargando={cargando}
          userId={user.sub}
        />
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
    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
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
