import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

const navLinks = [
  { path: '/partidos', label: 'Partidos' },
  { path: '/mis-predicciones', label: 'Mis Prodes' },
  { path: '/ranking', label: 'Ranking' },
]

export default function Layout({ children }) {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const location = useLocation()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <span style={styles.logoEmoji}>🏆</span>
            <span style={styles.logoText}>PRODE <span style={styles.logoAccent}>2026</span></span>
          </Link>

          {/* Links desktop */}
          <div style={styles.navLinks}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === link.path ? styles.navLinkActive : {})
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div style={styles.authArea}>
            {isAuthenticated ? (
              <div style={styles.userMenu}>
                <img
                  src={user.picture}
                  alt={user.name}
                  style={styles.avatar}
                />
                <span style={styles.userName}>{user.name?.split(' ')[0]}</span>
                <button
                  style={styles.btnLogout}
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  Salir
                </button>
              </div>
            ) : (
              <button style={styles.btnLogin} onClick={() => loginWithRedirect()}>
                Entrar
              </button>
            )}

            {/* Hamburger mobile */}
            <button
              style={styles.hamburger}
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menu"
            >
              <span style={{ fontSize: 22 }}>{menuAbierto ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuAbierto && (
          <div style={styles.mobileMenu}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={styles.mobileLink}
                onClick={() => setMenuAbierto(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <button
                style={{ ...styles.btnLogin, width: '100%', marginTop: 8 }}
                onClick={() => loginWithRedirect()}
              >
                Entrar
              </button>
            )}
          </div>
        )}
      </nav>

      <main style={styles.main}>
        {children}
      </main>

      <footer style={styles.footer}>
        <span>Prode Mundial 2026 · Hecho con 💙🤍 · Instituto Leibnitz</span>
      </footer>
    </div>
  )
}

const styles = {
  nav: {
    background: 'var(--gris-oscuro)',
    borderBottom: '3px solid var(--celeste)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 20px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoEmoji: { fontSize: 22 },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    color: 'var(--blanco)',
    letterSpacing: 2,
  },
  logoAccent: { color: 'var(--celeste)' },
  navLinks: {
    display: 'flex',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    color: 'rgba(255,255,255,0.7)',
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  navLinkActive: {
    color: 'var(--blanco)',
    background: 'rgba(116, 172, 223, 0.2)',
  },
  authArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid var(--celeste)',
  },
  userName: {
    color: 'var(--blanco)',
    fontSize: 14,
    fontWeight: 500,
    display: 'none', // hidden on mobile
  },
  btnLogout: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'rgba(255,255,255,0.7)',
    padding: '5px 12px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },
  btnLogin: {
    background: 'var(--celeste)',
    border: 'none',
    color: 'var(--blanco)',
    padding: '8px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  hamburger: {
    background: 'transparent',
    border: 'none',
    color: 'var(--blanco)',
    cursor: 'pointer',
    display: 'none',
    padding: 4,
  },
  mobileMenu: {
    background: 'var(--gris-medio)',
    padding: '12px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  mobileLink: {
    color: 'rgba(255,255,255,0.85)',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    textDecoration: 'none',
  },
  main: {
    flex: 1,
    maxWidth: 1100,
    width: '100%',
    margin: '0 auto',
    padding: '24px 20px',
  },
  footer: {
    textAlign: 'center',
    padding: '16px 20px',
    fontSize: 13,
    color: 'var(--texto-secundario)',
    borderTop: '1px solid var(--borde)',
  },
}
