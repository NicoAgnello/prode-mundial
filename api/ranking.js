import conectarDB from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET")
    return res.status(405).json({ error: "Método no permitido" });

  const userId = req.query.userId ? decodeURIComponent(req.query.userId) : null;
  if (!userId) return res.status(400).json({ error: "userId requerido" });

  try {
    const db = await conectarDB();

    // Obtener el grupo del usuario
    const usuario = await db.collection("usuarios").findOne({ userId });
    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });
    if (!usuario.grupoId) return res.status(200).json([]);

    // Obtener todos los usuarios del mismo grupo
    const usuariosGrupo = await db
      .collection("usuarios")
      .find({ grupoId: usuario.grupoId })
      .toArray();

    const userIdsGrupo = usuariosGrupo.map((u) => u.userId);

    const ranking = await db
      .collection("predicciones")
      .aggregate([
        { $match: { userId: { $in: userIdsGrupo } } },
        {
          $group: {
            _id: "$userId",
            puntos: { $sum: { $ifNull: ["$puntos", 0] } },
            exactos: { $sum: { $cond: [{ $eq: ["$puntos", 3] }, 1, 0] } },
            ganadores: { $sum: { $cond: [{ $eq: ["$puntos", 1] }, 1, 0] } },
            totalProdes: { $sum: 1 },
          },
        },
        // Desempate: 1) puntos, 2) exactos, 3) ganadores
        { $sort: { puntos: -1, exactos: -1, ganadores: -1 } },
        {
          $lookup: {
            from: "usuarios",
            localField: "_id",
            foreignField: "userId",
            as: "usuario",
          },
        },
        { $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            nombre: { $ifNull: ["$usuario.nombre", "Anónimo"] },
            foto: "$usuario.foto",
            puntos: 1,
            exactos: 1,
            ganadores: 1,
            totalProdes: 1,
          },
        },
      ])
      .toArray();

    return res.status(200).json(ranking);
  } catch (error) {
    console.error("Error en ranking:", error);
    return res.status(500).json({ error: "Error interno" });
  }
}
