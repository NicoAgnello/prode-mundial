import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const navLinks = [
  { path: '/partidos', label: 'Partidos' },
  { path: '/cruces', label: 'Cruces' },
  { path: '/mis-predicciones', label: 'Mis Prodes' },
  { path: '/ranking', label: 'Ranking' },
]

export default function Layout({ children }) {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .user-name { display: none !important; }
          .nav-logo-text { font-size: 18px !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <Link to="/" style={styles.logo}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <span className="nav-logo-text" style={styles.logoText}>
              PRODE <span style={{ color: "var(--celeste)" }}>2026</span>
            </span>
          </Link>

          <div className="nav-links" style={styles.navLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === link.path
                    ? styles.navLinkActive
                    : {}),
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={styles.authArea}>
            {isAuthenticated ? (
              <div style={styles.userMenu}>
                <img src={user.picture} alt={user.name} style={styles.avatar} />
                <span className="user-name" style={styles.userName}>
                  {user.name?.split(" ")[0]}
                </span>
                <button
                  style={styles.btnLogout}
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                style={styles.btnLogin}
                onClick={() => loginWithRedirect()}
              >
                Entrar
              </button>
            )}

            <button
              className="hamburger"
              style={{ ...styles.hamburger, display: "none" }}
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menu"
            >
              <span style={{ fontSize: 20, color: "var(--blanco)" }}>
                {menuAbierto ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>

        <div
          className="mobile-menu"
          style={{
            ...styles.mobileMenu,
            display: menuAbierto ? "flex" : "none",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.mobileLink,
                ...(location.pathname === link.path
                  ? { color: "var(--celeste)", fontWeight: 600 }
                  : {}),
              }}
              onClick={() => setMenuAbierto(false)}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <button
              style={{ ...styles.btnLogin, width: "100%", marginTop: 8 }}
              onClick={() => {
                loginWithRedirect();
                setMenuAbierto(false);
              }}
            >
              Entrar
            </button>
          )}
        </div>
      </nav>

      <main style={styles.main}>{children}</main>

      <footer style={styles.footer}>
        <span>Prode 2026 · Instituto Leibnitz · Villa María</span>
      </footer>
    </div>
  );
}

const styles = {
  nav: {
    background: "var(--gris-oscuro)",
    borderBottom: "3px solid var(--celeste)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: 22,
    color: "var(--blanco)",
    letterSpacing: 2,
  },
  navLinks: { display: "flex", gap: 4, flex: 1, justifyContent: "center" },
  navLink: {
    color: "rgba(255,255,255,0.7)",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s",
  },
  navLinkActive: {
    color: "var(--blanco)",
    background: "rgba(116,172,223,0.2)",
  },
  authArea: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  userMenu: { display: "flex", alignItems: "center", gap: 8 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "2px solid var(--celeste)",
  },
  userName: { color: "var(--blanco)", fontSize: 13, fontWeight: 500 },
  btnLogout: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "rgba(255,255,255,0.7)",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  btnLogin: {
    background: "var(--celeste)",
    border: "none",
    color: "var(--blanco)",
    padding: "7px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  hamburger: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileMenu: {
    background: "var(--gris-medio)",
    padding: "10px 16px 14px",
    flexDirection: "column",
    gap: 2,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  mobileLink: {
    color: "rgba(255,255,255,0.85)",
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
  },
  main: {
    flex: 1,
    maxWidth: 1100,
    width: "100%",
    margin: "0 auto",
    padding: "20px 16px",
  },
  footer: {
    textAlign: "center",
    padding: "12px 16px",
    fontSize: 12,
    color: "var(--texto-secundario)",
    borderTop: "1px solid var(--borde)",
  },
};
