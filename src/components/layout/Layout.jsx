import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { path: "/", label: "Inicio" },
  { path: "/fixture", label: "Fixture" },
  { path: "/ranking", label: "Ranking" },
  { path: "/mi-prode", label: "Mi prode" },
];

export default function Layout({ children }) {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gris-oscuro border-b-[3px] border-b-celeste sticky top-0 z-[100]">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between gap-3">

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🏆</span>
            <span className="font-display text-[18px] sm:text-[22px] text-white tracking-[2px]">
              PRODE <span className="text-celeste">2026</span>
            </span>
          </Link>

          <div className="hidden sm:flex gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-white/70 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isActive(link.path) && "text-white bg-[rgba(116,172,223,0.2)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-[30px] h-[30px] rounded-full border-2 border-celeste"
                />
                <span className="hidden sm:inline text-white text-[13px] font-medium">
                  {user.name?.split(" ")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 h-7 px-2.5 text-[13px]"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  Salir
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-celeste text-white font-semibold hover:bg-celeste-dark h-8 px-4 text-[13px]"
                onClick={() => loginWithRedirect()}
              >
                Entrar
              </Button>
            )}

            <button
              className="flex sm:hidden bg-transparent border-0 p-1 items-center justify-center"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menu"
            >
              <span className="text-xl text-white">{menuAbierto ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {menuAbierto && (
          <div className="sm:hidden bg-gris-medio px-4 pt-2.5 pb-3.5 flex flex-col gap-0.5 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-white/85 px-3 py-2.5 rounded-lg text-[15px] font-medium",
                  isActive(link.path) && "text-celeste font-semibold"
                )}
                onClick={() => setMenuAbierto(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Button
                className="bg-celeste text-white font-semibold w-full mt-2"
                onClick={() => { loginWithRedirect(); setMenuAbierto(false); }}
              >
                Entrar
              </Button>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-5">
        {children}
      </main>

      <footer className="text-center px-4 py-3 text-xs text-muted-foreground border-t border-border">
        Prode 2026 · Instituto Leibnitz · Villa María
      </footer>
    </div>
  );
}
