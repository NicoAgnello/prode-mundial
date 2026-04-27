import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TABS_ADMIN = [
  { key: "principal",  label: "⚙️ Principal" },
  { key: "usuarios",   label: "👥 Usuarios" },
  { key: "partidos",   label: "⚽ Partidos" },
  { key: "utilidades", label: "🔧 Utilidades" },
  { key: "grupos",     label: "🔑 Grupos" },
];

function InfoBox({ children }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-[10px] px-4 py-3 mb-5 text-sm leading-relaxed text-foreground">
      {children}
    </div>
  );
}

function AccionCard({ icono, titulo, desc, children }) {
  return (
    <div className="bg-background border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
      <div className="text-[28px]">{icono}</div>
      <div className="font-semibold text-[15px]">{titulo}</div>
      <div className="text-[13px] text-muted-foreground leading-relaxed flex-1">{desc}</div>
      {children}
    </div>
  );
}

function CodigoBadge({ children }) {
  return (
    <span className="font-mono font-bold tracking-[2px] text-[13px] bg-celeste-light text-celeste-dark px-2 py-0.5 rounded-md">
      {children}
    </span>
  );
}

function GruposAdmin({ llamarPost, cargando, userId }) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [grupos, setGrupos] = useState([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(true);

  useEffect(() => { cargarGrupos(); }, []);

  const cargarGrupos = async () => {
    setCargandoGrupos(true);
    try {
      const res = await fetch("/api/admin/acciones", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-id": userId },
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
    await llamarPost("/api/admin/acciones", { action: "crear-grupo", nombre, codigo }, null);
    setNombre("");
    setCodigo("");
    cargarGrupos();
  };

  return (
    <div>
      <InfoBox>
        <strong>🔑 Grupos de participantes.</strong> Creá un código por grupo y
        compartíselo a cada grupo de personas que quiera participar en su propio
        ranking separado.
      </InfoBox>

      <div className="bg-background border border-border rounded-2xl p-5 shadow-sm mb-5">
        <div className="font-semibold text-[15px] mb-1">Crear nuevo grupo</div>
        <div className="text-[13px] text-muted-foreground mb-3">
          El código es lo que los usuarios van a ingresar para unirse. Usá algo fácil de recordar.
        </div>
        <div className="flex flex-col gap-2.5">
          <input
            placeholder="Nombre del grupo (ej: Leibnitz 2026)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-celeste transition-colors bg-background"
          />
          <input
            placeholder="Código (ej: LEIBNITZ2026)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            maxLength={20}
            className="px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-celeste transition-colors bg-background tracking-[2px] font-bold"
          />
          <Button
            onClick={crearGrupo}
            disabled={cargando || !nombre.trim() || !codigo.trim()}
            className="bg-gris-oscuro text-white hover:bg-gris-oscuro/90 self-start"
          >
            {cargando ? "Creando..." : "Crear grupo"}
          </Button>
        </div>
      </div>

      <div className="font-semibold text-[15px] mb-1">Grupos existentes</div>
      <p className="text-[13px] text-muted-foreground mb-3">
        Estos son los grupos creados. Compartí el código con cada grupo de participantes.
      </p>

      {cargandoGrupos ? (
        <div className="text-[13px] text-muted-foreground">Cargando grupos...</div>
      ) : grupos.length === 0 ? (
        <div className="text-center py-8 bg-background border border-border rounded-xl text-sm text-muted-foreground">
          No hay grupos creados todavía
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                {["Nombre", "Código", "Miembros", "Creado"].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.map((g) => (
                <TableRow key={g._id}>
                  <TableCell className="font-semibold">{g.nombre}</TableCell>
                  <TableCell><CodigoBadge>{g.codigo}</CodigoBadge></TableCell>
                  <TableCell>
                    <span className="font-semibold">{g.miembros}</span>
                    <span className="text-muted-foreground text-xs"> usuarios</span>
                  </TableCell>
                  <TableCell>{g.creadoAt ? new Date(g.creadoAt).toLocaleDateString("es-AR") : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth0();
  const [partidos, setPartidos]   = useState([]);
  const [usuarios, setUsuarios]   = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [mensaje, setMensaje]     = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("ok");
  const [seccion, setSeccion]     = useState("principal");
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
      .then((data) => { if (Array.isArray(data)) setPartidos(data); });
  };

  const cargarUsuarios = () => {
    fetch("/api/admin/usuarios", {
      method: "GET",
      headers: { "x-admin-id": user?.sub || "" },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsuarios(data); });
  };

  const mostrarMensaje = (msg, tipo = "ok") => {
    setMensaje(msg);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(""), 5000);
  };

  const llamarPost = async (url, body = {}, confirmMsg = null) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setCargando(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-id": user.sub },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      mostrarMensaje(data.mensaje || data.error, res.ok ? "ok" : "error");
      cargarPartidos();
      cargarUsuarios();
    } catch (e) {
      clearTimeout(timer);
      if (e.name === "AbortError") {
        mostrarMensaje("Tiempo de espera agotado. Verificá la conexión a la DB y reintentá.", "error");
      } else {
        mostrarMensaje("Error de conexión: " + e.message, "error");
      }
    } finally {
      setCargando(false);
    }
  };

  const verPrediccionesPartido = async () => {
    if (!partidoSeleccionado) return;
    const res = await fetch(`/api/admin/predicciones-partido?partidoId=${partidoSeleccionado}`, {
      headers: { "x-admin-id": user?.sub || "" },
    });
    const data = await res.json();
    if (Array.isArray(data)) setPrediccionesPartido(data);
    else mostrarMensaje(data.error, "error");
  };

  if (!isAuthenticated || !esAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-5xl mb-3">🚫</div>
        <h2 className="font-display text-[28px] tracking-[1px] mb-2">Acceso restringido</h2>
        <p className="text-muted-foreground">Esta sección es solo para administradores.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <h1 className="font-display text-[36px] tracking-[2px]">PANEL ADMIN</h1>
        <span className="text-[13px] text-muted-foreground">
          {usuarios.length} usuarios · {partidos.length} partidos
        </span>
      </div>

      {mensaje && (
        <div className={cn(
          "border rounded-[10px] px-4 py-2.5 mb-4 text-sm",
          tipoMensaje === "ok"
            ? "bg-[#dcfce7] text-[#166534] border-[#86efac]"
            : "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]"
        )}>
          {tipoMensaje === "ok" ? "✓" : "⚠"} {mensaje}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {TABS_ADMIN.map((t) => (
          <button
            key={t.key}
            onClick={() => setSeccion(t.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg border-[1.5px] text-[13px] font-medium transition-all",
              seccion === t.key
                ? "bg-gris-oscuro border-gris-oscuro text-white font-semibold"
                : "bg-background border-border text-muted-foreground"
            )}
          >
            {t.key === "usuarios" ? `👥 Usuarios (${usuarios.length})` :
             t.key === "partidos" ? `⚽ Partidos (${partidos.length})` : t.label}
          </button>
        ))}
      </div>

      {/* PRINCIPAL */}
      {seccion === "principal" && (
        <div>
          <InfoBox>
            <strong>📋 Flujo normal del Mundial:</strong>
            <ol className="mt-2 ml-5 leading-loose list-decimal">
              <li>Cargá los partidos del Mundial antes de que empiece (junio 2026)</li>
              <li>Los participantes cargan sus prodes en la sección Partidos</li>
              <li>Durante el torneo, sincronizá los resultados manualmente desde acá cuando quieras.</li>
              <li>La sincronización bloquea predicciones y calcula puntos sola — no hace falta recalcular aparte.</li>
            </ol>
          </InfoBox>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <AccionCard icono="⚽" titulo="Cargar Mundial 2026" desc={
              <>
                Carga los 72 partidos de fase de grupos con fechas, grupos y banderas reales.
                <strong className="text-red-500 block mt-1">⚠ Esto borra los partidos de prueba existentes.</strong>
              </>
            }>
              <Button
                className="bg-gris-oscuro text-white hover:bg-gris-oscuro/90 mt-1"
                disabled={cargando}
                onClick={() => llamarPost("/api/admin/cargar-mundial", {}, "¿Cargar los partidos del Mundial? Esto va a borrar los partidos actuales.")}
              >
                {cargando ? "Cargando..." : "Cargar partidos"}
              </Button>
            </AccionCard>

            <AccionCard icono="🔄" titulo="Sincronizar resultados" desc="Trae los resultados desde football-data.org, bloquea las predicciones de partidos que ya empezaron y calcula los puntos automáticamente. El cron lo corre solo cada 30 min durante el Mundial.">
              <Button
                className="bg-gris-oscuro text-white hover:bg-gris-oscuro/90 mt-1"
                disabled={cargando}
                onClick={() => llamarPost("/api/admin/sincronizar", {})}
              >
                {cargando ? "Sincronizando..." : "Sincronizar ahora"}
              </Button>
            </AccionCard>

            <AccionCard icono="🗑️" titulo="Limpiar partidos" desc={
              <>
                Borra todos los partidos de la base de datos.
                <strong className="text-red-500 block mt-1">⚠ Acción irreversible. Las predicciones quedan huérfanas.</strong>
              </>
            }>
              <Button
                className="bg-red-500 text-white hover:bg-red-600 mt-1"
                disabled={cargando}
                onClick={() => llamarPost("/api/admin/acciones", { action: "limpiar-partidos" }, "¿Seguro? Esto borra TODOS los partidos y es irreversible.")}
              >
                Limpiar todo
              </Button>
            </AccionCard>
          </div>
        </div>
      )}

      {/* USUARIOS */}
      {seccion === "usuarios" && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Lista de todos los usuarios registrados. Podés ver sus estadísticas y borrar sus predicciones si hay algún problema.
          </p>
          {usuarios.length === 0 ? (
            <div className="text-center py-8 bg-background border border-border rounded-xl text-sm text-muted-foreground">
              No hay usuarios registrados todavía
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Usuario", "Email", "Grupo", "Prodes", "Puntos", "Último acceso", "Acciones"].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.userId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {u.foto && <img src={u.foto} alt="" className="w-7 h-7 rounded-full" />}
                          <span className="font-medium">{u.nombre || "Sin nombre"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-md",
                          u.grupoNombre === "—"
                            ? "bg-slate-100 text-muted-foreground"
                            : "bg-celeste-light text-celeste-dark"
                        )}>
                          {u.grupoNombre}
                        </span>
                      </TableCell>
                      <TableCell>{u.totalPredicciones}</TableCell>
                      <TableCell className="font-bold text-celeste-dark">{u.puntos} pts</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("es-AR") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <button
                            className="bg-[#fee2e2] text-[#991b1b] border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer"
                            onClick={() => llamarPost("/api/admin/acciones", { action: "limpiar-predicciones", targetUserId: u.userId }, `¿Borrar todas las predicciones de ${u.nombre}? Esta acción es irreversible.`)}
                          >
                            Borrar prodes
                          </button>
                          <button
                            className="bg-[#fef3c7] text-[#92400e] border-0 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer"
                            onClick={() => llamarPost("/api/admin/acciones", { action: "resetear-grupo", targetUserId: u.userId }, `¿Resetear el grupo de ${u.nombre}? Podrá ingresar un nuevo código.`)}
                          >
                            Resetear grupo
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* PARTIDOS */}
      {seccion === "partidos" && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Lista de partidos en la base de datos. Los partidos con fondo amarillo son de Argentina.
          </p>

          <div className="bg-background border border-border rounded-2xl p-5 shadow-sm mb-4">
            <div className="font-semibold text-[15px] mb-1">🔍 Ver predicciones de un partido</div>
            <div className="text-[13px] text-muted-foreground mb-3">
              Seleccioná un partido para ver qué pronosticó cada participante.
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={partidoSeleccionado}
                onChange={(e) => { setPartidoSeleccionado(e.target.value); setPrediccionesPartido([]); }}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-celeste transition-colors bg-background"
              >
                <option value="">— Seleccioná un partido —</option>
                {partidos.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.local} vs {p.visitante} ({p.grupo})
                    {p.estado === "FT" ? ` — ${p.golesLocal}-${p.golesVisitante}` : " — Pendiente"}
                  </option>
                ))}
              </select>
              <Button
                className="bg-gris-oscuro text-white hover:bg-gris-oscuro/90"
                onClick={verPrediccionesPartido}
                disabled={!partidoSeleccionado || cargando}
              >
                Ver predicciones
              </Button>
            </div>

            {prediccionesPartido.length > 0 && (
              <div className="overflow-x-auto border border-border rounded-xl mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["Usuario", "Pronóstico", "Puntos", "Cargado"].map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prediccionesPartido.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {p.foto && <img src={p.foto} alt="" className="w-6 h-6 rounded-full" />}
                            {p.nombre}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{p.golesLocal} - {p.golesVisitante}</TableCell>
                        <TableCell>
                          {p.puntos === null ? (
                            <span className="text-muted-foreground">Pendiente</span>
                          ) : p.puntos === 3 ? (
                            <span className="text-[#166534] font-bold">⭐ 3 pts</span>
                          ) : p.puntos === 1 ? (
                            <span className="text-[#1e40af] font-bold">✓ 1 pt</span>
                          ) : (
                            <span className="text-muted-foreground">0 pts</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(p.createdAt).toLocaleDateString("es-AR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {partidoSeleccionado && prediccionesPartido.length === 0 && (
              <p className="text-muted-foreground text-[13px] mt-3">Nadie cargó prode para este partido todavía.</p>
            )}
          </div>

          {partidos.length === 0 ? (
            <div className="text-center py-8 bg-background border border-border rounded-xl text-sm text-muted-foreground">
              No hay partidos — usá "Cargar Mundial 2026" en la sección Principal
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Grupo", "Local", "Visitante", "Fecha", "Estado", "Resultado"].map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partidos.map((p) => (
                    <TableRow
                      key={p._id}
                      className={p.local === "Argentina" || p.visitante === "Argentina" ? "bg-amber-50" : ""}
                    >
                      <TableCell className="text-muted-foreground text-sm">{p.grupo}</TableCell>
                      <TableCell>{p.local}</TableCell>
                      <TableCell>{p.visitante}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(p.fecha).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-[11px] px-2 py-0.5 rounded-md font-semibold",
                          p.estado === "FT" ? "bg-[#dcfce7] text-[#166534]" : "bg-slate-100 text-slate-500"
                        )}>
                          {p.estado === "FT" ? "Terminado" : p.estado === "NS" ? "Pendiente" : p.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.estado === "FT" ? `${p.golesLocal} - ${p.golesVisitante}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* UTILIDADES */}
      {seccion === "utilidades" && (
        <div>
          <InfoBox>
            <strong>🔧 Estas herramientas son para casos de emergencia.</strong>{" "}
            Usálas solo si hay un problema específico con un usuario o con los puntos.
          </InfoBox>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            <AccionCard icono="🔁" titulo="Resetear todos los puntos" desc={
              <>
                Pone todos los puntos en null para poder recalcular desde cero.
                <strong className="text-amber-700 block mt-1">⚠ Después usá el botón "Recalcular puntos" más abajo.</strong>
              </>
            }>
              <Button
                className="bg-amber-500 text-white hover:bg-amber-600 mt-1"
                disabled={cargando}
                onClick={() => llamarPost("/api/admin/acciones", { action: "resetear-puntos" }, "¿Resetear todos los puntos? Después tenés que recalcular manualmente.")}
              >
                {cargando ? "Reseteando..." : "Resetear puntos"}
              </Button>
            </AccionCard>

            <AccionCard icono="🏆" titulo="Recalcular puntos" desc={
              <>
                Recalcula puntos manualmente para todos los partidos terminados.
                <strong className="text-amber-700 block mt-1">⚠ Solo necesario si algo falló en la sincronización automática.</strong>
              </>
            }>
              <Button
                className="bg-gris-oscuro text-white hover:bg-gris-oscuro/90 mt-1"
                disabled={cargando}
                onClick={() => llamarPost("/api/admin/acciones", { action: "recalcular" })}
              >
                {cargando ? "Calculando..." : "Recalcular"}
              </Button>
            </AccionCard>

            <AccionCard icono="🗑️" titulo="Borrar todas las predicciones" desc={
              <>
                Borra las predicciones de todos los usuarios.
                <strong className="text-red-500 block mt-1">⚠ Acción irreversible. Para borrar las de un usuario específico usá la sección Usuarios.</strong>
              </>
            }>
              <Button
                className="bg-red-500 text-white hover:bg-red-600 mt-1"
                disabled={cargando}
                onClick={() => llamarPost("/api/admin/acciones", { action: "limpiar-predicciones" }, "¿Borrar TODAS las predicciones de TODOS los usuarios? Esto es irreversible.")}
              >
                {cargando ? "Borrando..." : "Borrar todo"}
              </Button>
            </AccionCard>
          </div>
        </div>
      )}

      {seccion === "grupos" && (
        <GruposAdmin llamarPost={llamarPost} cargando={cargando} userId={user.sub} />
      )}
    </div>
  );
}
