import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePartidos, useMisPredicciones } from "../hooks/useProde";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const MAIN_TABS = [
  { key: "grupos",        label: "Grupos" },
  { key: "eliminatorias", label: "Eliminatorias" },
];

const resumenDef = (totalPuntos, exactos, ganadores, cargados) => [
  { num: totalPuntos, label: "Puntos totales",   cls: "text-celeste-dark" },
  { num: exactos,     label: "Exactos",           cls: "text-success" },
  { num: ganadores,   label: "Ganadores",         cls: "text-celeste-dark" },
  { num: cargados,    label: "Prodes cargados",   cls: "text-foreground" },
];

// ---------- sub-componentes ----------

function FilaPrediccion({ partido, pred, predExistente, onGol }) {
  const id        = partido._id.toString();
  const yaJugo   = ["FT", "AET", "PEN"].includes(partido.estado);
  const enJuego  = ["1H", "2H", "HT", "ET", "BT"].includes(partido.estado);
  const bloqueado = yaJugo || enJuego || new Date(partido.fecha) <= new Date();

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 px-1">
      <div className="flex items-center gap-2">
        {partido.banderaLocal && (
          <img src={partido.banderaLocal} alt={partido.local}
            className="w-7 h-5 object-cover rounded-sm border border-border shrink-0"
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <span className="text-sm font-medium">{partido.local}</span>
      </div>

      <div className="flex justify-center">
        {yaJugo ? (
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-[22px]">
              {partido.golesLocal} - {partido.golesVisitante}
            </span>
            {predExistente && (
              <span className={cn(
                "badge-puntos",
                predExistente.puntos === 3 ? "badge-exacto"
                : predExistente.puntos === 1 ? "badge-ganador"
                : "badge-error"
              )}>
                {predExistente.puntos === 3 ? "⭐ 3"
                  : predExistente.puntos === 1 ? "✓ 1"
                  : predExistente.puntos === 0 ? "0" : "—"}
              </span>
            )}
          </div>
        ) : bloqueado ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[11px] text-muted-foreground italic">
              {enJuego ? "● En juego" : "Cerrado"}
            </span>
            {predExistente && (
              <span className="font-display text-lg text-celeste-dark">
                {predExistente.golesLocal} - {predExistente.golesVisitante}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="number" min="0" max="20" value={pred.local}
              onChange={(e) => onGol(id, "local", e.target.value)}
              className="w-11 h-9 text-center border-[1.5px] border-border rounded-lg text-base font-semibold outline-none focus:border-celeste bg-background transition-colors"
            />
            <span className="text-lg text-muted-foreground font-light">-</span>
            <input
              type="number" min="0" max="20" value={pred.visitante}
              onChange={(e) => onGol(id, "visitante", e.target.value)}
              className="w-11 h-9 text-center border-[1.5px] border-border rounded-lg text-base font-semibold outline-none focus:border-celeste bg-background transition-colors"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-medium">{partido.visitante}</span>
        {partido.banderaVisitante && (
          <img src={partido.banderaVisitante} alt={partido.visitante}
            className="w-7 h-5 object-cover rounded-sm border border-border shrink-0"
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
      </div>
    </div>
  );
}

function CardFooter({ error, guardando, label, onGuardar }) {
  return (
    <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-border flex-wrap">
      {error && <span className="text-[13px] text-error flex-1">⚠ {error}</span>}
      <Button
        onClick={onGuardar}
        disabled={guardando}
        className="bg-celeste text-white hover:bg-celeste-dark px-5 text-sm font-semibold"
      >
        {guardando ? "Guardando..." : label}
      </Button>
    </div>
  );
}

// ---------- página principal ----------

export default function MiProde() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { partidos, cargando: cargandoPartidos }          = usePartidos();
  const { predicciones, cargando: cargandoPreds, guardar } = useMisPredicciones();
  const [tab, setTab]             = useState("grupos");
  const [grupoActivo, setGrupoActivo] = useState("A");
  const [prodesLocal, setProdesLocal] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (predicciones.length === 0) return;
    const init = {};
    predicciones.forEach((p) => {
      const id = p.partidoId?.toString();
      if (id) init[id] = { local: p.golesLocal ?? 0, visitante: p.golesVisitante ?? 0 };
    });
    setProdesLocal((prev) => ({ ...init, ...prev }));
  }, [predicciones]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display text-[28px] tracking-[1px] mb-2">Tenés que iniciar sesión</h2>
        <p className="text-muted-foreground mb-5">Para cargar tus prodes necesitás estar logueado.</p>
        <Button
          className="bg-celeste text-white hover:bg-celeste-dark px-7 py-3 text-[15px] h-auto"
          onClick={() => loginWithRedirect()}
        >
          Entrar al prode
        </Button>
      </div>
    );
  }

  const gruposDisponibles = [
    ...new Set(
      partidos
        .map((p) => (p.grupo || "").replace("Grupo ", ""))
        .filter((g) => LETRAS.includes(g))
    ),
  ].sort();
  const grupos = gruposDisponibles.length > 0 ? gruposDisponibles : LETRAS;

  const grupoKey      = `Grupo ${grupoActivo}`;
  const partidosGrupo = partidos
    .filter((p) => p.grupo === grupoKey || p.ronda === grupoKey)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const esElim      = (p) => !p.grupo?.startsWith("Grupo") && !p.ronda?.startsWith("Grupo");
  const tieneEquipos = (p) => p.local !== "Por definir" && p.visitante !== "Por definir";
  const eliminatorias = partidos
    .filter((p) => esElim(p) && tieneEquipos(p))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const hayEliminatorias = eliminatorias.length > 0;

  const setGol = (partidoId, lado, valor) => {
    const n = parseInt(valor);
    const goles = isNaN(n) ? 0 : Math.max(0, Math.min(20, n));
    setProdesLocal((prev) => ({ ...prev, [partidoId]: { ...prev[partidoId], [lado]: goles } }));
    setGuardado(false);
  };

  const guardarLista = async (lista) => {
    setGuardando(true);
    setError("");
    try {
      const resultados = await Promise.all(
        lista
          .filter((p) => p.estado === "NS" && new Date(p.fecha) > new Date())
          .map((p) => {
            const id   = p._id.toString();
            const pred = prodesLocal[id] ?? { local: 0, visitante: 0 };
            return guardar(id, pred.local, pred.visitante);
          })
      );
      const errores = resultados.filter((r) => r?.error);
      if (errores.length > 0) setError(errores[0].error);
      else { setGuardado(true); setTimeout(() => setGuardado(false), 3000); }
    } catch {
      setError("Error al guardar, intentá de nuevo");
    } finally {
      setGuardando(false);
    }
  };

  const cargando    = cargandoPartidos || cargandoPreds;
  const totalPuntos = predicciones.reduce((acc, p) => acc + (p.puntos || 0), 0);
  const exactos     = predicciones.filter((p) => p.puntos === 3).length;
  const ganadores   = predicciones.filter((p) => p.puntos === 1).length;
  const cargados    = predicciones.length;

  const grupoCardHeader = (label) => (
    <div className="flex justify-between items-center mb-3.5">
      <span className="text-[11px] font-bold text-muted-foreground tracking-[1.5px] uppercase">
        {label}
      </span>
      {guardado && (
        <span className="text-xs font-semibold text-[#166534] bg-[#dcfce7] px-2.5 py-0.5 rounded-full">
          ✓ Guardado
        </span>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-[36px] tracking-[2px] mb-1">MI PRODE</h1>
      <p className="text-[13px] text-muted-foreground mb-5">Se cierra cuando empieza cada partido</p>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {resumenDef(totalPuntos, exactos, ganadores, cargados).map((item) => (
          <div key={item.label} className="bg-background border border-border rounded-[10px] p-3 text-center">
            <div className={cn("font-display text-[32px] leading-none", item.cls)}>{item.num}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {MAIN_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setGuardado(false); setError(""); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px",
              tab === t.key
                ? "text-foreground border-gris-oscuro font-semibold"
                : "text-muted-foreground border-transparent"
            )}
          >
            {t.label}
            {t.key === "eliminatorias" && hayEliminatorias && tab !== "eliminatorias" && (
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* TAB: GRUPOS */}
      {tab === "grupos" && (
        <>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {grupos.map((g) => (
              <button
                key={g}
                onClick={() => { setGrupoActivo(g); setGuardado(false); setError(""); }}
                className={cn(
                  "w-9 h-9 rounded-full border-[1.5px] border-border bg-background text-muted-foreground text-[13px] font-semibold flex items-center justify-center transition-all",
                  grupoActivo === g && "bg-gris-oscuro border-gris-oscuro text-white"
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="bg-background border border-border rounded-lg px-5 py-4 shadow-sm">
            {grupoCardHeader(`GRUPO ${grupoActivo}`)}

            {cargando ? (
              <div className="flex flex-col gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-lg" />
                ))}
              </div>
            ) : partidosGrupo.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Los partidos de este grupo aún no están cargados
              </div>
            ) : (
              <div>
                {partidosGrupo.map((partido, i) => {
                  const id           = partido._id.toString();
                  const pred         = prodesLocal[id] ?? { local: 0, visitante: 0 };
                  const predExistente = predicciones.find((p) => p.partidoId?.toString() === id);
                  return (
                    <div key={id}>
                      {i > 0 && <div className="h-px bg-border -mx-1" />}
                      <FilaPrediccion partido={partido} pred={pred} predExistente={predExistente} onGol={setGol} />
                    </div>
                  );
                })}
              </div>
            )}

            {!cargando && partidosGrupo.some((p) => p.estado === "NS" && new Date(p.fecha) > new Date()) && (
              <CardFooter
                error={error}
                guardando={guardando}
                label={`Actualizar Grupo ${grupoActivo}`}
                onGuardar={() => guardarLista(partidosGrupo)}
              />
            )}
          </div>
        </>
      )}

      {/* TAB: ELIMINATORIAS */}
      {tab === "eliminatorias" && (
        <div className="bg-background border border-border rounded-lg px-5 py-4 shadow-sm">
          {grupoCardHeader("FASE ELIMINATORIA")}

          {cargando ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
          ) : !hayEliminatorias ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Los cruces se confirman cuando terminen los grupos. Volvé una vez que avance el torneo.
            </div>
          ) : (
            <>
              <div>
                {eliminatorias.map((partido, i) => {
                  const id            = partido._id.toString();
                  const pred          = prodesLocal[id] ?? { local: 0, visitante: 0 };
                  const predExistente = predicciones.find((p) => p.partidoId?.toString() === id);
                  const ronda         = partido.ronda || partido.grupo || "";
                  const mostrarRonda  = i === 0 || (eliminatorias[i - 1].ronda || eliminatorias[i - 1].grupo) !== ronda;
                  return (
                    <div key={id}>
                      {mostrarRonda && (
                        <div className="text-[11px] font-bold text-muted-foreground tracking-[1.5px] uppercase px-1 pt-2.5 pb-1 border-t border-border mt-1">
                          {ronda}
                        </div>
                      )}
                      {!mostrarRonda && <div className="h-px bg-border -mx-1" />}
                      <FilaPrediccion partido={partido} pred={pred} predExistente={predExistente} onGol={setGol} />
                    </div>
                  );
                })}
              </div>

              {eliminatorias.some((p) => p.estado === "NS" && new Date(p.fecha) > new Date()) && (
                <CardFooter
                  error={error}
                  guardando={guardando}
                  label="Guardar eliminatorias"
                  onGuardar={() => guardarLista(eliminatorias)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
