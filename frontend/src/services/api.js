const BASE_URL = 'http://localhost:3000'

export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`)
  const text = await response.text()
  return text
}
