const rawRenaissanceURL = import.meta.env.VITE_GET_RENAISSANCE_URL || 'http://localhost:3000'

if (!import.meta.env.VITE_GET_RENAISSANCE_URL) {
  console.warn("Required environment variable VITE_GET_RENAISSANCE_URL is not set")
}

const getRenaissanceURL = rawRenaissanceURL.replace(/\/+$/, '')

let serverUrl: string | null = null

async function initializeServerUrl() {
  const port: number | null = await window.api.getServerPort()
  serverUrl = port ? `http://127.0.0.1:${port}` : null
}

// Initialize the server URL
initializeServerUrl()

export const config = {
  getRenaissanceURL,
  getRenaissanceJoinURL: `${getRenaissanceURL}/join`,
  getRenaissanceFeedbackURL: `${getRenaissanceURL}/feedback`,
  get serverUrl() {
    return serverUrl
  },


  // we have to look into this
  workspacePath: "home/suub/renaissance/workspace",
  indexFilePath: "home/suub/renaissance/workspace/index.csv"
};