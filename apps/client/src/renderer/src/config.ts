const getRenaissanceURL = import.meta.env.VITE_GET_RENAISSANCE_URL

if (!getRenaissanceURL) {
  console.warn("Required environment variable VITE_GET_RENAISSANCE_URL is not set")
}

export const config = {
  getRenaissanceURL,
  getRenaissanceJoinURL: `${getRenaissanceURL}/join`,
  getRenaissanceFeedbackURL: `${getRenaissanceURL}/feedback`,
};