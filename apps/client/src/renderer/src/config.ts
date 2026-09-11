const rawRenaissanceURL = import.meta.env.VITE_GET_RENAISSANCE_URL || 'http://localhost:3000'

if (!import.meta.env.VITE_GET_RENAISSANCE_URL) {
  console.warn("Required environment variable VITE_GET_RENAISSANCE_URL is not set")
}

const getRenaissanceURL = rawRenaissanceURL.replace(/\/+$/, '')

export const config = {
  getRenaissanceURL,
  getRenaissanceJoinURL: `${getRenaissanceURL}/join`,
  getRenaissanceFeedbackURL: `${getRenaissanceURL}/feedback`,
};