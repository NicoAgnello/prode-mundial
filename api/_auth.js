export async function verificarToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return null
    const info = await res.json()
    return info.sub || null
  } catch {
    return null
  }
}
