import { EFFECT_CATEGORIES } from "./mockData";

// ── Risk colors ──
export const riskColor = (risk) => {
  if (risk === "high")   return { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     badge: "bg-red-500" };
  if (risk === "medium") return { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   badge: "bg-amber-500" };
  return                        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", badge: "bg-emerald-500" };
};

export const riskLabel = (risk) => {
  if (risk === "high")   return "Risque élevé";
  if (risk === "medium") return "Risque modéré";
  return "Risque faible";
};

// ── Effect tag colors ──
const EFFECT_COLORS = {
  thyroid:      { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200" },
  estrogenic:   { bg: "bg-pink-100",    text: "text-pink-700",    border: "border-pink-200" },
  androgenic:   { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  reproductive: { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200" },
  cancer:       { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200" },
  neurological: { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
  immune:       { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
};

export const effectColor = (effect) =>
  EFFECT_COLORS[effect] || { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };

export const effectLabel = (effect) =>
  EFFECT_CATEGORIES[effect]?.label || effect;

export const effectEmoji = (effect) =>
  EFFECT_CATEGORIES[effect]?.emoji || "🔬";

// ── Vigilance score (unchanged logic, now multi-effect aware) ──
export const vigilanceScore = (product) => {
  if (!product) return null;
  const high = product.matched.filter(m => m.risk === "high").length;
  const med  = product.matched.filter(m => m.risk === "medium").length;
  if (high > 0) return { level: "high",   label: "Vigilance élevée",  color: "red" };
  if (med > 0)  return { level: "medium", label: "Vigilance modérée", color: "amber" };
  return                { level: "low",    label: "Aucun PE détecté",  color: "emerald" };
};

// ── Collect all unique effects from matched ingredients ──
export const collectEffects = (matched) => {
  const all = matched.flatMap(m => m.effects || []);
  return [...new Set(all)];
};
