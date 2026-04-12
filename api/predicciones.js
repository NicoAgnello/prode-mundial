import conectarDB from './_db.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const db = await conectarDB()

  // GET /api/predicciones?userId=xxx
  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: 'userId requerido' })

    try {
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
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al obtener predicciones' })
    }
  }

  // POST /api/predicciones — crear o actualizar
  if (req.method === 'POST') {
    const { userId, partidoId, golesLocal, golesVisitante } = req.body

    if (!userId || !partidoId || golesLocal === undefined || golesVisitante === undefined) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    // Verificar que el partido no haya empezado
    const partido = await db.collection('partidos').findOne({ _id: new ObjectId(partidoId) })
    if (!partido) return res.status(404).json({ error: 'Partido no encontrado' })

    if (partido.estado !== 'NS') {
      return res.status(400).json({ error: 'El partido ya empezó, no podés modificar tu prode' })
    }

    try {
      const resultado = await db.collection('predicciones').findOneAndUpdate(
        { userId, partidoId: new ObjectId(partidoId) },
        {
          $set: {
            userId,
            partidoId: new ObjectId(partidoId),
            golesLocal: parseInt(golesLocal),
            golesVisitante: parseInt(golesVisitante),
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date(), puntos: null },
        },
        { upsert: true, returnDocument: 'after' }
      )

      return res.status(200).json(resultado)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al guardar predicción' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
