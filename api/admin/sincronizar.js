import conectarDB from '../_db.js'

// Mapeo de nombres API-Football → nombres en nuestra DB
const NOMBRES_MAP = {
  'Mexico': 'Mexico', 'South Africa': 'Sudafrica', 'South Korea': 'Corea del Sur',
  'Georgia': 'Georgia', 'Spain': 'España', 'Panama': 'Panama',
  'Morocco': 'Marruecos', 'Belgium': 'Belgica', 'United States': 'Estados Unidos',
  'Serbia': 'Serbia', 'Uruguay': 'Uruguay', 'Romania': 'Rumania',
  'France': 'Francia', 'Nigeria': 'Nigeria', 'Australia': 'Australia',
  'Saudi Arabia': 'Arabia Saudita', 'Germany': 'Alemania', 'Costa Rica': 'Costa Rica',
  'Japan': 'Japon', 'Ecuador': 'Ecuador', 'Portugal': 'Portugal',
  'Angola': 'Angola', 'Croatia': 'Croacia', 'Hungary': 'Hungria',
  'Brazil': 'Brasil', 'Norway': 'Noruega', 'Colombia': 'Colombia',
  'England': 'Inglaterra', 'Senegal': 'Senegal', 'Netherlands': 'Holanda',
  'Qatar': 'Qatar', 'Argentina': 'Argentina', 'Canada': 'Canada',
  'Iran': 'Iran', 'Switzerland': 'Suiza', 'Turkey': 'Turquia',
  'Indonesia': 'Indonesia', 'China': 'China', 'Scotland': 'Escocia',
  "Ivory Coast": 'Costa de Marfil', 'Venezuela': 'Venezuela',
  'Austria': 'Austria', 'Paraguay': 'Paraguay', 'Uzbekistan': 'Uzbekistan',
  'Slovakia': 'Eslovaquia',
}

const traducir = nombre => NOMBRES_MAP[nombre] || nombre

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  if (!process.env.API_FOOTBALL_KEY) {
    return res.status(500).json({ error: 'API_FOOTBALL_KEY no configurada' })
  }

  const leagueId = parseInt(req.body?.leagueId) || 1
  const season = parseInt(req.body?.season) || 2026
  const soloRecientes = req.body?.soloRecientes ?? false

  try {
    const db = await conectarDB()

    const url = soloRecientes
      ? `https://v3.football.api-sports.io/fixtures?date=${new Date().toISOString().split('T')[0]}`
      : `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`

    const response = await fetch(url, {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
    })

    if (!response.ok) {
      return res.status(502).json({ error: `API-Football respondió con ${response.status}` })
    }

    const data = await response.json()

    if (data.errors && Object.keys(data.errors).length > 0) {
      return res.status(502).json({ error: 'Error de API-Football', detalle: data.errors })
    }

    if (!data.response || data.response.length === 0) {
      return res.status(200).json({ actualizados: 0, mensaje: 'No hay partidos disponibles' })
    }

    let actualizados = 0
    let nuevos = 0

    for (const fixture of data.response) {
      const { fixture: f, teams, goals, league } = fixture

      const localTraducido = traducir(teams.home.name)
      const visitanteTraducido = traducir(teams.away.name)

      // Primero intentar matchear con partido existente por equipos
      const partidoExistente = await db.collection('partidos').findOne({
        local: localTraducido,
        visitante: visitanteTraducido,
        esMundial: true,
      })

      if (partidoExistente) {
        // Actualizar partido existente con fixtureId y resultado
        await db.collection('partidos').updateOne(
          { _id: partidoExistente._id },
          {
            $set: {
              fixtureId: f.id,
              estado: f.status.short,
              golesLocal: goals.home,
              golesVisitante: goals.away,
              banderaLocal: teams.home.logo,
              banderaVisitante: teams.away.logo,
              updatedAt: new Date(),
            }
          }
        )
        actualizados++
      } else {
        // Partido nuevo (eliminatorias) — insertar
        await db.collection('partidos').updateOne(
          { fixtureId: f.id },
          {
            $set: {
              fixtureId: f.id,
              local: localTraducido,
              visitante: visitanteTraducido,
              banderaLocal: teams.home.logo,
              banderaVisitante: teams.away.logo,
              fecha: new Date(f.date),
              estado: f.status.short,
              golesLocal: goals.home,
              golesVisitante: goals.away,
              grupo: league.round,
              ronda: league.round,
              esMundial: true,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        )
        nuevos++
      }
    }

    return res.status(200).json({
      actualizados,
      nuevos,
      mensaje: `✓ ${actualizados} partidos actualizados, ${nuevos} nuevos`
    })
  } catch (error) {
    console.error('Error sincronizando:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}