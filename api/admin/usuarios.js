import conectarDB from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const adminId = req.headers['x-admin-id'] || req.body?.userId
if (adminId !== process.env.ADMIN_USER_ID) {
  return res.status(403).json({ error: 'No autorizado' })
}

  try {
    const db = await conectarDB()

    const usuarios = await db.collection('usuarios')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Para cada usuario contar sus predicciones
    const usuariosConStats = await Promise.all(usuarios.map(async u => {
      const totalPredicciones = await db.collection('predicciones')
        .countDocuments({ userId: u.userId })
      const puntos = await db.collection('predicciones')
        .aggregate([
          { $match: { userId: u.userId, puntos: { $ne: null } } },
          { $group: { _id: null, total: { $sum: '$puntos' } } }
        ]).toArray()

      return {
        userId: u.userId,
        nombre: u.nombre,
        email: u.email,
        foto: u.foto,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
        totalPredicciones,
        puntos: puntos[0]?.total || 0,
        grupoNombre: u.grupoNombre || '—', 
      }
    }))

    return res.status(200).json(usuariosConStats)
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}