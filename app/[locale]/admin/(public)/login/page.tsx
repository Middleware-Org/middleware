/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import Pictogram from "@/components/organism/pictogram";
import { MonoTextBold } from "@/components/atoms/typography";
import type { CommonDictionary } from "@/lib/i18n/types";
import { withLocale } from "@/lib/i18n/path";
import LoginForm from "./LoginForm";
import styles from "./styles";

/* **************************************************
 * Types
 ************************************************** */
type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Logo Component
 ************************************************** */
function Logo({ dict, locale }: { dict: Pick<CommonDictionary, "title">; locale: string }) {
  return (
    <div className={styles.logoContainer}>
      <Pictogram size={48} />
      <Link href={withLocale("/", locale)}>
        <MonoTextBold className={styles.logoText}>{dict.title}</MonoTextBold>
      </Link>
    </div>
  );
}

/* **************************************************
 * Login Page
 ************************************************** */
export default async function AdminLoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Logo dict={dict} locale={locale} />
          </div>
          <h1 className={styles.title}>Area admin</h1>
          <p className={styles.description}>Accedi con email e password</p>
        </div>
        <LoginForm locale={locale} />
      </div>
    </main>
  );
}
