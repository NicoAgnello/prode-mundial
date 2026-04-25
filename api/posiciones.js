import conectarDB from './_db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const db = await conectarDB()
    const partidos = await db.collection('partidos').find({
      estado: 'FT',
      $or: [{ grupo: { $regex: /^Grupo/ } }, { ronda: { $regex: /^Grupo/ } }],
    }).toArray()

    const tabla = {}

    for (const p of partidos) {
      const key = p.grupo || p.ronda
      if (!key?.startsWith('Grupo')) continue
      if (!tabla[key]) tabla[key] = {}

      const init = (nombre, bandera) => {
        if (!tabla[key][nombre])
          tabla[key][nombre] = { nombre, bandera: bandera || '', pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 }
      }

      init(p.local, p.banderaLocal)
      init(p.visitante, p.banderaVisitante)

      const gL = p.golesLocal
      const gV = p.golesVisitante
      if (gL == null || gV == null) continue

      const tL = tabla[key][p.local]
      const tV = tabla[key][p.visitante]
      tL.pj++; tV.pj++
      tL.gf += gL; tL.gc += gV
      tV.gf += gV; tV.gc += gL

      if (gL > gV) { tL.g++; tV.p++ }
      else if (gV > gL) { tV.g++; tL.p++ }
      else { tL.e++; tV.e++ }
    }

    const resultado = {}
    for (const [key, equipos] of Object.entries(tabla)) {
      resultado[key] = Object.values(equipos)
        .map(e => ({ ...e, dg: e.gf - e.gc, pts: e.g * 3 + e.e }))
        .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    }

    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Error en posiciones:', error)
    return res.status(500).json({ error: 'Error interno' })
  }
}
