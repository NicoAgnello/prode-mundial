import conectarDB from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  try {
    const db = await conectarDB()
    const result = await db.collection('partidos').deleteMany({})
    return res.status(200).json({
      eliminados: result.deletedCount,
      mensaje: `✓ ${result.deletedCount} partidos eliminados`
    })
  } catch (error) {
    console.error('Error limpiando partidos:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}