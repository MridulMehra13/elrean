import API from "./api";

export const fetchHybridRecommendations = async (userId) => {
  try {
    const res = await API.get(`/recommendation/hybrid/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};
