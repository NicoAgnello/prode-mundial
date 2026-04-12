import conectarDB from './_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const db = await conectarDB()

    const ranking = await db
      .collection('predicciones')
      .aggregate([
        { $match: { puntos: { $ne: null } } },
        {
          $group: {
            _id: '$userId',
            puntos: { $sum: '$puntos' },
            exactos: { $sum: { $cond: [{ $eq: ['$puntos', 3] }, 1, 0] } },
            ganadores: { $sum: { $cond: [{ $eq: ['$puntos', 1] }, 1, 0] } },
            totalProdes: { $sum: 1 },
          },
        },
        { $sort: { puntos: -1, exactos: -1 } },
        {
          $lookup: {
            from: 'usuarios',
            localField: '_id',
            foreignField: 'userId',
            as: 'usuario',
          },
        },
        { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            nombre: { $ifNull: ['$usuario.nombre', 'Anónimo'] },
            foto: '$usuario.foto',
            puntos: 1,
            exactos: 1,
            ganadores: 1,
            totalProdes: 1,
          },
        },
      ])
      .toArray()

    return res.status(200).json(ranking)
  } catch (error) {
    console.error('Error en ranking:', error)
    return res.status(500).json({ error: 'Error interno' })
  }
}
