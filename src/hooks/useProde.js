import { useState, useEffect } from "react";

export function usePartidos() {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        // Solo actualizar estados si hay partidos con fixtureId (ya empezó el Mundial)
        const res = await fetch("/api/partidos");
        const data = await res.json();
        if (!Array.isArray(data)) {
          setError("Error al cargar partidos");
          return;
        }

        // Solo llamar a actualizar-estados si hay partidos en juego o próximos con fixtureId
        const tieneFixtureId = data.some((p) => p.fixtureId);
        const hayEnJuego = data.some((p) =>
          ["1H", "2H", "HT", "ET"].includes(p.estado),
        );

        if (tieneFixtureId && hayEnJuego) {
          await fetch("/api/admin/actualizar-estados", {
            method: "POST",
          }).catch(() => {});
          // Recargar después de actualizar
          const res2 = await fetch("/api/partidos");
          const data2 = await res2.json();
          if (Array.isArray(data2)) setPartidos(data2);
        } else {
          setPartidos(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  return { partidos, cargando, error };
}
export function useRanking(userId) {
  const [ranking, setRanking] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!userId) {
      setCargando(false)
      return
    }
    fetch(`/api/ranking?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setRanking(data)
      })
      .finally(() => setCargando(false))
  }, [userId])

  return { ranking, cargando }
}

export function useMisPredicciones(userId) {
  const [predicciones, setPredicciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCargando(false);
      return;
    }
    fetch(`/api/predicciones?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPredicciones(data);
      })
      .finally(() => setCargando(false));
  }, [userId]);

  const guardar = async (partidoId, local, visitante) => {
    const res = await fetch("/api/predicciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        partidoId: partidoId.toString(),
        golesLocal: local,
        golesVisitante: visitante,
      }),
    });
    const data = await res.json();
    setPredicciones((prev) => {
      const idx = prev.findIndex((p) => p.partidoId === partidoId);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = data;
        return copia;
      }
      return [...prev, data];
    });
    return data;
  };

  return { predicciones, cargando, guardar };
}
