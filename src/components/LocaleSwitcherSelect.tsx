import React, { ReactNode, useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { ChevronsUpDown } from 'lucide-react';

type LocaleChildProps = {
  value: string;
  children: ReactNode;
  className?: string; 
};

type Props = {
  children: ReactNode;
  defaultValue: string;
  displayValue: string;
};

const LocaleSwitcherSelect = ({
  children,
  defaultValue,
  displayValue,
}: Props): JSX.Element => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onLocaleChange(value: string): void {
    const nextLocale = value;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale },
      );
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between gap-2 focus:ring-ring bg-card hover:bg-card mx-2 my-2 h-9 rounded-xl border px-3 shadow outline-none hover:text-inherit focus:ring-1">
          <span className="truncate max-w-[240px] font-semibold leading-none">
            {displayValue || "Select Language"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[:state(radix-dropdown-menu-trigger-width] min-w-[100px] border">
        {React.Children.map(children, child => {
          if (React.isValidElement<LocaleChildProps>(child)) {
            const localeValue = child.props.value;
            return (
              <DropdownMenuItem
                key={localeValue}
                onSelect={() => onLocaleChange(localeValue)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {child.props.children}
              </DropdownMenuItem>
            );
          }
          return null;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleSwitcherSelect;