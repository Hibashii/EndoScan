export const riskColor = (risk) => {
  if (risk === "high") return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", badge: "bg-red-500" };
  if (risk === "medium") return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", badge: "bg-amber-500" };
  return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", badge: "bg-emerald-500" };
};

export const riskLabel = (risk) => {
  if (risk === "high") return "Risque élevé";
  if (risk === "medium") return "Risque modéré";
  return "Risque faible";
};

export const vigilanceScore = (product) => {
  if (!product) return null;
  const high = product.matched.filter(m => m.risk === "high").length;
  const med = product.matched.filter(m => m.risk === "medium").length;
  if (high > 0) return { level: "high", label: "Vigilance élevée", color: "red" };
  if (med > 0) return { level: "medium", label: "Vigilance modérée", color: "amber" };
  return { level: "low", label: "Aucun PE détecté", color: "emerald" };
};
