import ClientRedirectHandler from "@/components/ClientRedirectHandler";
import { LocaleProps } from "@/config/types";
import React from "react";
// eslint-disable-next-line camelcase
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default function Index({
  params: { locale },
}: LocaleProps): React.JSX.Element {
  setRequestLocale(locale);

  return <ClientRedirectHandler />
  
}
