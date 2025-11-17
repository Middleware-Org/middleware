export function cn(...classes: (string | undefined)[]) {
  if (!classes || classes.length === 0) return "";
  return classes.filter(Boolean).join(" ").trim();
}
