import conectarDB from './_db.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = await conectarDB()

    if (req.method === 'GET') {
      const userId = req.query.userId ? decodeURIComponent(req.query.userId) : null
      if (!userId) return res.status(400).json({ error: 'userId requerido' })

      const predicciones = await db
        .collection('predicciones')
        .aggregate([
          { $match: { userId } },
          {
            $lookup: {
              from: 'partidos',
              localField: 'partidoId',
              foreignField: '_id',
              as: 'partido',
            },
          },
          { $unwind: { path: '$partido', preserveNullAndEmpty: true } },
          { $sort: { 'partido.fecha': 1 } },
        ])
        .toArray()

      return res.status(200).json(predicciones)
    }

    if (req.method === 'POST') {
      const { userId, partidoId, golesLocal, golesVisitante } = req.body

      if (!userId || !partidoId || golesLocal === undefined || golesVisitante === undefined) {
        return res.status(400).json({ error: 'Datos incompletos', body: req.body })
      }

      let objectId
      try {
        objectId = new ObjectId(partidoId.toString())
      } catch {
        return res.status(400).json({ error: 'partidoId inválido', partidoId })
      }

      const partido = await db.collection('partidos').findOne({ _id: objectId })
      if (!partido) return res.status(404).json({ error: 'Partido no encontrado', partidoId })

      if (partido.estado !== 'NS') {
        return res.status(400).json({ error: 'El partido ya empezó' })
      }

      const resultado = await db.collection('predicciones').findOneAndUpdate(
        { userId, partidoId: objectId },
        {
          $set: {
            userId,
            partidoId: objectId,
            golesLocal: parseInt(golesLocal),
            golesVisitante: parseInt(golesVisitante),
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date(), puntos: null },
        },
        { upsert: true, returnDocument: 'after' }
      )

      return res.status(200).json(resultado)
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (error) {
    console.error('Error en predicciones:', error)
    return res.status(500).json({ error: error.message })
  }
}