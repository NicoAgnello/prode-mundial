import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const stats = [
  { numero: "104",   label: "Partidos" },
  { numero: "48",    label: "Selecciones" },
  { numero: "3 pts", label: "Resultado exacto" },
  { numero: "1 pt",  label: "Acertás ganador" },
];

const pasos = [
  { paso: "01", titulo: "Ingresá tu código",  desc: "Usá el código de tu grupo para unirte al prode con tus amigos o compañeros." },
  { paso: "02", titulo: "Cargá tus prodes",   desc: "Antes de cada partido predecí el resultado exacto. Podés modificarlo hasta que empiece." },
  { paso: "03", titulo: "Sumá puntos",        desc: "3 pts por resultado exacto. 1 pt si acertás el ganador o empate." },
  { paso: "04", titulo: "Ganá el prode",      desc: "El que más puntos acumule al final del Mundial gana. ¡Hasta la final se puede predecir!" },
];

export default function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div>
      {/* Hero */}
      <div className="bg-gris-oscuro rounded-[20px] px-10 py-12 mb-6 relative overflow-hidden flex items-center justify-between min-h-[280px] gap-6">
        {/* Gradiente decorativo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(116,172,223,0.15) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-[500px] flex-1">
          <div className="inline-block bg-[rgba(116,172,223,0.2)] text-celeste text-xs font-semibold tracking-[2px] px-3 py-1 rounded-full mb-4">
            🏆 FIFA WORLD CUP 2026
          </div>
          <h1 className="font-display text-[clamp(40px,7vw,72px)] text-white leading-none mb-4 tracking-[2px] whitespace-nowrap">
            PRODE <span className="text-celeste">2026</span>
          </h1>
          <p className="text-white/65 text-base mb-7 leading-relaxed">
            Predecí los resultados, sumá puntos y competí con tus compañeros del grupo.
          </p>
          <div className="flex gap-3 flex-wrap">
            {isAuthenticated ? (
              <Link
                to="/fixture"
                className="bg-celeste text-white px-6 py-3 rounded-[10px] text-[15px] font-semibold"
              >
                Ver partidos →
              </Link>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-celeste text-white px-6 py-3 rounded-[10px] text-[15px] font-semibold"
              >
                Entrar al prode →
              </button>
            )}
            <Link
              to="/ranking"
              className="bg-transparent text-white/75 border border-white/25 px-6 py-3 rounded-[10px] text-[15px] font-medium"
            >
              Ver ranking
            </Link>
          </div>
        </div>

        <div className="hero-decorativo">
          <img
            src="/wc2026.png"
            alt="FIFA World Cup 2026"
            style={{
              width: "clamp(150px, 20vw, 300px)",
              height: "clamp(150px, 20vw, 300px)",
              objectFit: "contain",
              mixBlendMode: "luminosity",
              opacity: 0.95,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-background border border-border rounded-lg px-5 py-4 text-center">
            <div className="font-display text-[32px] text-celeste-dark leading-none">{s.numero}</div>
            <div className="text-[13px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cómo funciona */}
      <div className="mb-8">
        <h2 className="font-display text-[28px] tracking-[2px] mb-4">¿CÓMO FUNCIONA?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pasos.map((p) => (
            <div key={p.paso} className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gris-oscuro text-white rounded-lg text-[13px] font-bold tracking-wide mb-3.5 font-display">
                {p.paso}
              </div>
              <div className="font-semibold text-[15px] mb-1.5">{p.titulo}</div>
              <div className="text-[13px] text-muted-foreground leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
