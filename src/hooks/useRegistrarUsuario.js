import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export function useRegistrarUsuario() {
  const { isAuthenticated, user } = useAuth0()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.sub,
        nombre: user.name,
        email: user.email,
        foto: user.picture,
      }),
    }).catch(console.error)
  }, [isAuthenticated, user])
}
