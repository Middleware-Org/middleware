"use client";

import Separator from "@/components/atoms/separetor";
import { H2, MonoTextBold, MonoTextLight } from "@/components/atoms/typography";
import { footerLinks } from "@/lib/data/links";
import { CommonDictionary } from "@/lib/i18n/types";
import { scrollToTop } from "@/lib/utils/window";
import Link from "next/link";

type FooterProps = {
  dict: Pick<CommonDictionary, "footer">;
};

const EMAIL = "info@middleware.blog";

export default function Footer({ dict }: FooterProps) {
  return (
    <footer className="max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5 mt-[25px] mb-[80px]">
      <Separator />
      <div className="flex justify-between items-center">
        <H2 className="text-2xl font-bold pt-[30px]">{dict.footer.contact}</H2>
        <button
          onClick={() => scrollToTop()}
          aria-label={dict.footer.backToTop}
          className="flex flex-col items-end lg:border-none md:border-none border-secondary border-l lg:px-0 px-2.5 hover:opacity-80 transition-opacity"
        >
          <span className="lg:text-sm text-[42px]" aria-hidden="true">
            ↑
          </span>
          <MonoTextLight className="text-sm lg:flex md:flex hidden">
            {dict.footer.backToTop}
          </MonoTextLight>
        </button>
      </div>
      <Separator />
      <div className="mt-8 space-y-6">
        <div className="flex flex-col">
          <MonoTextLight className="text-sm">{dict.footer.email}</MonoTextLight>
          <Link href={`mailto:${EMAIL}`}>
            <MonoTextBold className="text-base font-bold">{EMAIL}</MonoTextBold>
          </Link>
        </div>
        <div>
          <MonoTextLight className="text-sm">{dict.footer.subscribe}</MonoTextLight>
          <div className="flex lg:flex-row md:flex-row flex-col lg:gap-2 md:gap-2 gap-0 flex-wrap">
            {footerLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${dict.footer[link.label as keyof typeof dict.footer]} (si apre in una nuova finestra)`}
                className="flex items-center lg:text-left md:text-center text-center lg:text-[14px] md:text-[12px] text-[12px] lg:gap-2 md:gap-2 gap-0 hover:opacity-80 transition-opacity"
              >
                <MonoTextBold className="text-sm font-bold">
                  {dict.footer[link.label as keyof typeof dict.footer]}
                </MonoTextBold>
                {index < footerLinks.length - 1 && (
                  <span className="text-secondary text-[14px] hidden md:block lg:block" aria-hidden="true">
                    |
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Separator className="mt-8" />
      <div className="flex flex-wrap items-center gap-2 text-sm py-2.5">
        <MonoTextLight className="text-sm">{dict.footer.copyright}</MonoTextLight>
      </div>
      <Separator />
    </footer>
  );
}
