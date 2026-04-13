import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <div style={styles.heroTag}>🏆 FIFA WORLD CUP 2026</div>
          <h1 style={styles.heroTitle}>
            PRODE <span style={styles.heroTitleAccent}>2026</span>
          </h1>
          <p style={styles.heroSub}>
            Predecí los resultados, sumá puntos y competí con tus compañeros del
            grupo.
          </p>
          <div style={styles.heroBtns}>
            {isAuthenticated ? (
              <Link to="/partidos" style={styles.btnPrimario}>
                Ver partidos →
              </Link>
            ) : (
              <button
                style={styles.btnPrimario}
                onClick={() => loginWithRedirect()}
              >
                Entrar al prode →
              </button>
            )}
            <Link to="/ranking" style={styles.btnSecundario}>
              Ver ranking
            </Link>
          </div>
        </div>

        {/* Decorativo */}
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
      </div>{" "}
      {/* Stats rápidas */}
      <div style={styles.statsGrid}>
        {[
          { numero: "104", label: "Partidos" },
          { numero: "48", label: "Selecciones" },
          { numero: "3 pts", label: "Resultado exacto" },
          { numero: "1 pt", label: "Acertás ganador" },
        ].map((stat) => (
          <div key={stat.label} style={styles.statCard}>
            <div style={styles.statNum}>{stat.numero}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Como funciona */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>¿CÓMO FUNCIONA?</h2>
        <div style={styles.pasosGrid}>
          {[
            {
              paso: "01",
              titulo: "Ingresá tu código",
              desc: "Usá el código de tu grupo para unirte al prode con tus amigos o compañeros.",
            },
            {
              paso: "02",
              titulo: "Cargá tus prodes",
              desc: "Antes de cada partido predecí el resultado exacto. Podés modificarlo hasta que empiece.",
            },
            {
              paso: "03",
              titulo: "Sumá puntos",
              desc: "3 pts por resultado exacto. 1 pt si acertás el ganador o empate.",
            },
            {
              paso: "04",
              titulo: "Ganá el prode",
              desc: "El que más puntos acumule al final del Mundial gana. ¡Hasta la final se puede predecir!",
            },
          ].map((p) => (
            <div key={p.paso} style={styles.pasoCard}>
              <div style={styles.pasoNum}>{p.paso}</div>
              <div style={styles.pasoTitulo}>{p.titulo}</div>
              <div style={styles.pasoDesc}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    background: "var(--gris-oscuro)",
    borderRadius: "var(--radio-lg)",
    padding: "48px 40px",
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 280,
    gap: 24,
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 30% 50%, rgba(116,172,223,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 500,
    flex: 1,
  },
  heroTag: {
    display: "inline-block",
    background: "rgba(116,172,223,0.2)",
    color: "var(--celeste)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 2,
    padding: "4px 12px",
    borderRadius: 99,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(40px, 7vw, 72px)",
    color: "var(--blanco)",
    lineHeight: 1,
    marginBottom: 16,
    letterSpacing: 2,
    whiteSpace: "nowrap",
  },
  heroTitleAccent: { color: "var(--celeste)" },
  heroSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 16,
    marginBottom: 28,
    lineHeight: 1.6,
  },
  heroBtns: { display: "flex", gap: 12, flexWrap: "wrap" },
  btnPrimario: {
    background: "var(--celeste)",
    color: "var(--blanco)",
    border: "none",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  btnSecundario: {
    background: "transparent",
    color: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.25)",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
    display: "inline-block",
  },
  decorativo: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  pelota: {
    fontSize: 80,
    lineHeight: 1,
    filter: "drop-shadow(0 4px 24px rgba(116,172,223,0.3))",
  },
  decorativoLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: "var(--radio)",
    padding: "16px 20px",
    textAlign: "center",
  },
  statNum: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    color: "var(--celeste-dark)",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 13,
    color: "var(--texto-secundario)",
    marginTop: 4,
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 28,
    color: "var(--texto-principal)",
    marginBottom: 16,
    letterSpacing: 2,
  },
  pasosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  pasoCard: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: "var(--radio)",
    padding: "20px",
    borderTop: "3px solid var(--celeste)",
  },
  pasoNum: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    color: "var(--celeste)",
    lineHeight: 1,
    marginBottom: 8,
  },
  pasoTitulo: {
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 6,
    color: "var(--texto-principal)",
  },
  pasoDesc: {
    fontSize: 13,
    color: "var(--texto-secundario)",
    lineHeight: 1.6,
  },
  decorativo: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    "@media (max-width: 480px)": { display: "none" }, // esto no funciona en inline styles
  },
};
