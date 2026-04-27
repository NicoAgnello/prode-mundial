import { useState, useEffect, useMemo } from "react";
import { usePartidos, usePosiciones } from "../hooks/useProde";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const MAIN_TABS = [
  { key: "fixture",       label: "Fixture" },
  { key: "posiciones",    label: "Posiciones" },
  { key: "eliminatorias", label: "Eliminatorias" },
];

const FASES_ELIM = [
  { key: "r32",   label: "16avos",    keys: ["Round of 32", "16avos"] },
  { key: "r16",   label: "Octavos",   keys: ["Round of 16", "Octavos"] },
  { key: "qf",    label: "Cuartos",   keys: ["Quarter", "Cuartos"] },
  { key: "sf",    label: "Semis",     keys: ["Semi", "Semis"] },
  { key: "final", label: "Final",     keys: ["Final"] },
  { key: "3er",   label: "3° Puesto", keys: ["Third", "3er", "3°", "Tercer"] },
];

// ---------- sub-componentes ----------

function GrupoSelector({ grupos, activo, onSelect }) {
  return (
    <div className="flex gap-1.5 flex-wrap mb-4">
      {grupos.map((g) => (
        <button
          key={g}
          onClick={() => onSelect(g)}
          className={cn(
            "w-9 h-9 rounded-full border-[1.5px] border-border bg-background text-muted-foreground text-[13px] font-semibold flex items-center justify-center transition-all",
            activo === g && "bg-gris-oscuro border-gris-oscuro text-white"
          )}
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

  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  const hora  = new Date(partido.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

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

      <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
        {yaJugo || enJuego ? (
          <span className="font-display text-[22px]">
            {partido.golesLocal ?? "-"}
            <span className="text-muted-foreground mx-1">-</span>
            {partido.golesVisitante ?? "-"}
          </span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-[13px] text-muted-foreground font-medium">{fecha}</span>
            <span className="text-[11px] text-muted-foreground">{hora}</span>
          </div>
        )}
        {enJuego && (
          <span className="text-[10px] font-bold text-error" style={{ animation: "pulse 1.5s infinite" }}>
            ● EN VIVO
          </span>
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

function TablaGrupo({ equipos }) {
  if (!equipos || equipos.length === 0) {
    return <div className="text-center py-8 text-sm text-muted-foreground">Cargando posiciones...</div>;
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-10">#</TableHead>
            <TableHead>Equipo</TableHead>
            {["PJ", "G", "E", "P", "DG", "Pts"].map((h) => (
              <TableHead key={h} className="text-center">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipos.map((eq, i) => (
            <TableRow key={eq.nombre} className={i < 2 ? "bg-green-50" : ""}>
              <TableCell className="text-center text-muted-foreground font-semibold">{i + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {eq.bandera && (
                    <img src={eq.bandera} alt={eq.nombre}
                      className="w-6 h-4 object-cover rounded-sm border border-border shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                  <span className="font-medium">{eq.nombre}</span>
                </div>
              </TableCell>
              {[eq.pj, eq.g, eq.e, eq.p, eq.dg, eq.pts].map((v, j) => (
                <TableCell key={j} className={cn(
                  "text-center",
                  j === 5 ? "font-bold text-foreground" : "text-muted-foreground"
                )}>
                  {v}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CruceCard({ partido }) {
  const yaJugo  = ["FT", "AET", "PEN"].includes(partido.estado);
  const enJuego = ["1H", "2H", "HT", "ET", "BT"].includes(partido.estado);
  const pendiente = (nombre) => !nombre || nombre === "Por definir";

  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" });
  const hora  = new Date(partido.fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-background border border-border rounded-lg px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 shadow-sm">
      <div className="flex items-center gap-2">
        {partido.banderaLocal && !pendiente(partido.local) && (
          <img src={partido.banderaLocal} alt={partido.local}
            className="w-7 h-5 object-cover rounded-sm border border-border shrink-0"
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
        <span className={pendiente(partido.local) ? "text-[13px] text-muted-foreground italic" : "text-sm font-semibold"}>
          {pendiente(partido.local) ? "Por definir" : partido.local}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 min-w-[90px]">
        {yaJugo || enJuego ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-[22px]">
              {partido.golesLocal ?? "–"} - {partido.golesVisitante ?? "–"}
            </span>
            {yaJugo  && <span className="text-[10px] font-bold text-muted-foreground tracking-wide uppercase">FIN</span>}
            {enJuego && <span className="text-[10px] font-bold text-error" style={{ animation: "pulse 1.5s infinite" }}>● EN VIVO</span>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[12px] text-muted-foreground font-medium capitalize">{fecha}</span>
            <span className="text-[13px] font-semibold">{hora}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className={pendiente(partido.visitante) ? "text-[13px] text-muted-foreground italic" : "text-sm font-semibold"}>
          {pendiente(partido.visitante) ? "Por definir" : partido.visitante}
        </span>
        {partido.banderaVisitante && !pendiente(partido.visitante) && (
          <img src={partido.banderaVisitante} alt={partido.visitante}
            className="w-7 h-5 object-cover rounded-sm border border-border shrink-0"
            onError={(e) => { e.target.style.display = "none"; }} />
        )}
      </div>
    </div>
  );
}

function Eliminatorias({ partidos }) {
  const porFase = useMemo(() => {
    const map = {};
    for (const fase of FASES_ELIM) {
      map[fase.key] = partidos
        .filter((p) => fase.keys.some((k) => p.ronda?.includes(k) || p.grupo?.includes(k)))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }
    return map;
  }, [partidos]);

  const fasesConDatos = FASES_ELIM.filter((f) => porFase[f.key].length > 0);
  const [faseActiva, setFaseActiva] = useState("r32");

  useEffect(() => {
    if (fasesConDatos.length > 0) {
      setFaseActiva(fasesConDatos[fasesConDatos.length - 1].key);
    }
  }, [partidos.length]);

  const partidosFase = porFase[faseActiva] ?? [];

  if (partidos.length === 0) {
    return (
      <div className="flex gap-2.5 items-start bg-celeste-light border border-celeste rounded-[10px] px-3.5 py-2.5 mb-4 text-sm leading-relaxed">
        <span className="text-xl">⏳</span>
        <span>Los cruces se definen cuando terminen los grupos. Volvé en junio de 2026.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-1 flex-wrap mb-4">
        {FASES_ELIM.map((f) => {
          const tiene = porFase[f.key].length > 0;
          return (
            <button
              key={f.key}
              onClick={() => setFaseActiva(f.key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium transition-all",
                faseActiva === f.key
                  ? "bg-gris-oscuro border-gris-oscuro text-white font-semibold"
                  : "bg-background border-border text-muted-foreground",
                !tiene && "opacity-40"
              )}
            >
              {f.label}
              {tiene && <span className="w-1.5 h-1.5 rounded-full bg-success inline-block shrink-0" />}
            </button>
          );
        })}
      </div>

      {partidosFase.length === 0 ? (
        <div className="text-center py-8 px-4 text-sm text-muted-foreground">
          Los partidos de esta fase aún no están definidos
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {partidosFase.map((p) => (
            <CruceCard key={p._id} partido={p} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- página principal ----------

export default function Fixture() {
  const { partidos, cargando }              = usePartidos();
  const { posiciones, cargando: cargandoPos } = usePosiciones();
  const [tab, setTab]                       = useState("fixture");
  const [grupoActivo, setGrupoActivo]       = useState("A");

  const gruposDisponibles = [
    ...new Set(
      partidos
        .map((p) => (p.grupo || p.ronda || "").replace("Grupo ", ""))
        .filter((g) => LETRAS.includes(g))
    ),
  ].sort();
  const grupos = gruposDisponibles.length > 0 ? gruposDisponibles : LETRAS;

  const grupoKey         = `Grupo ${grupoActivo}`;
  const partidosGrupo    = partidos
    .filter((p) => p.grupo === grupoKey || p.ronda === grupoKey)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const eliminatoriaPartidos = partidos.filter(
    (p) => !p.grupo?.startsWith("Grupo") && !p.ronda?.startsWith("Grupo")
  );

  return (
    <div>
      <h1 className="font-display text-[36px] tracking-[2px] mb-4">FIXTURE</h1>

      {/* Tabs principales — estilo underline */}
      <div className="flex border-b border-border mb-4">
        {MAIN_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px",
              tab === t.key
                ? "text-foreground border-gris-oscuro font-semibold"
                : "text-muted-foreground border-transparent"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "eliminatorias" && (
        <GrupoSelector grupos={grupos} activo={grupoActivo} onSelect={setGrupoActivo} />
      )}

      {tab === "fixture" && (
        <div className="bg-background border border-border rounded-lg px-5 py-4 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground tracking-[1.5px] uppercase mb-3">
            GRUPO {grupoActivo}
          </div>
          {cargando ? (
            <div className="flex flex-col gap-0.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-[52px] rounded-lg" />
              ))}
            </div>
          ) : partidosGrupo.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No hay partidos cargados todavía
            </div>
          ) : (
            <div>
              {partidosGrupo.map((p, i) => (
                <div key={p._id}>
                  {i > 0 && <div className="h-px bg-border -mx-1" />}
                  <FilaPartido partido={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "posiciones" && (
        <div className="bg-background border border-border rounded-lg px-5 py-4 shadow-sm">
          <div className="text-[11px] font-bold text-muted-foreground tracking-[1.5px] uppercase mb-3">
            GRUPO {grupoActivo}
          </div>
          {cargandoPos ? (
            <div className="skeleton h-[200px] rounded-lg" />
          ) : (
            <TablaGrupo equipos={posiciones[grupoKey]} />
          )}
        </div>
      )}

      {tab === "eliminatorias" && (
        <Eliminatorias partidos={eliminatoriaPartidos} />
      )}
    </div>
  );
}
