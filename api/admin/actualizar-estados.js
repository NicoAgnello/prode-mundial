import conectarDB from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const db = await conectarDB()

    // Traer IDs de partidos que NO están terminados
    const partidos = await db.collection('partidos')
      .find({ estado: { $nin: ['FT', 'AET', 'PEN'] } })
      .project({ fixtureId: 1 })
      .toArray()

    if (partidos.length === 0) {
      return res.status(200).json({ actualizados: 0, mensaje: 'No hay partidos pendientes' })
    }

    const ids = partidos.map(p => p.fixtureId).join('-')
    const url = `https://v3.football.api-sports.io/fixtures?ids=${ids}`

    const response = await fetch(url, {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
    })

    const data = await response.json()
    if (!data.response?.length) {
      return res.status(200).json({ actualizados: 0 })
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

    return res.status(200).json({ actualizados, mensaje: `✓ ${actualizados} estados actualizados` })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}