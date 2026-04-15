import conectarDB from "../_db.js";

const flag = (code) => `https://flagcdn.com/w80/${code.toLowerCase()}.png`;

const SELECCIONES = {
  Mexico: flag("mx"),
  Sudafrica: flag("za"),
  "Corea del Sur": flag("kr"),
  Chequia: flag("cz"),
  Canada: flag("ca"),
  Bosnia: flag("ba"),
  Qatar: flag("qa"),
  Suiza: flag("ch"),
  Brasil: flag("br"),
  Marruecos: flag("ma"),
  Haiti: flag("ht"),
  Escocia: flag("gb-sct"),
  "Estados Unidos": flag("us"),
  Paraguay: flag("py"),
  Australia: flag("au"),
  Turquia: flag("tr"),
  Alemania: flag("de"),
  Curazao: flag("cw"),
  "Costa de Marfil": flag("ci"),
  Ecuador: flag("ec"),
  Holanda: flag("nl"),
  Japon: flag("jp"),
  Tunisia: flag("tn"),
  España: flag("es"),
  "Cabo Verde": flag("cv"),
  "Arabia Saudita": flag("sa"),
  Uruguay: flag("uy"),
  Belgica: flag("be"),
  Egipto: flag("eg"),
  Iran: flag("ir"),
  "Nueva Zelanda": flag("nz"),
  Francia: flag("fr"),
  Senegal: flag("sn"),
  Iraq: flag("iq"),
  Noruega: flag("no"),
  Argentina: flag("ar"),
  Argelia: flag("dz"),
  Austria: flag("at"),
  Jordania: flag("jo"),
  Portugal: flag("pt"),
  "RD Congo": flag("cd"),
  Uzbekistan: flag("uz"),
  Colombia: flag("co"),
  Inglaterra: flag("gb-eng"),
  Croacia: flag("hr"),
  Ghana: flag("gh"),
  Panama: flag("pa"),
  Suecia: flag("se"),
  Serbia: flag("rs"),
  Eslovenia: flag("si"),
  Venezuela: flag("ve"),
};

// Fixture real confirmado - Mundial 2026
// Fuente: ESPN, Yahoo Sports, FIFA (abril 2026)
// Nota: algunos equipos aún pendientes de playoffs se marcan con su nombre provisional
const PARTIDOS_MUNDIAL = [
  // GRUPO A: Mexico, Sudafrica, Corea del Sur, Chequia
  {
    grupo: "Grupo A",
    local: "Mexico",
    visitante: "Sudafrica",
    fecha: "2026-06-11T20:00:00",
    sede: "Ciudad de Mexico",
  },
  {
    grupo: "Grupo A",
    local: "Corea del Sur",
    visitante: "Chequia",
    fecha: "2026-06-12T01:00:00",
    sede: "Guadalajara",
  },
  {
    grupo: "Grupo A",
    local: "Chequia",
    visitante: "Sudafrica",
    fecha: "2026-06-18T17:00:00",
    sede: "Atlanta",
  },
  {
    grupo: "Grupo A",
    local: "Mexico",
    visitante: "Corea del Sur",
    fecha: "2026-06-19T02:00:00",
    sede: "Guadalajara",
  },
  {
    grupo: "Grupo A",
    local: "Chequia",
    visitante: "Mexico",
    fecha: "2026-06-25T02:00:00",
    sede: "Ciudad de Mexico",
  },
  {
    grupo: "Grupo A",
    local: "Sudafrica",
    visitante: "Corea del Sur",
    fecha: "2026-06-25T02:00:00",
    sede: "Monterrey",
  },

  // GRUPO B: Canada, Bosnia, Qatar, Suiza
  {
    grupo: "Grupo B",
    local: "Canada",
    visitante: "Bosnia",
    fecha: "2026-06-12T20:00:00",
    sede: "Toronto",
  },
  {
    grupo: "Grupo B",
    local: "Qatar",
    visitante: "Suiza",
    fecha: "2026-06-13T20:00:00",
    sede: "Santa Clara",
  },
  {
    grupo: "Grupo B",
    local: "Suiza",
    visitante: "Bosnia",
    fecha: "2026-06-18T23:00:00",
    sede: "Los Angeles",
  },
  {
    grupo: "Grupo B",
    local: "Canada",
    visitante: "Qatar",
    fecha: "2026-06-19T01:00:00",
    sede: "Vancouver",
  },
  {
    grupo: "Grupo B",
    local: "Suiza",
    visitante: "Canada",
    fecha: "2026-06-25T20:00:00",
    sede: "Vancouver",
  },
  {
    grupo: "Grupo B",
    local: "Bosnia",
    visitante: "Qatar",
    fecha: "2026-06-25T20:00:00",
    sede: "Seattle",
  },

  // GRUPO C: Brasil, Marruecos, Haiti, Escocia
  {
    grupo: "Grupo C",
    local: "Brasil",
    visitante: "Marruecos",
    fecha: "2026-06-13T23:00:00",
    sede: "Nueva York",
  },
  {
    grupo: "Grupo C",
    local: "Haiti",
    visitante: "Escocia",
    fecha: "2026-06-14T02:00:00",
    sede: "Boston",
  },
  {
    grupo: "Grupo C",
    local: "Escocia",
    visitante: "Marruecos",
    fecha: "2026-06-19T23:00:00",
    sede: "Boston",
  },
  {
    grupo: "Grupo C",
    local: "Brasil",
    visitante: "Haiti",
    fecha: "2026-06-20T01:30:00",
    sede: "Filadelfia",
  },
  {
    grupo: "Grupo C",
    local: "Escocia",
    visitante: "Brasil",
    fecha: "2026-06-25T23:00:00",
    sede: "Miami",
  },
  {
    grupo: "Grupo C",
    local: "Marruecos",
    visitante: "Haiti",
    fecha: "2026-06-25T23:00:00",
    sede: "Miami",
  },

  // GRUPO D: Estados Unidos, Paraguay, Australia, Turquia
  {
    grupo: "Grupo D",
    local: "Estados Unidos",
    visitante: "Paraguay",
    fecha: "2026-06-13T02:00:00",
    sede: "Los Angeles",
  },
  {
    grupo: "Grupo D",
    local: "Australia",
    visitante: "Turquia",
    fecha: "2026-06-14T05:00:00",
    sede: "Vancouver",
  },
  {
    grupo: "Grupo D",
    local: "Turquia",
    visitante: "Paraguay",
    fecha: "2026-06-20T00:00:00",
    sede: "Dallas",
  },
  {
    grupo: "Grupo D",
    local: "Estados Unidos",
    visitante: "Australia",
    fecha: "2026-06-20T02:00:00",
    sede: "Kansas City",
  },
  {
    grupo: "Grupo D",
    local: "Turquia",
    visitante: "Estados Unidos",
    fecha: "2026-06-26T02:00:00",
    sede: "Los Angeles",
  },
  {
    grupo: "Grupo D",
    local: "Paraguay",
    visitante: "Australia",
    fecha: "2026-06-26T02:00:00",
    sede: "Dallas",
  },

  // GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
  {
    grupo: "Grupo E",
    local: "Alemania",
    visitante: "Curazao",
    fecha: "2026-06-14T18:00:00",
    sede: "Houston",
  },
  {
    grupo: "Grupo E",
    local: "Costa de Marfil",
    visitante: "Ecuador",
    fecha: "2026-06-15T00:00:00",
    sede: "Filadelfia",
  },
  {
    grupo: "Grupo E",
    local: "Ecuador",
    visitante: "Curazao",
    fecha: "2026-06-20T18:00:00",
    sede: "Boston",
  },
  {
    grupo: "Grupo E",
    local: "Alemania",
    visitante: "Costa de Marfil",
    fecha: "2026-06-21T00:00:00",
    sede: "Dallas",
  },
  {
    grupo: "Grupo E",
    local: "Ecuador",
    visitante: "Alemania",
    fecha: "2026-06-26T23:00:00",
    sede: "Dallas",
  },
  {
    grupo: "Grupo E",
    local: "Curazao",
    visitante: "Costa de Marfil",
    fecha: "2026-06-26T23:00:00",
    sede: "Houston",
  },

  // GRUPO F: Holanda, Japon, Tunisia, (playoff ganador)
  {
    grupo: "Grupo F",
    local: "Holanda",
    visitante: "Japon",
    fecha: "2026-06-14T21:00:00",
    sede: "Arlington",
  },
  {
    grupo: "Grupo F",
    local: "Tunisia",
    visitante: "Suecia",
    fecha: "2026-06-15T03:00:00",
    sede: "Guadalajara",
  },

  {
    grupo: "Grupo F",
    local: "Japon",
    visitante: "Tunisia",
    fecha: "2026-06-21T00:00:00",
    sede: "Los Angeles",
  },
  {
    grupo: "Grupo F",
    local: "Holanda",
    visitante: "Suecia",
    fecha: "2026-06-21T03:00:00",
    sede: "San Francisco",
  },
  {
    grupo: "Grupo F",
    local: "Japon",
    visitante: "Suecia",
    fecha: "2026-06-27T02:00:00",
    sede: "San Francisco",
  },
  {
    grupo: "Grupo F",
    local: "Tunisia",
    visitante: "Holanda",
    fecha: "2026-06-27T02:00:00",
    sede: "Los Angeles",
  },

  // GRUPO G: Belgica, Egipto, Iran, Nueva Zelanda
  {
    grupo: "Grupo G",
    local: "Belgica",
    visitante: "Egipto",
    fecha: "2026-06-15T23:00:00",
    sede: "Seattle",
  },
  {
    grupo: "Grupo G",
    local: "Iran",
    visitante: "Nueva Zelanda",
    fecha: "2026-06-16T05:00:00",
    sede: "Los Angeles",
  },
  {
    grupo: "Grupo G",
    local: "Nueva Zelanda",
    visitante: "Egipto",
    fecha: "2026-06-21T23:00:00",
    sede: "Seattle",
  },
  {
    grupo: "Grupo G",
    local: "Belgica",
    visitante: "Iran",
    fecha: "2026-06-22T02:00:00",
    sede: "Los Angeles",
  },
  {
    grupo: "Grupo G",
    local: "Nueva Zelanda",
    visitante: "Belgica",
    fecha: "2026-06-27T23:00:00",
    sede: "San Francisco",
  },
  {
    grupo: "Grupo G",
    local: "Egipto",
    visitante: "Iran",
    fecha: "2026-06-27T23:00:00",
    sede: "Seattle",
  },

  // GRUPO H: España, Cabo Verde, Arabia Saudita, Uruguay
  {
    grupo: "Grupo H",
    local: "España",
    visitante: "Cabo Verde",
    fecha: "2026-06-15T18:00:00",
    sede: "Atlanta",
  },
  {
    grupo: "Grupo H",
    local: "Arabia Saudita",
    visitante: "Uruguay",
    fecha: "2026-06-15T23:00:00",
    sede: "Miami",
  },
  {
    grupo: "Grupo H",
    local: "Uruguay",
    visitante: "Cabo Verde",
    fecha: "2026-06-21T18:00:00",
    sede: "Miami",
  },
  {
    grupo: "Grupo H",
    local: "España",
    visitante: "Arabia Saudita",
    fecha: "2026-06-21T23:00:00",
    sede: "Atlanta",
  },
  {
    grupo: "Grupo H",
    local: "Uruguay",
    visitante: "España",
    fecha: "2026-06-27T18:00:00",
    sede: "Nueva York",
  },
  {
    grupo: "Grupo H",
    local: "Cabo Verde",
    visitante: "Arabia Saudita",
    fecha: "2026-06-27T18:00:00",
    sede: "Atlanta",
  },

  // GRUPO I: Francia, Senegal, Iraq, Noruega
  {
    grupo: "Grupo I",
    local: "Francia",
    visitante: "Senegal",
    fecha: "2026-06-16T20:00:00",
    sede: "Nueva York",
  },
  {
    grupo: "Grupo I",
    local: "Iraq",
    visitante: "Noruega",
    fecha: "2026-06-16T23:00:00",
    sede: "Boston",
  },
  {
    grupo: "Grupo I",
    local: "Noruega",
    visitante: "Senegal",
    fecha: "2026-06-22T20:00:00",
    sede: "Kansas City",
  },
  {
    grupo: "Grupo I",
    local: "Francia",
    visitante: "Iraq",
    fecha: "2026-06-22T23:00:00",
    sede: "Nueva York",
  },
  {
    grupo: "Grupo I",
    local: "Noruega",
    visitante: "Francia",
    fecha: "2026-06-28T02:00:00",
    sede: "Boston",
  },
  {
    grupo: "Grupo I",
    local: "Senegal",
    visitante: "Iraq",
    fecha: "2026-06-28T02:00:00",
    sede: "Kansas City",
  },

  // GRUPO J: Argentina, Argelia, Austria, Jordania
  {
    grupo: "Grupo J",
    local: "Argentina",
    visitante: "Argelia",
    fecha: "2026-06-17T02:00:00",
    sede: "Kansas City",
  },
  {
    grupo: "Grupo J",
    local: "Austria",
    visitante: "Jordania",
    fecha: "2026-06-17T05:00:00",
    sede: "San Francisco",
  },
  {
    grupo: "Grupo J",
    local: "Jordania",
    visitante: "Argelia",
    fecha: "2026-06-23T02:00:00",
    sede: "Kansas City",
  },
  {
    grupo: "Grupo J",
    local: "Argentina",
    visitante: "Austria",
    fecha: "2026-06-23T05:00:00",
    sede: "Dallas",
  },
  {
    grupo: "Grupo J",
    local: "Jordania",
    visitante: "Argentina",
    fecha: "2026-06-28T23:00:00",
    sede: "Dallas",
  },
  {
    grupo: "Grupo J",
    local: "Argelia",
    visitante: "Austria",
    fecha: "2026-06-28T23:00:00",
    sede: "San Francisco",
  },

  // GRUPO K: Portugal, RD Congo, Uzbekistan, Colombia
  {
    grupo: "Grupo K",
    local: "Portugal",
    visitante: "RD Congo",
    fecha: "2026-06-17T18:00:00",
    sede: "Houston",
  },
  {
    grupo: "Grupo K",
    local: "Uzbekistan",
    visitante: "Colombia",
    fecha: "2026-06-18T03:00:00",
    sede: "Ciudad de Mexico",
  },
  {
    grupo: "Grupo K",
    local: "Colombia",
    visitante: "RD Congo",
    fecha: "2026-06-23T18:00:00",
    sede: "Houston",
  },
  {
    grupo: "Grupo K",
    local: "Portugal",
    visitante: "Uzbekistan",
    fecha: "2026-06-23T21:00:00",
    sede: "Boston",
  },
  {
    grupo: "Grupo K",
    local: "Colombia",
    visitante: "Portugal",
    fecha: "2026-06-29T02:00:00",
    sede: "Ciudad de Mexico",
  },
  {
    grupo: "Grupo K",
    local: "RD Congo",
    visitante: "Uzbekistan",
    fecha: "2026-06-29T02:00:00",
    sede: "Houston",
  },

  // GRUPO L: Inglaterra, Croacia, Ghana, Panama
  {
    grupo: "Grupo L",
    local: "Inglaterra",
    visitante: "Croacia",
    fecha: "2026-06-17T21:00:00",
    sede: "Arlington",
  },
  {
    grupo: "Grupo L",
    local: "Ghana",
    visitante: "Panama",
    fecha: "2026-06-18T00:00:00",
    sede: "Toronto",
  },
  {
    grupo: "Grupo L",
    local: "Panama",
    visitante: "Croacia",
    fecha: "2026-06-23T21:00:00",
    sede: "Nueva York",
  },
  {
    grupo: "Grupo L",
    local: "Inglaterra",
    visitante: "Ghana",
    fecha: "2026-06-24T00:00:00",
    sede: "Miami",
  },
  {
    grupo: "Grupo L",
    local: "Panama",
    visitante: "Inglaterra",
    fecha: "2026-06-29T23:00:00",
    sede: "Miami",
  },
  {
    grupo: "Grupo L",
    local: "Croacia",
    visitante: "Ghana",
    fecha: "2026-06-29T23:00:00",
    sede: "Nueva York",
  },
];

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const adminId = req.headers["x-admin-id"];
  if (adminId !== process.env.ADMIN_USER_ID) {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {
    const db = await conectarDB();
    let cargados = 0;
    let actualizados = 0;

    for (const partido of PARTIDOS_MUNDIAL) {
      const banderaLocal = SELECCIONES[partido.local] || flag("un");
      const banderaVisitante = SELECCIONES[partido.visitante] || flag("un");

      const existing = await db.collection("partidos").findOne({
        local: partido.local,
        visitante: partido.visitante,
        esMundial: true,
      });

      if (existing) {
        await db.collection("partidos").updateOne(
          { _id: existing._id },
          {
            $set: {
              banderaLocal,
              banderaVisitante,
              fecha: new Date(partido.fecha),
              grupo: partido.grupo,
              ronda: partido.grupo,
              sede: partido.sede,
              updatedAt: new Date(),
            },
          },
        );
        actualizados++;
      } else {
        await db.collection("partidos").insertOne({
          local: partido.local,
          visitante: partido.visitante,
          banderaLocal,
          banderaVisitante,
          fecha: new Date(partido.fecha),
          estado: "NS",
          golesLocal: null,
          golesVisitante: null,
          grupo: partido.grupo,
          ronda: partido.grupo,
          sede: partido.sede,
          esMundial: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        cargados++;
      }
    }

    return res.status(200).json({
      cargados,
      actualizados,
      mensaje: `✓ ${cargados} partidos nuevos, ${actualizados} actualizados`,
    });
  } catch (error) {
    console.error("Error cargando Mundial:", error);
    return res.status(500).json({ error: error.message });
  }
}
