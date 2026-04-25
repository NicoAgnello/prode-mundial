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

    // Preparar resultados válidos de la API (con score completo)
    const resultadosAPI = matches
      .map((m) => ({
        local: traducir(m.homeTeam.name),
        visitante: traducir(m.awayTeam.name),
        golesLocal: m.score?.fullTime?.home,
        golesVisitante: m.score?.fullTime?.away,
      }))
      .filter((m) => typeof m.golesLocal === 'number' && typeof m.golesVisitante === 'number')

    // Cargar de una sola vez todos los partidos pendientes de actualizar
    const pares = resultadosAPI.map((m) => ({ local: m.local, visitante: m.visitante }))
    const partidosPendientes = await db.collection('partidos').find({
      esMundial: true,
      estado: { $ne: 'FT' },
      $or: pares.map((p) => ({ local: p.local, visitante: p.visitante })),
    }).toArray()

    if (partidosPendientes.length === 0) {
      return res.status(200).json({
        lockeados: lockResult.modifiedCount,
        actualizados: 0,
        puntosCalculados: 0,
        mensaje: `✓ ${lockResult.modifiedCount} lockeados. Sin resultados nuevos.`,
      })
    }

    // Mapa para lookup rápido
    const resultadoMap = {}
    for (const r of resultadosAPI) resultadoMap[`${r.local}|${r.visitante}`] = r

    const ahora2 = new Date()

    // Bulk update partidos
    await db.collection('partidos').bulkWrite(
      partidosPendientes.map((p) => {
        const r = resultadoMap[`${p.local}|${p.visitante}`]
        return {
          updateOne: {
            filter: { _id: p._id },
            update: { $set: { estado: 'FT', golesLocal: r.golesLocal, golesVisitante: r.golesVisitante, updatedAt: ahora2 } },
          },
        }
      })
    )
    const actualizados = partidosPendientes.length

    // Calcular puntos: cargar todas las predicciones de esos partidos de una vez
    const idsPartidos = partidosPendientes.map((p) => p._id)
    const predicciones = await db.collection('predicciones').find({ partidoId: { $in: idsPartidos } }).toArray()

    const partidoIdMap = {}
    for (const p of partidosPendientes) {
      const r = resultadoMap[`${p.local}|${p.visitante}`]
      partidoIdMap[p._id.toString()] = r
    }

    const bulkPreds = predicciones.map((pred) => {
      const r = partidoIdMap[pred.partidoId.toString()]
      const puntos = r ? calcularPuntos(pred, r.golesLocal, r.golesVisitante) : null
      return {
        updateOne: {
          filter: { _id: pred._id },
          update: { $set: { puntos, recalculadoAt: ahora2 } },
        },
      }
    }).filter((op) => op.updateOne.update.$set.puntos !== null)

    if (bulkPreds.length > 0) await db.collection('predicciones').bulkWrite(bulkPreds)
    const puntosCalculados = bulkPreds.length

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
