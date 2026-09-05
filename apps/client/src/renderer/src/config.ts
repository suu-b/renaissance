const getRenaissanceURL = import.meta.env.VITE_GET_RENAISSANCE_URL;

export const config = {
  getRenaissanceURL,
  getRenaissanceJoinURL: `${getRenaissanceURL}/join`,
  getRenaissanceFeedbackURL: `${getRenaissanceURL}/feedback`,
};