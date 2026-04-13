import conectarDB from './_db.js'

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { userId, nombre, email, foto } = req.body

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId y email requeridos' })
  }
  if (userId.length > 100) {
    return res.status(400).json({ error: 'userId inválido' })
  }
  if (!validarEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' })
  }
  if (nombre && nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre demasiado largo' })
  }

  try {
    const db = await conectarDB()

    const usuario = await db.collection('usuarios').findOneAndUpdate(
      { userId },
      {
        $set: { nombre, email, foto, lastLogin: new Date() },
        $setOnInsert: { userId, createdAt: new Date(), puntos: 0 },
      },
      { upsert: true, returnDocument: 'after' }
    )

    return res.status(200).json(usuario)
  } catch (error) {
    console.error('Error registrando usuario:', error)
    return res.status(500).json({ error: 'Error interno' })
  }
}