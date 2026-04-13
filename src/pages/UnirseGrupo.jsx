import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function UnirseGrupo({ onUnirse }) {
  const { user } = useAuth0();
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
        body: JSON.stringify({
          userId: user.sub,
          codigo: codigo.trim(),
          soloVerificar: true,
        }),
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
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icono}>🏆</div>
        <h1 style={styles.titulo}>PRODE 2026</h1>

        {!confirmando ? (
          <>
            <p style={styles.desc}>
              Para participar necesitás un código de grupo. Pedíselo a quien
              organizó el prode.
            </p>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Ej: PRODE2026"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && buscarGrupo()}
                style={styles.input}
                maxLength={20}
                autoFocus
              />
              <button
                onClick={buscarGrupo}
                disabled={cargando || !codigo.trim()}
                style={styles.btn}
              >
                {cargando ? "Verificando..." : "Verificar código →"}
              </button>
            </div>
            {error && <div style={styles.error}>⚠ {error}</div>}
            <p style={styles.ayuda}>
              Si no tenés código, contactá al administrador del prode.
            </p>
          </>
        ) : (
          <>
            <p style={styles.desc}>Encontramos el grupo:</p>
            <div style={styles.grupoPreview}>
              <div style={styles.grupoNombre}>🏆 {grupoPreview?.nombre}</div>
              <div style={styles.grupoCodigo}>{codigo}</div>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--texto-secundario)",
                marginBottom: 16,
              }}
            >
              ¿Confirmás que querés unirte a este grupo?{" "}
              <strong>No vas a poder cambiarlo después</strong> sin la ayuda del
              administrador.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={confirmarUnirse}
                disabled={cargando}
                style={styles.btn}
              >
                {cargando ? "Uniéndome..." : "✓ Confirmar y unirme"}
              </button>
              <button
                onClick={() => {
                  setConfirmando(false);
                  setGrupoPreview(null);
                }}
                disabled={cargando}
                style={styles.btnSecundario}
              >
                ← Cambiar código
              </button>
            </div>
            {error && <div style={styles.error}>⚠ {error}</div>}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "var(--blanco)",
    border: "1px solid var(--borde)",
    borderRadius: 20,
    padding: "40px 32px",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
    borderTop: "4px solid var(--celeste)",
  },
  icono: { fontSize: 48, marginBottom: 8 },
  titulo: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    letterSpacing: 3,
    marginBottom: 12,
    color: "var(--texto-principal)",
  },
  desc: {
    fontSize: 15,
    color: "var(--texto-secundario)",
    lineHeight: 1.6,
    marginBottom: 24,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 12,
  },
  input: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "1.5px solid var(--borde)",
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 3,
    fontFamily: "var(--font-body)",
    outline: "none",
    textTransform: "uppercase",
  },
  btn: {
    background: "var(--celeste)",
    color: "var(--blanco)",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  btnSecundario: {
    background: "var(--blanco)",
    color: "var(--texto-secundario)",
    border: "1.5px solid var(--borde)",
    padding: "12px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  grupoPreview: {
    background: "var(--celeste-light)",
    border: "2px solid var(--celeste)",
    borderRadius: 12,
    padding: "16px",
    marginBottom: 16,
  },
  grupoNombre: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--texto-principal)",
    marginBottom: 4,
  },
  grupoCodigo: {
    fontSize: 13,
    color: "var(--celeste-dark)",
    letterSpacing: 2,
    fontWeight: 600,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 8,
    background: "#fee2e2",
    padding: "8px 12px",
    borderRadius: 8,
  },
  ayuda: {
    fontSize: 12,
    color: "var(--texto-secundario)",
    marginTop: 16,
  },
};
