import { Page } from "@/.velite";
import StaticPageBody from "./StaticPageBody";
import StaticPageFooter from "./StaticPageFooter";
import StaticPageHeader from "./StaticPageHeader";

type Props = {
  page: Page;
};

export default function StaticPage({ page }: Props) {
  return (
    <div>
      <StaticPageHeader page={page} />
      <StaticPageBody page={page} />
      <StaticPageFooter />
    </div>
  );
}
