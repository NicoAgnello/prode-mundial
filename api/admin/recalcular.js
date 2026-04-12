import conectarDB from '../_db.js'

function calcularPuntos(prediccion, partido) {
  if (partido.estado !== 'FT') return null
  if (partido.golesLocal === null || partido.golesVisitante === null) return null

  const aciertoExacto =
    prediccion.golesLocal === partido.golesLocal &&
    prediccion.golesVisitante === partido.golesVisitante

  if (aciertoExacto) return 3

  const ganadorReal =
    partido.golesLocal > partido.golesVisitante ? 'local' :
    partido.golesVisitante > partido.golesLocal ? 'visitante' : 'empate'

  const ganadorPrediccion =
    prediccion.golesLocal > prediccion.golesVisitante ? 'local' :
    prediccion.golesVisitante > prediccion.golesLocal ? 'visitante' : 'empate'

  if (ganadorReal === ganadorPrediccion) return 1

  return 0
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  try {
    const db = await conectarDB()

    // Traer todos los partidos terminados
    const partidosTerminados = await db
      .collection('partidos')
      .find({ estado: 'FT' })
      .toArray()

    if (partidosTerminados.length === 0) {
      return res.status(200).json({ prediccionesActualizadas: 0, mensaje: 'No hay partidos terminados' })
    }

    const partidosMap = {}
    for (const p of partidosTerminados) {
      partidosMap[p._id.toString()] = p
    }

    // Traer predicciones de esos partidos
    const predicciones = await db
      .collection('predicciones')
      .find({ partidoId: { $in: partidosTerminados.map(p => p._id) } })
      .toArray()

    let prediccionesActualizadas = 0

    for (const prediccion of predicciones) {
      const partido = partidosMap[prediccion.partidoId.toString()]
      if (!partido) continue

      const puntos = calcularPuntos(prediccion, partido)
      if (puntos === null) continue

      await db.collection('predicciones').updateOne(
        { _id: prediccion._id },
        { $set: { puntos, recalculadoAt: new Date() } }
      )

      prediccionesActualizadas++
    }

    return res.status(200).json({
      prediccionesActualizadas,
      mensaje: `${prediccionesActualizadas} predicciones actualizadas`,
    })
  } catch (error) {
    console.error('Error recalculando:', error)
    return res.status(500).json({ error: error.message })
  }
}
