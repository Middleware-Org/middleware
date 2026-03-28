import { MonoTextLight } from "@/components/atoms/typography";
import SeparatorWithLogo from "@/components/molecules/SeparatorWithLogo";

export default async function StaticPageFooter() {
  return (
    <footer className="flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5">
      <div className="flex lg:flex-row md:flex-row flex-col justify-between gap-10">
        <div className="lg:w-1/4 lg:flex hidden"></div>
        <div className="lg:w-2/4 md:w-full w-full">
          <SeparatorWithLogo />
          <div className="py-[25px] text-center">
            <MonoTextLight>Middleware — Laboratorio di contro-formazione</MonoTextLight>
          </div>
        </div>
        <div className="lg:w-1/4 lg:flex hidden"></div>
      </div>
    </footer>
  );
}
