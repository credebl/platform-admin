import { useLocale, useTranslations } from "next-intl";

import LocaleSwitcherSelect from "./LocaleSwitcherSelect";

import { locales } from "@/config";

export default function LocaleSwitcher(): JSX.Element {
  const translate = useTranslations("LocaleSwitcher");
  const locale = useLocale();

  const currentLocaleDisplayName = translate("locale", { locale: locale });

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      displayValue={currentLocaleDisplayName}
    >
      {locales.map((cur) => (
        <option key={cur} value={cur} className="text-base">
          {translate("locale", { locale: cur })}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}