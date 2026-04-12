import conectarDB from '../_db.js'

// IDs de ligas útiles para testing:
// 39  = Premier League
// 140 = La Liga
// 2   = Champions League
// 128 = Copa de la Liga Argentina
// 1   = Mundial FIFA (cuando esté disponible)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  const leagueId = req.body?.leagueId || 39
  const season = req.body?.season || 2025
  const soloRecientes = req.body?.soloRecientes ?? true

  try {
    const db = await conectarDB()

    const url = soloRecientes
  ? `https://v3.football.api-sports.io/fixtures?date=${new Date().toISOString().split('T')[0]}&last=10`
  : `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`
    const response = await fetch(url, {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
    })

    const data = await response.json()
    console.log('API response:', JSON.stringify(data).slice(0, 500))
console.log('Results count:', data.response?.length)
console.log('Errors:', data.errors)

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
            estado: f.status.short,
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

    return res.status(200).json({ actualizados, mensaje: `✓ ${actualizados} partidos sincronizados` })
  } catch (error) {
    console.error('Error sincronizando:', error)
    return res.status(500).json({ error: error.message })
  }
}