import conectarDB from "../_db.js";

// Mapeo de nombres API-Football → nombres en nuestra DB
const NOMBRES_MAP = {
  // América
  Mexico: "Mexico",
  "South Africa": "Sudafrica",
  "South Korea": "Corea del Sur",
  "Korea Republic": "Corea del Sur",
  "Czech Republic": "Chequia",
  Czechia: "Chequia",
  Canada: "Canada",
  "Bosnia and Herzegovina": "Bosnia",
  "Bosnia & Herzegovina": "Bosnia",
  Qatar: "Qatar",
  Switzerland: "Suiza",
  Brazil: "Brasil",
  Morocco: "Marruecos",
  Haiti: "Haiti",
  Scotland: "Escocia",
  "United States": "Estados Unidos",
  USA: "Estados Unidos",
  Paraguay: "Paraguay",
  Australia: "Australia",
  Turkey: "Turquia",
  Türkiye: "Turquia",
  Germany: "Alemania",
  Curaçao: "Curazao",
  Curacao: "Curazao",
  "Ivory Coast": "Costa de Marfil",
  "Côte d'Ivoire": "Costa de Marfil",
  Ecuador: "Ecuador",
  Netherlands: "Holanda",
  Japan: "Japon",
  Tunisia: "Tunisia",
  Spain: "España",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  Uruguay: "Uruguay",
  Belgium: "Belgica",
  Egypt: "Egipto",
  Iran: "Iran",
  "New Zealand": "Nueva Zelanda",
  France: "Francia",
  Senegal: "Senegal",
  Iraq: "Iraq",
  Norway: "Noruega",
  Argentina: "Argentina",
  Algeria: "Argelia",
  Austria: "Austria",
  Jordan: "Jordania",
  Portugal: "Portugal",
  "DR Congo": "RD Congo",
  "Congo DR": "RD Congo",
  "Democratic Republic of Congo": "RD Congo",
  Uzbekistan: "Uzbekistan",
  Colombia: "Colombia",
  England: "Inglaterra",
  Croatia: "Croacia",
  Ghana: "Ghana",
  Panama: "Panama",
  Sweden: "Suecia",
  Serbia: "Serbia",
  Venezuela: "Venezuela",
};
const traducir = (nombre) => NOMBRES_MAP[nombre] || nombre;

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const adminId = req.headers["x-admin-id"] || req.body?.userId;
  if (adminId !== process.env.ADMIN_USER_ID) {
    return res.status(403).json({ error: "No autorizado" });
  }

  if (!process.env.API_FOOTBALL_KEY) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY no configurada" });
  }

  const leagueId = parseInt(req.body?.leagueId) || 1;
  const season = parseInt(req.body?.season) || 2026;
  const soloRecientes = req.body?.soloRecientes ?? false;

  try {
    const db = await conectarDB();

    const url = soloRecientes
      ? `https://v3.football.api-sports.io/fixtures?date=${new Date().toISOString().split("T")[0]}`
      : `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`;

    const response = await fetch(url, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    });

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `API-Football respondió con ${response.status}` });
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      return res
        .status(502)
        .json({ error: "Error de API-Football", detalle: data.errors });
    }

    if (!data.response || data.response.length === 0) {
      return res
        .status(200)
        .json({ actualizados: 0, mensaje: "No hay partidos disponibles" });
    }

    let actualizados = 0;
    let nuevos = 0;

    for (const fixture of data.response) {
      const { fixture: f, teams, goals, league } = fixture;

      const localTraducido = traducir(teams.home.name);
      const visitanteTraducido = traducir(teams.away.name);

      // Primero intentar matchear con partido existente por equipos
      const partidoExistente = await db.collection("partidos").findOne({
        local: localTraducido,
        visitante: visitanteTraducido,
        esMundial: true,
      });

      if (partidoExistente) {
        // Actualizar partido existente con fixtureId y resultado
        await db.collection("partidos").updateOne(
          { _id: partidoExistente._id },
          {
            $set: {
              fixtureId: f.id,
              estado: f.status.short,
              golesLocal: goals.home,
              golesVisitante: goals.away,
              banderaLocal: teams.home.logo,
              banderaVisitante: teams.away.logo,
              updatedAt: new Date(),
            },
          },
        );
        actualizados++;
      } else {
        // Partido nuevo (eliminatorias) — insertar
        await db.collection("partidos").updateOne(
          { fixtureId: f.id },
          {
            $set: {
              fixtureId: f.id,
              local: localTraducido,
              visitante: visitanteTraducido,
              banderaLocal: teams.home.logo,
              banderaVisitante: teams.away.logo,
              fecha: new Date(f.date),
              estado: f.status.short,
              golesLocal: goals.home,
              golesVisitante: goals.away,
              grupo: league.round,
              ronda: league.round,
              esMundial: true,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true },
        );
        nuevos++;
      }
    }

    return res.status(200).json({
      actualizados,
      nuevos,
      mensaje: `✓ ${actualizados} partidos actualizados, ${nuevos} nuevos`,
    });
  } catch (error) {
    console.error("Error sincronizando:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
