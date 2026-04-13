import conectarDB from '../_db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminKey = req.headers['x-admin-key']
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  try {
    const db = await conectarDB()

    // Poner puntos en null para que recalcular los vuelva a calcular
    const result = await db.collection('predicciones').updateMany(
      {},
      { $set: { puntos: null, recalculadoAt: null } }
    )

    return res.status(200).json({
      reseteadas: result.modifiedCount,
      mensaje: `✓ ${result.modifiedCount} predicciones reseteadas. Ahora podés recalcular puntos.`
    })
  } catch (error) {
    console.error('Error reseteando puntos:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}