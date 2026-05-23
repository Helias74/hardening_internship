const BASE_URL = '/api'

export async function login(username, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // envoie et reçoit les cookies
        body: JSON.stringify({ username, password })
    })

    if (!response.ok) throw new Error('Credentials invalides')
    return response.json()
}

export async function verify() {
    const response = await fetch(`${BASE_URL}/auth/verify`, {
        credentials: 'include'    // envoie le cookie automatiquement
    })

    if (!response.ok) throw new Error('Non authentifié')
    return response.json()
}

// Déconnexion
export async function logout() {
    await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
}