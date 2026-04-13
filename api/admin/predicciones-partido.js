import conectarDB from '../_db.js'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  const { partidoId } = req.query
  if (!partidoId) return res.status(400).json({ error: 'partidoId requerido' })

  let objectId
  try {
    objectId = new ObjectId(partidoId)
  } catch {
    return res.status(400).json({ error: 'partidoId inválido' })
  }

  try {
    const db = await conectarDB()

    const predicciones = await db.collection('predicciones')
      .aggregate([
        { $match: { partidoId: objectId } },
        {
          $lookup: {
            from: 'usuarios',
            localField: 'userId',
            foreignField: 'userId',
            as: 'usuario',
          }
        },
        { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            userId: 1,
            nombre: { $ifNull: ['$usuario.nombre', 'Anónimo'] },
            foto: '$usuario.foto',
            golesLocal: 1,
            golesVisitante: 1,
            puntos: 1,
            createdAt: 1,
            updatedAt: 1,
          }
        },
        { $sort: { createdAt: 1 } }
      ])
      .toArray()

    return res.status(200).json(predicciones)
  } catch (error) {
    console.error('Error obteniendo predicciones del partido:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}