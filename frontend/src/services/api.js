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

// Scoring
export async function getStudentScore(token) {
  const response = await fetch(`${BASE_URL}/scoring/student/me?token=${token}`)
  return response.json()
}

export async function getStudentsList() {
  const response = await fetch(`${BASE_URL}/scoring/admin/students`, {
    credentials: 'include'
  })
  return response.json()
}

export async function getStudentDetail(enrollmentId) {
  const response = await fetch(`${BASE_URL}/scoring/admin/students/${enrollmentId}`, {
    credentials: 'include'
  })
  return response.json()
}