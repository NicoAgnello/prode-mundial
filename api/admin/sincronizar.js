import conectarDB from "../_db.js";

// Mapeo nombres openfootball → nombres en nuestra DB
const NOMBRES_MAP = {
  Mexico: "Mexico",
  "South Africa": "Sudafrica",
  "South Korea": "Corea del Sur",
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
  USA: "Estados Unidos",
  "United States": "Estados Unidos",
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
  "South Korea": "Corea del Sur",
  // Playoffs ya resueltos — openfootball aún no actualizó estos nombres
  "IC Path 1 winner": "RD Congo",
  "IC Path 2 winner": "Iraq",
  "UEFA Path A winner": "Bosnia",
  "UEFA Path B winner": "Suecia",
  "UEFA Path C winner": "Turquia",
  "UEFA Path D winner": "Chequia",
};

const traducir = (nombre) => NOMBRES_MAP[nombre] || nombre;

const inferirEstado = (partido, fechaPartido) => {
  // Si tiene score → terminado
  if (partido.score && partido.score.ft) return "FT";
  // Si la fecha ya pasó pero no tiene score → puede estar en juego o sin datos aún
  const ahora = new Date();
  const fecha = new Date(fechaPartido);
  if (fecha < ahora) return "NS"; // lo dejamos NS hasta que aparezca el score
  return "NS";
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const adminId = req.headers["x-admin-id"] || req.body?.userId;
  if (adminId !== process.env.ADMIN_USER_ID) {
    return res.status(403).json({ error: "No autorizado" });
  }

  try {
    const db = await conectarDB();

    // Fetch del JSON de openfootball — gratis, sin API key
    const response = await fetch(
      "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json",
    );

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "No se pudo obtener datos de openfootball" });
    }

    const data = await response.json();

    if (!data.matches || data.matches.length === 0) {
      return res
        .status(200)
        .json({ actualizados: 0, mensaje: "No hay partidos disponibles" });
    }

    let actualizados = 0;
    let nuevos = 0;
    let sinMatch = 0;

    for (const match of data.matches) {
      // Saltear partidos con equipos no definidos (playoffs pendientes)
      if (!match.team1 || !match.team2) continue;

      // Traducir primero
      const localTraducido = traducir(match.team1);
      const visitanteTraducido = traducir(match.team2);

      // Saltear solo si el equipo tiene "winner" y NO tiene traducción conocida
      if (
        localTraducido === match.team1 &&
        match.team1.toLowerCase().includes("winner")
      )
        continue;
      if (
        visitanteTraducido === match.team2 &&
        match.team2.toLowerCase().includes("winner")
      )
        continue;

      // Solo procesar si tiene score (partido terminado)
      if (!match.score || !match.score.ft) {
        sinMatch++;
        continue;
      }

      const golesLocal = match.score.ft[0];
      const golesVisitante = match.score.ft[1];

      // Construir fecha desde date + time
      let fecha = null;
      try {
        const timeStr = match.time?.split(" ")[0] || "00:00";
        fecha = new Date(`${match.date}T${timeStr}:00`);
      } catch {
        fecha = new Date(match.date);
      }

      // Buscar partido existente por equipos
      const partidoExistente = await db.collection("partidos").findOne({
        local: localTraducido,
        visitante: visitanteTraducido,
        esMundial: true,
      });

      if (partidoExistente) {
        await db.collection("partidos").updateOne(
          { _id: partidoExistente._id },
          {
            $set: {
              estado: "FT",
              golesLocal,
              golesVisitante,
              updatedAt: new Date(),
            },
          },
        );
        actualizados++;
      } else {
        // Partido nuevo (eliminatorias) — insertar
        const grupo = match.group || match.round || "Eliminatorias";
        await db.collection("partidos").updateOne(
          {
            local: localTraducido,
            visitante: visitanteTraducido,
            esMundial: true,
          },
          {
            $set: {
              local: localTraducido,
              visitante: visitanteTraducido,
              fecha,
              estado: "FT",
              golesLocal,
              golesVisitante,
              grupo,
              ronda: grupo,
              esMundial: true,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              banderaLocal: `https://flagcdn.com/w80/un.png`,
              banderaVisitante: `https://flagcdn.com/w80/un.png`,
              createdAt: new Date(),
            },
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
