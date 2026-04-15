import conectarDB from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const adminId = req.headers["x-admin-id"];
  if (adminId !== process.env.ADMIN_USER_ID) {
    return res.status(403).json({ error: "No autorizado" });
  }
  const { action, targetUserId } = req.body;
  if (!action) return res.status(400).json({ error: "action requerida" });

  try {
    const db = await conectarDB();

    // Limpiar partidos
    if (action === "limpiar-partidos") {
      const result = await db.collection("partidos").deleteMany({});
      return res.status(200).json({
        eliminados: result.deletedCount,
        mensaje: `✓ ${result.deletedCount} partidos eliminados`,
      });
    }

    // Limpiar predicciones (de un usuario o todas)
    if (action === "limpiar-predicciones") {
      const filtro = targetUserId ? { userId: targetUserId } : {};
      const result = await db.collection("predicciones").deleteMany(filtro);
      return res.status(200).json({
        eliminadas: result.deletedCount,
        mensaje: targetUserId
          ? `✓ ${result.deletedCount} predicciones eliminadas para el usuario`
          : `✓ ${result.deletedCount} predicciones eliminadas en total`,
      });
    }

    // Resetear puntos
    if (action === "resetear-puntos") {
      const result = await db
        .collection("predicciones")
        .updateMany({}, { $set: { puntos: null, recalculadoAt: null } });
      return res.status(200).json({
        reseteadas: result.modifiedCount,
        mensaje: `✓ ${result.modifiedCount} predicciones reseteadas. Ahora podés recalcular puntos.`,
      });
    }

    // Recalcular puntos
    if (action === "recalcular") {
      const calcularPuntos = (prediccion, partido) => {
        if (partido.estado !== "FT") return null;
        if (partido.golesLocal === null || partido.golesVisitante === null)
          return null;
        const exacto =
          prediccion.golesLocal === partido.golesLocal &&
          prediccion.golesVisitante === partido.golesVisitante;
        if (exacto) return 3;
        const ganadorReal =
          partido.golesLocal > partido.golesVisitante
            ? "local"
            : partido.golesVisitante > partido.golesLocal
              ? "visitante"
              : "empate";
        const ganadorPred =
          prediccion.golesLocal > prediccion.golesVisitante
            ? "local"
            : prediccion.golesVisitante > prediccion.golesLocal
              ? "visitante"
              : "empate";
        return ganadorReal === ganadorPred ? 1 : 0;
      };

      const partidosTerminados = await db
        .collection("partidos")
        .find({ estado: "FT" })
        .toArray();
      if (partidosTerminados.length === 0) {
        return res.status(200).json({
          prediccionesActualizadas: 0,
          mensaje: "No hay partidos terminados",
        });
      }

      const partidosMap = {};
      for (const p of partidosTerminados) partidosMap[p._id.toString()] = p;

      const predicciones = await db
        .collection("predicciones")
        .find({ partidoId: { $in: partidosTerminados.map((p) => p._id) } })
        .toArray();

      let actualizadas = 0;
      for (const pred of predicciones) {
        const partido = partidosMap[pred.partidoId.toString()];
        if (!partido) continue;
        const puntos = calcularPuntos(pred, partido);
        if (puntos === null) continue;
        await db
          .collection("predicciones")
          .updateOne(
            { _id: pred._id },
            { $set: { puntos, recalculadoAt: new Date() } },
          );
        actualizadas++;
      }

      return res.status(200).json({
        prediccionesActualizadas: actualizadas,
        mensaje: `✓ ${actualizadas} predicciones actualizadas`,
      });
    }
    // Crear grupo
    if (action === "crear-grupo") {
      const { nombre, codigo } = req.body;
      if (!nombre || !codigo) {
        return res.status(400).json({ error: "nombre y codigo requeridos" });
      }
      if (codigo.length < 4 || codigo.length > 20) {
        return res
          .status(400)
          .json({ error: "El código debe tener entre 4 y 20 caracteres" });
      }

      const codigoNormalizado = codigo.toUpperCase().trim();

      // Verificar que no exista ese código
      const existente = await db
        .collection("grupos")
        .findOne({ codigo: codigoNormalizado });
      if (existente) {
        return res
          .status(400)
          .json({ error: `El código ${codigoNormalizado} ya existe` });
      }

      const result = await db.collection("grupos").insertOne({
        nombre: nombre.trim(),
        codigo: codigoNormalizado,
        creadoAt: new Date(),
      });

      return res.status(200).json({
        mensaje: `✓ Grupo "${nombre}" creado con código ${codigoNormalizado}`,
        grupoId: result.insertedId,
        codigo: codigoNormalizado,
      });
    }
    // Resetear grupo de un usuario
    if (action === "resetear-grupo") {
      if (!targetUserId) {
        return res.status(400).json({ error: "userId del usuario requerido" });
      }

      const usuario = await db
        .collection("usuarios")
        .findOne({ userId: targetUserId });
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      await db
        .collection("usuarios")
        .updateOne(
          { userId: targetUserId },
          { $unset: { grupoId: "", grupoNombre: "" } },
        );

      return res.status(200).json({
        mensaje: `✓ Grupo reseteado para ${usuario.nombre || usuario.email}. El usuario podrá ingresar un nuevo código.`,
      });
    }
    if (action === "listar-grupos") {
      const grupos = await db.collection("grupos").find({}).toArray();

      // Para cada grupo contar cuántos usuarios tiene
      const gruposConStats = await Promise.all(
        grupos.map(async (g) => {
          const miembros = await db
            .collection("usuarios")
            .countDocuments({ grupoId: g._id });
          return {
            _id: g._id,
            nombre: g.nombre,
            codigo: g.codigo,
            creadoAt: g.creadoAt,
            miembros,
          };
        }),
      );

      return res.status(200).json({ grupos: gruposConStats });
    }
    return res.status(400).json({ error: `Acción desconocida: ${action}` });
  } catch (error) {
    console.error("Error en acciones admin:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
