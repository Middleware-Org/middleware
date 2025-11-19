import { Metadata } from 'next';

import { MonoTextLight } from '@/components/atoms';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import Menu from '@/components/layouts/Menu';
import { config } from '@/data/config';
import { Locale, getDictionary } from '@/lib/dictionaries';

type Props = {
  children: React.ReactNode;
  params: {
    lang: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.meta.config.title} - ${dict.meta.privacy.title}`,
    description: dict.meta.privacy.description,
    themeColor: config.themeColor.light,
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { lang } = params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <Header dict={dict}>
        <MonoTextLight className='!text-xs md:!text-base'>
          {dict.meta.privacy.title}
        </MonoTextLight>
      </Header>
      <Menu dict={dict} />
      <main className='w-full'>{children}</main>
      <Footer dict={dict} />
    </>
  );
}
