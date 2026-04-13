import conectarDB from '../_db.js'

// Banderas usando la API de flagcdn.com (gratis, sin key)
const flag = code => `https://flagcdn.com/w80/${code.toLowerCase()}.png`

// Selecciones clasificadas al Mundial 2026 con sus códigos de país
const SELECCIONES = {
  'Argentina': flag('ar'),
  'Brasil': flag('br'),
  'Uruguay': flag('uy'),
  'Colombia': flag('co'),
  'Ecuador': flag('ec'),
  'Paraguay': flag('py'),
  'Chile': flag('cl'),
  'Venezuela': flag('ve'),
  'Bolivia': flag('bo'),
  'Peru': flag('pe'),
  'Mexico': flag('mx'),
  'Estados Unidos': flag('us'),
  'Canada': flag('ca'),
  'Panama': flag('pa'),
  'Costa Rica': flag('cr'),
  'Honduras': flag('hn'),
  'El Salvador': flag('sv'),
  'Jamaica': flag('jm'),
  'Haiti': flag('ht'),
  'Trinidad y Tobago': flag('tt'),
  'España': flag('es'),
  'Francia': flag('fr'),
  'Alemania': flag('de'),
  'Portugal': flag('pt'),
  'Inglaterra': flag('gb-eng'),
  'Italia': flag('it'),
  'Holanda': flag('nl'),
  'Belgica': flag('be'),
  'Croacia': flag('hr'),
  'Serbia': flag('rs'),
  'Suiza': flag('ch'),
  'Dinamarca': flag('dk'),
  'Austria': flag('at'),
  'Turquia': flag('tr'),
  'Polonia': flag('pl'),
  'Escocia': flag('gb-sct'),
  'Hungria': flag('hu'),
  'Eslovaquia': flag('sk'),
  'Chequia': flag('cz'),
  'Rumania': flag('ro'),
  'Georgia': flag('ge'),
  'Albania': flag('al'),
  'Ukrania': flag('ua'),
  'Grecia': flag('gr'),
  'Marruecos': flag('ma'),
  'Senegal': flag('sn'),
  'Nigeria': flag('ng'),
  'Egipto': flag('eg'),
  'Costa de Marfil': flag('ci'),
  'Mali': flag('ml'),
  'Camerun': flag('cm'),
  'Sudafrica': flag('za'),
  'Ghana': flag('gh'),
  'Tanzania': flag('tz'),
  'Mozambique': flag('mz'),
  'Angola': flag('ao'),
  'Japon': flag('jp'),
  'Corea del Sur': flag('kr'),
  'Arabia Saudita': flag('sa'),
  'Iran': flag('ir'),
  'Australia': flag('au'),
  'Uzbekistan': flag('uz'),
  'Qatar': flag('qa'),
  'Iraq': flag('iq'),
  'Indonesia': flag('id'),
  'China': flag('cn'),
  'Nueva Zelanda': flag('nz'),
}

const PARTIDOS_MUNDIAL = [
  // GRUPO A
  { grupo: 'Grupo A', local: 'Mexico', visitante: 'Sudafrica', fecha: '2026-06-11T19:00:00', sede: 'Ciudad de Mexico' },
  { grupo: 'Grupo A', local: 'Corea del Sur', visitante: 'Georgia', fecha: '2026-06-11T22:00:00', sede: 'Guadalajara' },
  { grupo: 'Grupo A', local: 'Mexico', visitante: 'Corea del Sur', fecha: '2026-06-15T22:00:00', sede: 'Guadalajara' },
  { grupo: 'Grupo A', local: 'Georgia', visitante: 'Sudafrica', fecha: '2026-06-15T19:00:00', sede: 'Ciudad de Mexico' },
  { grupo: 'Grupo A', local: 'Mexico', visitante: 'Georgia', fecha: '2026-06-19T22:00:00', sede: 'Ciudad de Mexico' },
  { grupo: 'Grupo A', local: 'Sudafrica', visitante: 'Corea del Sur', fecha: '2026-06-19T22:00:00', sede: 'Guadalajara' },
  // GRUPO B
  { grupo: 'Grupo B', local: 'España', visitante: 'Panama', fecha: '2026-06-12T01:00:00', sede: 'Los Angeles' },
  { grupo: 'Grupo B', local: 'Marruecos', visitante: 'Belgica', fecha: '2026-06-12T22:00:00', sede: 'Atlanta' },
  { grupo: 'Grupo B', local: 'España', visitante: 'Marruecos', fecha: '2026-06-16T22:00:00', sede: 'Atlanta' },
  { grupo: 'Grupo B', local: 'Panama', visitante: 'Belgica', fecha: '2026-06-16T01:00:00', sede: 'Los Angeles' },
  { grupo: 'Grupo B', local: 'España', visitante: 'Belgica', fecha: '2026-06-20T22:00:00', sede: 'Los Angeles' },
  { grupo: 'Grupo B', local: 'Panama', visitante: 'Marruecos', fecha: '2026-06-20T22:00:00', sede: 'Atlanta' },
  // GRUPO C
  { grupo: 'Grupo C', local: 'Estados Unidos', visitante: 'Serbia', fecha: '2026-06-12T22:00:00', sede: 'Nueva York' },
  { grupo: 'Grupo C', local: 'Uruguay', visitante: 'Rumania', fecha: '2026-06-12T19:00:00', sede: 'Miami' },
  { grupo: 'Grupo C', local: 'Estados Unidos', visitante: 'Uruguay', fecha: '2026-06-17T01:00:00', sede: 'Miami' },
  { grupo: 'Grupo C', local: 'Rumania', visitante: 'Serbia', fecha: '2026-06-17T22:00:00', sede: 'Nueva York' },
  { grupo: 'Grupo C', local: 'Estados Unidos', visitante: 'Rumania', fecha: '2026-06-21T22:00:00', sede: 'Nueva York' },
  { grupo: 'Grupo C', local: 'Serbia', visitante: 'Uruguay', fecha: '2026-06-21T22:00:00', sede: 'Miami' },
  // GRUPO D
  { grupo: 'Grupo D', local: 'Francia', visitante: 'Nigeria', fecha: '2026-06-13T22:00:00', sede: 'Dallas' },
  { grupo: 'Grupo D', local: 'Australia', visitante: 'Arabia Saudita', fecha: '2026-06-13T19:00:00', sede: 'Kansas City' },
  { grupo: 'Grupo D', local: 'Francia', visitante: 'Australia', fecha: '2026-06-18T01:00:00', sede: 'Kansas City' },
  { grupo: 'Grupo D', local: 'Arabia Saudita', visitante: 'Nigeria', fecha: '2026-06-18T22:00:00', sede: 'Dallas' },
  { grupo: 'Grupo D', local: 'Francia', visitante: 'Arabia Saudita', fecha: '2026-06-22T22:00:00', sede: 'Dallas' },
  { grupo: 'Grupo D', local: 'Nigeria', visitante: 'Australia', fecha: '2026-06-22T22:00:00', sede: 'Kansas City' },
  // GRUPO E
  { grupo: 'Grupo E', local: 'Alemania', visitante: 'Costa Rica', fecha: '2026-06-13T22:00:00', sede: 'Filadelfia' },
  { grupo: 'Grupo E', local: 'Japon', visitante: 'Ecuador', fecha: '2026-06-13T19:00:00', sede: 'Boston' },
  { grupo: 'Grupo E', local: 'Alemania', visitante: 'Japon', fecha: '2026-06-18T22:00:00', sede: 'Boston' },
  { grupo: 'Grupo E', local: 'Ecuador', visitante: 'Costa Rica', fecha: '2026-06-18T19:00:00', sede: 'Filadelfia' },
  { grupo: 'Grupo E', local: 'Alemania', visitante: 'Ecuador', fecha: '2026-06-22T22:00:00', sede: 'Filadelfia' },
  { grupo: 'Grupo E', local: 'Costa Rica', visitante: 'Japon', fecha: '2026-06-22T22:00:00', sede: 'Boston' },
  // GRUPO F
  { grupo: 'Grupo F', local: 'Portugal', visitante: 'Angola', fecha: '2026-06-14T22:00:00', sede: 'Seattle' },
  { grupo: 'Grupo F', local: 'Croacia', visitante: 'Hungria', fecha: '2026-06-14T19:00:00', sede: 'San Francisco' },
  { grupo: 'Grupo F', local: 'Portugal', visitante: 'Croacia', fecha: '2026-06-19T22:00:00', sede: 'San Francisco' },
  { grupo: 'Grupo F', local: 'Hungria', visitante: 'Angola', fecha: '2026-06-19T19:00:00', sede: 'Seattle' },
  { grupo: 'Grupo F', local: 'Portugal', visitante: 'Hungria', fecha: '2026-06-23T22:00:00', sede: 'Seattle' },
  { grupo: 'Grupo F', local: 'Angola', visitante: 'Croacia', fecha: '2026-06-23T22:00:00', sede: 'San Francisco' },
  // GRUPO G
  { grupo: 'Grupo G', local: 'Brasil', visitante: 'Noruega', fecha: '2026-06-14T22:00:00', sede: 'Dallas' },
  { grupo: 'Grupo G', local: 'Japon', visitante: 'Colombia', fecha: '2026-06-14T19:00:00', sede: 'Miami' },
  { grupo: 'Grupo G', local: 'Brasil', visitante: 'Japon', fecha: '2026-06-19T22:00:00', sede: 'Miami' },
  { grupo: 'Grupo G', local: 'Colombia', visitante: 'Noruega', fecha: '2026-06-19T19:00:00', sede: 'Dallas' },
  { grupo: 'Grupo G', local: 'Brasil', visitante: 'Colombia', fecha: '2026-06-23T22:00:00', sede: 'Dallas' },
  { grupo: 'Grupo G', local: 'Noruega', visitante: 'Japon', fecha: '2026-06-23T22:00:00', sede: 'Miami' },
  // GRUPO H
  { grupo: 'Grupo H', local: 'Inglaterra', visitante: 'Senegal', fecha: '2026-06-15T22:00:00', sede: 'Nueva York' },
  { grupo: 'Grupo H', local: 'Holanda', visitante: 'Qatar', fecha: '2026-06-15T19:00:00', sede: 'Boston' },
  { grupo: 'Grupo H', local: 'Inglaterra', visitante: 'Holanda', fecha: '2026-06-20T22:00:00', sede: 'Boston' },
  { grupo: 'Grupo H', local: 'Qatar', visitante: 'Senegal', fecha: '2026-06-20T19:00:00', sede: 'Nueva York' },
  { grupo: 'Grupo H', local: 'Inglaterra', visitante: 'Qatar', fecha: '2026-06-24T22:00:00', sede: 'Nueva York' },
  { grupo: 'Grupo H', local: 'Senegal', visitante: 'Holanda', fecha: '2026-06-24T22:00:00', sede: 'Boston' },
  // GRUPO I
  { grupo: 'Grupo I', local: 'Argentina', visitante: 'Canada', fecha: '2026-06-15T22:00:00', sede: 'Los Angeles' },
  { grupo: 'Grupo I', local: 'Iran', visitante: 'Suiza', fecha: '2026-06-15T19:00:00', sede: 'Seattle' },
  { grupo: 'Grupo I', local: 'Argentina', visitante: 'Iran', fecha: '2026-06-20T22:00:00', sede: 'Seattle' },
  { grupo: 'Grupo I', local: 'Suiza', visitante: 'Canada', fecha: '2026-06-20T19:00:00', sede: 'Los Angeles' },
  { grupo: 'Grupo I', local: 'Argentina', visitante: 'Suiza', fecha: '2026-06-24T22:00:00', sede: 'Los Angeles' },
  { grupo: 'Grupo I', local: 'Canada', visitante: 'Iran', fecha: '2026-06-24T22:00:00', sede: 'Seattle' },
  // GRUPO J
  { grupo: 'Grupo J', local: 'Turquia', visitante: 'Indonesia', fecha: '2026-06-16T22:00:00', sede: 'Atlanta' },
  { grupo: 'Grupo J', local: 'China', visitante: 'Escocia', fecha: '2026-06-16T19:00:00', sede: 'Filadelfia' },
  { grupo: 'Grupo J', local: 'Turquia', visitante: 'China', fecha: '2026-06-21T22:00:00', sede: 'Filadelfia' },
  { grupo: 'Grupo J', local: 'Escocia', visitante: 'Indonesia', fecha: '2026-06-21T19:00:00', sede: 'Atlanta' },
  { grupo: 'Grupo J', local: 'Turquia', visitante: 'Escocia', fecha: '2026-06-25T22:00:00', sede: 'Atlanta' },
  { grupo: 'Grupo J', local: 'Indonesia', visitante: 'China', fecha: '2026-06-25T22:00:00', sede: 'Filadelfia' },
  // GRUPO K
  { grupo: 'Grupo K', local: 'Costa de Marfil', visitante: 'Venezuela', fecha: '2026-06-16T22:00:00', sede: 'Kansas City' },
  { grupo: 'Grupo K', local: 'Austria', visitante: 'Paraguay', fecha: '2026-06-16T19:00:00', sede: 'Dallas' },
  { grupo: 'Grupo K', local: 'Costa de Marfil', visitante: 'Austria', fecha: '2026-06-21T22:00:00', sede: 'Dallas' },
  { grupo: 'Grupo K', local: 'Paraguay', visitante: 'Venezuela', fecha: '2026-06-21T19:00:00', sede: 'Kansas City' },
  { grupo: 'Grupo K', local: 'Costa de Marfil', visitante: 'Paraguay', fecha: '2026-06-25T22:00:00', sede: 'Kansas City' },
  { grupo: 'Grupo K', local: 'Venezuela', visitante: 'Austria', fecha: '2026-06-25T22:00:00', sede: 'Dallas' },
  // GRUPO L
  { grupo: 'Grupo L', local: 'Nigeria', visitante: 'Uzbekistan', fecha: '2026-06-17T22:00:00', sede: 'Houston' },
  { grupo: 'Grupo L', local: 'Mexico', visitante: 'Eslovaquia', fecha: '2026-06-17T19:00:00', sede: 'San Francisco' },
  { grupo: 'Grupo L', local: 'Nigeria', visitante: 'Mexico', fecha: '2026-06-22T22:00:00', sede: 'San Francisco' },
  { grupo: 'Grupo L', local: 'Eslovaquia', visitante: 'Uzbekistan', fecha: '2026-06-22T19:00:00', sede: 'Houston' },
  { grupo: 'Grupo L', local: 'Nigeria', visitante: 'Eslovaquia', fecha: '2026-06-26T22:00:00', sede: 'Houston' },
  { grupo: 'Grupo L', local: 'Uzbekistan', visitante: 'Mexico', fecha: '2026-06-26T22:00:00', sede: 'San Francisco' },
]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminId = req.headers['x-admin-id'] || req.body?.userId
if (adminId !== process.env.ADMIN_USER_ID) {
  return res.status(403).json({ error: 'No autorizado' })
}
  try {
    const db = await conectarDB()

    // Limpiar partidos anteriores de prueba (no mundialistas)
    await db.collection('partidos').deleteMany({ fixtureId: { $exists: true } })

    let cargados = 0
    for (const partido of PARTIDOS_MUNDIAL) {
      const banderaLocal = SELECCIONES[partido.local] || `https://flagcdn.com/w80/un.png`
      const banderaVisitante = SELECCIONES[partido.visitante] || `https://flagcdn.com/w80/un.png`

      await db.collection('partidos').insertOne({
        local: partido.local,
        visitante: partido.visitante,
        banderaLocal,
        banderaVisitante,
        fecha: new Date(partido.fecha),
        estado: 'NS',
        golesLocal: null,
        golesVisitante: null,
        grupo: partido.grupo,
        ronda: partido.grupo,
        sede: partido.sede,
        esMundial: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      cargados++
    }

    return res.status(200).json({
      cargados,
      mensaje: `✓ ${cargados} partidos del Mundial 2026 cargados correctamente`
    })
  } catch (error) {
    console.error('Error cargando Mundial:', error)
    return res.status(500).json({ error: error.message })
  }
}