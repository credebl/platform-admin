import { getMessages, setRequestLocale } from "next-intl/server";

import { NextIntlClientProvider } from "next-intl";
import PageLayout from "@/components/PageLayout";
import SessionCheck from "@/components/SessionCheck";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import StoreProvider from "../StoreProvider";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}): Promise<React.JSX.Element> {
  const messages = await getMessages();
  setRequestLocale(locale);

  return (
        <StoreProvider>
          <SessionProviderWrapper>
            <NextIntlClientProvider messages={messages}>
              <SessionCheck>
                <PageLayout>{children}</PageLayout>
              </SessionCheck>
            </NextIntlClientProvider>
          </SessionProviderWrapper>
        </StoreProvider>
    
  );
}

const locales = ["en", "fr", "pt"];

export function generateStaticParams(): { locale: string }[] {
  return locales.map((locale) => ({ locale }));
}
