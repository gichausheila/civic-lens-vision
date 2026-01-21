// Standardized policy categories for manifesto promises
// These categories are used across the application for consistent classification

export const MANIFESTO_CATEGORIES = [
  { id: "roads_infrastructure", label: "Roads & Infrastructure", icon: "🛣️" },
  { id: "health", label: "Health", icon: "🏥" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "jobs_economy", label: "Jobs & Economy", icon: "💼" },
  { id: "water_sanitation", label: "Water & Sanitation", icon: "💧" },
  { id: "housing", label: "Housing", icon: "🏠" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "youth_women", label: "Youth & Women", icon: "👥" },
  { id: "governance_anticorruption", label: "Governance & Anti-corruption", icon: "⚖️" },
  { id: "environment_climate", label: "Environment & Climate", icon: "🌱" },
  { id: "technology_innovation", label: "Technology / Innovation", icon: "💡" },
] as const;

export type ManifestoCategoryId = typeof MANIFESTO_CATEGORIES[number]["id"];

export const getCategoryById = (id: string) => {
  return MANIFESTO_CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoryLabel = (id: string): string => {
  return getCategoryById(id)?.label || id;
};

export const getCategoryIcon = (id: string): string => {
  return getCategoryById(id)?.icon || "📋";
};
