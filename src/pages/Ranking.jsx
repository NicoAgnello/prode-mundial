import { useAuth0 } from "@auth0/auth0-react";
import { useRanking } from "../hooks/useProde";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const medallas = ["🥇", "🥈", "🥉"];

export default function Ranking() {
  const { user } = useAuth0();
  const { ranking, cargando } = useRanking(user?.sub);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-5">
        <h1 className="font-display text-[36px] tracking-[2px]">RANKING</h1>
        <span className="text-sm text-muted-foreground">{ranking.length} participantes</span>
      </div>

      {cargando ? (
        <div className="flex flex-col gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-[60px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ranking.map((jugador, idx) => {
            const esYo = jugador.userId === user?.sub;
            return (
              <div
                key={jugador.userId}
                className={cn(
                  "flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3 transition-shadow",
                  idx < 3 && "border-l-[3px] border-l-oro",
                  esYo && "bg-celeste-light border-celeste"
                )}
              >
                <div className="w-9 text-center shrink-0">
                  {idx < 3 ? (
                    <span className="text-[22px]">{medallas[idx]}</span>
                  ) : (
                    <span className="font-display text-xl text-muted-foreground">{idx + 1}</span>
                  )}
                </div>

                <img
                  src={jugador.foto || `https://api.dicebear.com/7.x/initials/svg?seed=${jugador.nombre}`}
                  alt={jugador.nombre}
                  className="w-10 h-10 rounded-full object-cover border-2 border-border shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-[15px] truncate">
                    {jugador.nombre}
                    {esYo && (
                      <Badge className="bg-celeste text-white text-[10px] tracking-wide px-1.5 h-auto py-px shrink-0">
                        vos
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {jugador.exactos} exactos · {jugador.ganadores} ganadores
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-display text-[28px] text-celeste-dark block leading-none">
                    {jugador.puntos}
                  </span>
                  <span className="text-[11px] text-muted-foreground">pts</span>
                </div>
              </div>
            );
          })}

          {ranking.length === 0 && (
            <div className="text-center py-12 px-5 bg-background border border-border rounded-2xl">
              <div className="text-5xl mb-3">🏆</div>
              <div className="font-semibold">Todavía no hay predicciones</div>
              <div className="text-sm text-muted-foreground mt-1">
                Cuando empiece el Mundial el ranking se va a ir actualizando
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
