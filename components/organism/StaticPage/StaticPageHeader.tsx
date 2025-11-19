import { Page } from "@/.velite";
import { H1 } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";

type Props = {
  page: Page;
};

export default async function StaticPageHeader({ page }: Props) {
  return (
    <header className="lg:px-10 md:px-4 px-4 lg:pt-10 py-[25px] w-full max-w-[1472px] mx-auto">
      <div className="flex lg:flex-row flex-col lg:justify-between">
        <div className="w-full flex flex-col">
          <H1>{page.title}</H1>
        </div>
      </div>
      <Separator className="lg:mt-[30px] lg:mb-2.5 mt-2.5 mb-2.5" />
    </header>
  );
}
