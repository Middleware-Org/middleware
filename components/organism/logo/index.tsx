/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import Pictogram from "@/components/organism/pictogram";
import { MonoTextBold } from "@/components/atoms/typography";

/* **************************************************
 * Types
 **************************************************/
interface LogoProps {
  dict: { title: string };
}

/* **************************************************
 * Logo
 **************************************************/
export default function Logo({ dict }: LogoProps) {
  return (
    <div className="flex items-center gap-4">
      <Pictogram />
      <Link href="/">
        <MonoTextBold className="lg:text-5xl md:text-4xl text-3xl">{dict.title}</MonoTextBold>
      </Link>
    </div>
  );
}
