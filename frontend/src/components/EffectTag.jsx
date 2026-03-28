import { effectColor, effectLabel, effectEmoji } from "../data/utils";

export default function EffectTag({ effect, size = "sm" }) {
  const c = effectColor(effect);
  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5 gap-1"
    : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <span>{effectEmoji(effect)}</span>
      {effectLabel(effect)}
    </span>
  );
}
