import conectarDB from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  const { userId } = req.body

  try {
    const db = await conectarDB()

    // Si viene userId borra solo las de ese usuario, si no borra todas
    const filtro = userId ? { userId } : {}
    const result = await db.collection('predicciones').deleteMany(filtro)

    return res.status(200).json({
      eliminadas: result.deletedCount,
      mensaje: userId
        ? `✓ ${result.deletedCount} predicciones eliminadas para el usuario`
        : `✓ ${result.deletedCount} predicciones eliminadas en total`
    })
  } catch (error) {
    console.error('Error limpiando predicciones:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}