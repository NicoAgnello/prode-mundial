import conectarDB from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db = await conectarDB();

    // GET /api/grupos?userId=xxx — obtener info del grupo del usuario
    if (req.method === "GET") {
      const userId = req.query.userId
        ? decodeURIComponent(req.query.userId)
        : null;
      if (!userId) return res.status(400).json({ error: "userId requerido" });

      const usuario = await db.collection("usuarios").findOne({ userId });
      if (!usuario)
        return res.status(404).json({ error: "Usuario no encontrado" });
      if (!usuario.grupoId) return res.status(200).json({ grupo: null });

      const grupo = await db
        .collection("grupos")
        .findOne({ _id: usuario.grupoId });
      return res.status(200).json({ grupo });
    }

    // POST /api/grupos — unirse a un grupo con código
    if (req.method === "POST") {
      const { userId, codigo } = req.body;

      if (!userId || !codigo) {
        return res.status(400).json({ error: "userId y codigo requeridos" });
      }
      if (userId.length > 100) {
        return res.status(400).json({ error: "userId inválido" });
      }
      if (codigo.length > 50) {
        return res.status(400).json({ error: "Código inválido" });
      }

      // Verificar que el usuario existe
      const usuario = await db.collection("usuarios").findOne({ userId });
      if (!usuario)
        return res.status(404).json({ error: "Usuario no encontrado" });

      // Si solo quiere verificar el código sin unirse
      if (req.body.soloVerificar) {
        const grupo = await db.collection("grupos").findOne({
          codigo: codigo.toUpperCase().trim(),
        });
        if (!grupo) {
          return res.status(404).json({
            error: "Código inválido — verificá que esté bien escrito",
          });
        }
        return res.status(200).json({ grupo });
      }
      // Verificar que no tiene grupo ya asignado
      if (usuario.grupoId) {
        const grupoActual = await db
          .collection("grupos")
          .findOne({ _id: usuario.grupoId });
        return res.status(400).json({
          error: "Ya pertenecés a un grupo",
          grupo: grupoActual,
        });
      }

      // Buscar el grupo por código (case insensitive)
      const grupo = await db.collection("grupos").findOne({
        codigo: codigo.toUpperCase().trim(),
      });
      if (!grupo) {
        return res
          .status(404)
          .json({ error: "Código inválido — verificá que esté bien escrito" });
      }

      // Asignar grupo al usuario
      await db
        .collection("usuarios")
        .updateOne(
          { userId },
          { $set: { grupoId: grupo._id, grupoNombre: grupo.nombre } },
        );

      return res.status(200).json({
        mensaje: `✓ Te uniste a ${grupo.nombre}`,
        grupo,
      });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (error) {
    console.error("Error en grupos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
