import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

export default function UnirseGrupo({ onUnirse }) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [grupoPreview, setGrupoPreview] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  const buscarGrupo = async () => {
    if (!codigo.trim()) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.sub, codigo: codigo.trim(), soloVerificar: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código inválido");
      } else {
        setGrupoPreview(data.grupo);
        setConfirmando(true);
      }
    } catch {
      setError("Error de conexión, intentá de nuevo");
    } finally {
      setCargando(false);
    }
  };

  const confirmarUnirse = async () => {
    setCargando(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.sub, codigo: codigo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al unirse al grupo");
        setConfirmando(false);
      } else {
        onUnirse(data.grupo);
      }
    } catch {
      setError("Error de conexión, intentá de nuevo");
      setConfirmando(false);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <div className="bg-background border border-border border-t-4 border-t-celeste rounded-[20px] px-8 py-10 max-w-[420px] w-full text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="font-display text-[32px] tracking-[3px] mb-3">PRODE 2026</h1>

        {!confirmando ? (
          <>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
              Para participar necesitás un código de grupo. Pedíselo a quien organizó el prode.
            </p>
            <div className="flex flex-col gap-2.5 mb-3">
              <input
                type="text"
                placeholder="Ej: PRODE2026"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && buscarGrupo()}
                className="px-4 py-3 rounded-[10px] border-[1.5px] border-border text-lg font-bold text-center tracking-[3px] uppercase outline-none focus:border-celeste transition-colors"
                maxLength={20}
                autoFocus
              />
              <Button
                onClick={buscarGrupo}
                disabled={cargando || !codigo.trim()}
                className="w-full bg-celeste text-white hover:bg-celeste-dark py-3 text-[15px] h-auto"
              >
                {cargando ? "Verificando..." : "Verificar código →"}
              </Button>
            </div>
            {error && (
              <div className="text-error text-[13px] mt-2 bg-[#fee2e2] px-3 py-2 rounded-lg">
                ⚠ {error}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Si no tenés código, contactá al administrador del prode.
            </p>
          </>
        ) : (
          <>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
              Encontramos el grupo:
            </p>
            <div className="bg-celeste-light border-2 border-celeste rounded-lg p-4 mb-4">
              <div className="text-lg font-bold mb-1">🏆 {grupoPreview?.nombre}</div>
              <div className="text-[13px] text-celeste-dark tracking-[2px] font-semibold">
                {codigo}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Confirmás que querés unirte a este grupo?{" "}
              <strong>No vas a poder cambiarlo después</strong> sin la ayuda del administrador.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={confirmarUnirse}
                disabled={cargando}
                className="w-full bg-celeste text-white hover:bg-celeste-dark py-3 text-[15px] h-auto"
              >
                {cargando ? "Uniéndome..." : "✓ Confirmar y unirme"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setConfirmando(false); setGrupoPreview(null); }}
                disabled={cargando}
                className="w-full py-3 text-[15px] h-auto"
              >
                ← Cambiar código
              </Button>
            </div>
            {error && (
              <div className="text-error text-[13px] mt-2 bg-[#fee2e2] px-3 py-2 rounded-lg">
                ⚠ {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
