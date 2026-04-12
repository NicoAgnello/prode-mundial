import conectarDB from '../_db.js'

// ID del Mundial 2026 en API-Football
const MUNDIAL_2026_ID = 1 // reemplazar con el ID real una vez que empiece el torneo

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  // Verificar que es admin (básico — en producción usar JWT)
  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  try {
    const db = await conectarDB()

    // Traer partidos de API-Football
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${MUNDIAL_2026_ID}&season=2026`,
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY,
        },
      }
    )

    const data = await response.json()

    if (!data.response || data.response.length === 0) {
      return res.status(200).json({ actualizados: 0, mensaje: 'No hay partidos disponibles aún' })
    }

    let actualizados = 0

    for (const fixture of data.response) {
      const { fixture: f, teams, goals, league } = fixture

      await db.collection('partidos').updateOne(
        { fixtureId: f.id },
        {
          $set: {
            fixtureId: f.id,
            local: teams.home.name,
            visitante: teams.away.name,
            banderaLocal: `https://media.api-sports.io/flags/${teams.home.id}.svg`,
            banderaVisitante: `https://media.api-sports.io/flags/${teams.away.id}.svg`,
            fecha: new Date(f.date),
            estado: f.status.short, // NS, 1H, HT, 2H, FT, etc.
            golesLocal: goals.home,
            golesVisitante: goals.away,
            grupo: league.round,
            ronda: league.round,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      )

      actualizados++
    }

    return res.status(200).json({ actualizados, mensaje: `${actualizados} partidos sincronizados` })
  } catch (error) {
    console.error('Error sincronizando:', error)
    return res.status(500).json({ error: error.message })
  }
}
