// Este endpoint ya no se usa activamente porque openfootball
// no provee estados en tiempo real. Los estados se actualizan
// al sincronizar resultados desde el admin.
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });
  return res.status(200).json({ actualizados: 0, mensaje: "Sin cambios" });
}
