import { Page } from "@/.velite";
import { H2 } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdown: any;
  page: Page;
};

export default async function StaticPageBody({ markdown, page }: Props) {
  return (
    <section className="w-full flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5 pb-10">
      <div className="w-full lg:max-w-[75%] max-w-full">
        <H2 className="mb-[15px]">{page.excerpt}</H2>
      </div>
      <div className="lg:hidden md:flex flex w-full mb-4">
        <Separator />
      </div>
      <div className="flex lg:flex-row md:flex-row flex-col justify-between gap-10">
        <div className="lg:w-1/4 lg:flex hidden">
          <Separator />
        </div>
        <div
          className="prose prose-neutral prose-lg dark:prose-invert lg:w-2/4 md:w-2/3 w-full relative"
          dangerouslySetInnerHTML={{ __html: markdown.value }}
        ></div>
        <div className="lg:w-1/4 md:w-1/3 w-full lg:flex md:flex hidden">
          <Separator />
        </div>
      </div>
    </section>
  );
}
