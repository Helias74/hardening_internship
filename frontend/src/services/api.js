const BASE_URL = '/api'

export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`)
  const text = await response.text()
  return text
}
