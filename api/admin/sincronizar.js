import conectarDB from '../_db.js'

// Período del mundial (unos días antes para probar)
const MUNDIAL_INICIO = new Date('2026-06-08T00:00:00Z')
const MUNDIAL_FIN = new Date('2026-07-21T23:59:59Z')

// Nombres que devuelve football-data.org → nombres en nuestra DB
const NOMBRES_MAP = {
  Mexico: 'Mexico',
  'South Africa': 'Sudafrica',
  'South Korea': 'Corea del Sur',
  'Korea Republic': 'Corea del Sur',
  Czechia: 'Chequia',
  'Czech Republic': 'Chequia',
  Canada: 'Canada',
  'Bosnia and Herzegovina': 'Bosnia',
  'Bosnia & Herzegovina': 'Bosnia',
  Qatar: 'Qatar',
  Switzerland: 'Suiza',
  Brazil: 'Brasil',
  Morocco: 'Marruecos',
  Haiti: 'Haiti',
  Scotland: 'Escocia',
  'United States': 'Estados Unidos',
  USA: 'Estados Unidos',
  Paraguay: 'Paraguay',
  Australia: 'Australia',
  Turkey: 'Turquia',
  Türkiye: 'Turquia',
  Germany: 'Alemania',
  'Curaçao': 'Curazao',
  Curacao: 'Curazao',
  'Ivory Coast': 'Costa de Marfil',
  "Côte d'Ivoire": 'Costa de Marfil',
  Ecuador: 'Ecuador',
  Netherlands: 'Holanda',
  Japan: 'Japon',
  Tunisia: 'Tunisia',
  Spain: 'España',
  'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arabia Saudita',
  Uruguay: 'Uruguay',
  Belgium: 'Belgica',
  Egypt: 'Egipto',
  Iran: 'Iran',
  'New Zealand': 'Nueva Zelanda',
  France: 'Francia',
  Senegal: 'Senegal',
  Iraq: 'Iraq',
  Norway: 'Noruega',
  Argentina: 'Argentina',
  Algeria: 'Argelia',
  Austria: 'Austria',
  Jordan: 'Jordania',
  Portugal: 'Portugal',
  'DR Congo': 'RD Congo',
  'Congo DR': 'RD Congo',
  'Democratic Republic of Congo': 'RD Congo',
  Uzbekistan: 'Uzbekistan',
  Colombia: 'Colombia',
  England: 'Inglaterra',
  Croatia: 'Croacia',
  Ghana: 'Ghana',
  Panama: 'Panama',
  Sweden: 'Suecia',
  Serbia: 'Serbia',
  Venezuela: 'Venezuela',
  Slovenia: 'Eslovenia',
}

const traducir = (nombre) => NOMBRES_MAP[nombre] || nombre

const calcularPuntos = (prediccion, golesLocal, golesVisitante) => {
  const exacto =
    prediccion.golesLocal === golesLocal &&
    prediccion.golesVisitante === golesVisitante
  if (exacto) return 3
  const ganadorReal =
    golesLocal > golesVisitante ? 'local' : golesVisitante > golesLocal ? 'visitante' : 'empate'
  const ganadorPred =
    prediccion.golesLocal > prediccion.golesVisitante
      ? 'local'
      : prediccion.golesVisitante > prediccion.golesLocal
        ? 'visitante'
        : 'empate'
  return ganadorReal === ganadorPred ? 1 : 0
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-id, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // Auth: admin manual (x-admin-id) o Vercel cron (Authorization: Bearer CRON_SECRET)
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers['authorization']
  const adminId = req.headers['x-admin-id']

  const esCron = cronSecret && authHeader === `Bearer ${cronSecret}`
  const esAdmin = adminId === process.env.ADMIN_USER_ID

  if (!esCron && !esAdmin) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  // Solo correr durante el período del mundial
  const ahora = new Date()
  if (ahora < MUNDIAL_INICIO || ahora > MUNDIAL_FIN) {
    return res.status(200).json({
      omitido: true,
      mensaje: 'Fuera del período del mundial, no hay nada que sincronizar',
    })
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY no configurada en las variables de entorno' })
  }

  try {
    const db = await conectarDB()

    // Paso 1: Lockear predicciones para partidos que ya empezaron
    // Si la fecha del partido ya pasó y todavía figura NS, lo pasamos a 1H
    // Así nadie puede seguir prediciendo aunque el resultado no esté aún
    const lockResult = await db.collection('partidos').updateMany(
      { esMundial: true, estado: 'NS', fecha: { $lt: ahora } },
      { $set: { estado: '1H', updatedAt: new Date() } }
    )

    // Paso 2: Obtener resultados finales de football-data.org
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED',
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (!response.ok) {
      return res.status(502).json({
        error: `Error al consultar football-data.org (HTTP ${response.status})`,
      })
    }

    const { matches } = await response.json()

    if (!matches || matches.length === 0) {
      return res.status(200).json({
        lockeados: lockResult.modifiedCount,
        actualizados: 0,
        puntosCalculados: 0,
        mensaje: `✓ ${lockResult.modifiedCount} partidos lockeados. Sin resultados nuevos.`,
      })
    }

    let actualizados = 0
    let puntosCalculados = 0

    for (const match of matches) {
      const golesLocal = match.score?.fullTime?.home
      const golesVisitante = match.score?.fullTime?.away

      // Saltear si no tiene score completo (no debería pasar con status=FINISHED)
      if (typeof golesLocal !== 'number' || typeof golesVisitante !== 'number') continue

      const localTraducido = traducir(match.homeTeam.name)
      const visitanteTraducido = traducir(match.awayTeam.name)

      // Solo procesar partidos que aún no están en FT en nuestra DB
      const partido = await db.collection('partidos').findOne({
        local: localTraducido,
        visitante: visitanteTraducido,
        esMundial: true,
        estado: { $ne: 'FT' },
      })

      if (!partido) continue

      // Actualizar resultado en DB
      await db.collection('partidos').updateOne(
        { _id: partido._id },
        { $set: { estado: 'FT', golesLocal, golesVisitante, updatedAt: new Date() } }
      )
      actualizados++

      // Calcular y guardar puntos para cada predicción de este partido
      const predicciones = await db
        .collection('predicciones')
        .find({ partidoId: partido._id })
        .toArray()

      for (const pred of predicciones) {
        const puntos = calcularPuntos(pred, golesLocal, golesVisitante)
        await db.collection('predicciones').updateOne(
          { _id: pred._id },
          { $set: { puntos, recalculadoAt: new Date() } }
        )
        puntosCalculados++
      }
    }

    return res.status(200).json({
      lockeados: lockResult.modifiedCount,
      actualizados,
      puntosCalculados,
      mensaje: `✓ ${lockResult.modifiedCount} lockeados, ${actualizados} resultados nuevos, ${puntosCalculados} puntos calculados`,
    })
  } catch (error) {
    console.error('Error en sincronizar:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
