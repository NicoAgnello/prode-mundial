import conectarDB from './_db.js'
import { ObjectId } from 'mongodb'
import { verificarToken } from './_auth.js'

const validarGoles = (valor) => {
  const n = parseInt(valor)
  return !isNaN(n) && n >= 0 && n <= 20
}

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
      if (userId.length > 100) return res.status(400).json({ error: 'userId inválido' })

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
          { $unwind: { path: '$partido', preserveNullAndEmptyArrays: true } },
          { $sort: { 'partido.fecha': 1 } },
        ])
        .toArray()

      return res.status(200).json(predicciones)
    }

    if (req.method === 'POST') {
      const { userId, partidoId, golesLocal, golesVisitante } = req.body

      // Validaciones básicas
      if (!userId || !partidoId) {
        return res.status(400).json({ error: 'Datos incompletos' })
      }
      if (userId.length > 100) {
        return res.status(400).json({ error: 'userId inválido' })
      }
      if (!validarGoles(golesLocal) || !validarGoles(golesVisitante)) {
        return res.status(400).json({ error: 'Los goles deben ser un número entre 0 y 20' })
      }

      // Validar ObjectId
      let objectId
      try {
        objectId = new ObjectId(partidoId.toString())
      } catch {
        return res.status(400).json({ error: 'ID de partido inválido' })
      }

      // Verificar identidad
      const tokenSub = await verificarToken(req)
      if (!tokenSub || tokenSub !== userId) {
        return res.status(403).json({ error: 'No autorizado' })
      }

      // Verificar que el partido existe y no empezó
      const partido = await db.collection('partidos').findOne({ _id: objectId })
      if (!partido) {
        return res.status(404).json({ error: 'Partido no encontrado' })
      }
      if (partido.estado !== 'NS' || new Date(partido.fecha) <= new Date()) {
        return res.status(400).json({ error: 'El partido ya empezó, no podés modificar tu prode' })
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
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}