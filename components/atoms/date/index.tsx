/* **************************************************
 * Imports
 **************************************************/
import { MonoTextLight } from "@/components/atoms/typography";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
interface FormattedDateProps {
  date: string;
  lang?: "it" | "en";
  className?: string;
}

/* **************************************************
 * FormattedDate Component
 * Renderizza entrambe le versioni (mobile e desktop) e le mostra/nasconde con CSS
 **************************************************/
export default function FormattedDate({ date, lang = "it", className }: FormattedDateProps) {
  const mobileDate = new globalThis.Date(date).toLocaleDateString(
    lang === "it" ? "it-IT" : "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  const desktopDate = new globalThis.Date(date).toLocaleDateString(
    lang === "it" ? "it-IT" : "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <>
      <MonoTextLight className={cn("md:hidden", className)}>
        {mobileDate}
      </MonoTextLight>
      <MonoTextLight className={cn("hidden md:inline", className)}>
        {desktopDate}
      </MonoTextLight>
    </>
  );
}

