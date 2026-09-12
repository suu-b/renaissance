const rawRenaissanceURL = import.meta.env.VITE_GET_RENAISSANCE_URL || 'http://localhost:3000'
const port: number | null = window.api.getServerPort()
const serverUrl = port ? `http://127.0.0.1:${port}`: null

if (!import.meta.env.VITE_GET_RENAISSANCE_URL) {
  console.warn("Required environment variable VITE_GET_RENAISSANCE_URL is not set")
}

const getRenaissanceURL = rawRenaissanceURL.replace(/\/+$/, '')

export const config = {
  getRenaissanceURL,
  getRenaissanceJoinURL: `${getRenaissanceURL}/join`,
  getRenaissanceFeedbackURL: `${getRenaissanceURL}/feedback`,
  serverUrl,
};