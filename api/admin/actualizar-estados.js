import conectarDB from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  if (!process.env.API_FOOTBALL_KEY) {
    return res.status(500).json({ error: 'API_FOOTBALL_KEY no configurada' })
  }

  try {
    const db = await conectarDB()

    // Solo actualizar partidos que tienen fixtureId (sincronizados con API-Football)
    // Los hardcodeados del Mundial no tienen fixtureId hasta que empiece el torneo
    const partidos = await db.collection('partidos')
      .find({
        fixtureId: { $exists: true, $ne: null },
        estado: { $nin: ['FT', 'AET', 'PEN'] }
      })
      .project({ fixtureId: 1 })
      .toArray()

    if (partidos.length === 0) {
      return res.status(200).json({ actualizados: 0, mensaje: 'No hay partidos para actualizar' })
    }

    // API-Football acepta máximo 20 IDs por request
    const ids = partidos.slice(0, 20).map(p => p.fixtureId).join('-')
    const url = `https://v3.football.api-sports.io/fixtures?ids=${ids}`

    const response = await fetch(url, {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
    })

    if (!response.ok) {
      return res.status(502).json({ error: `API-Football respondió con ${response.status}` })
    }

    const data = await response.json()

    if (!data.response?.length) {
      return res.status(200).json({ actualizados: 0, mensaje: 'Sin datos de la API' })
    }

    let actualizados = 0
    for (const fixture of data.response) {
      const { fixture: f, goals } = fixture
      await db.collection('partidos').updateOne(
        { fixtureId: f.id },
        {
          $set: {
            estado: f.status.short,
            golesLocal: goals.home,
            golesVisitante: goals.away,
            updatedAt: new Date(),
          }
        }
      )
      actualizados++
    }

    return res.status(200).json({
      actualizados,
      mensaje: `✓ ${actualizados} estados actualizados`
    })
  } catch (error) {
    console.error('Error actualizando estados:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}