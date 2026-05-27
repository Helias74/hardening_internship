const BASE_URL = '/api'

export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`)
  const text = await response.text()
  return text
}

// Sessions
export async function getSessions() {
  const response = await fetch(`${BASE_URL}/sessions`)
  return response.json()
}

export async function createSession(name) {
  const response = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  return response.json()
}

export async function startSession(id) {
  await fetch(`${BASE_URL}/sessions/${id}/start`, { method: 'PATCH' })
}

export async function stopSession(id) {
  await fetch(`${BASE_URL}/sessions/${id}/stop`, { method: 'PATCH' })
}

export async function deleteSession(id) {
  await fetch(`${BASE_URL}/sessions/${id}`, { method: 'DELETE' })
}

export async function importStudents(id, csv) {
  const response = await fetch(`${BASE_URL}/sessions/${id}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv }),
  })
  return response.json()
}