import { Page } from "@/.velite";
import StaticPageBody from "./StaticPageBody";
import StaticPageFooter from "./StaticPageFooter";
import StaticPageHeader from "./StaticPageHeader";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markdown: any;
  page: Page;
};

export default async function StaticPage({ markdown, page }: Props) {
  return (
    <div>
      <StaticPageHeader page={page} />
      <StaticPageBody markdown={markdown} page={page} />
      <StaticPageFooter />
    </div>
  );
}
