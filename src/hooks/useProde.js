import { useState, useEffect } from 'react'

export function usePartidos() {
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/partidos')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPartidos(data)
        else setError('Error al cargar partidos')
      })
      .catch(err => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  return { partidos, cargando, error }
}

export function useRanking() {
  const [ranking, setRanking] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/ranking')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setRanking(data)
      })
      .finally(() => setCargando(false))
  }, [])

  return { ranking, cargando }
}

export function useMisPredicciones(userId) {
  const [predicciones, setPredicciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!userId) {
      setCargando(false)
      return
    }
    fetch(`/api/predicciones?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPredicciones(data)
      })
      .finally(() => setCargando(false))
  }, [userId])

  const guardar = async (partidoId, local, visitante) => {
    const res = await fetch('/api/predicciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, partidoId, golesLocal: local, golesVisitante: visitante }),
    })
    const data = await res.json()
    setPredicciones(prev => {
      const idx = prev.findIndex(p => p.partidoId === partidoId)
      if (idx >= 0) {
        const copia = [...prev]
        copia[idx] = data
        return copia
      }
      return [...prev, data]
    })
    return data
  }

  return { predicciones, cargando, guardar }
}