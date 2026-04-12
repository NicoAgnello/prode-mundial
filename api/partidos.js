import conectarDB from './_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const db = await conectarDB()
    const partidos = await db
      .collection('partidos')
      .find({})
      .sort({ fecha: 1 })
      .toArray()

    return res.status(200).json(partidos)
  } catch (error) {
    console.error('Error al obtener partidos:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
