import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronsUpDown } from 'lucide-react';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avtar';

interface OrgSwitcherSelectProps {
  selectedOrg: { id: string; name: string; logoUrl: string } | null;
  organizations: { id: string; name: string; logoUrl: string }[];
  onSelectChange: (orgId: string) => void;
}

const OrgSwitcherSelect: React.FC<OrgSwitcherSelectProps> = ({
  selectedOrg,
  organizations,
  onSelectChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus:ring-ring bg-card hover:bg-card mx-2 my-2 h-9 rounded-xl border p-2 shadow outline-none hover:text-inherit focus:ring-1!"
        asChild
      >
        <button
          className="flex items-center gap-2 w-full max-w-[220px] overflow-hidden text-left"
          aria-label={selectedOrg?.name || 'Select an Organization'}
        >
          {selectedOrg ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={selectedOrg.logoUrl || undefined}
                  alt={selectedOrg.name}
                  className="object-contain"
                />
                <AvatarFallback className="text-xs font-bold">
                  {selectedOrg.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                className="truncate text-sm font-bold max-w-[140px]"
                title={selectedOrg.name}
              >
                {selectedOrg.name}
              </span>
              <ChevronsUpDown className="ml-auto shrink-0 h-4 w-4" />
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Select an Organization</span>
              <ChevronsUpDown className="ml-auto shrink-0 h-4 w-4" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[:state(radix-dropdown-menu-trigger-width] min-w-[250px] border"
        align="start"
      >
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onSelect={() => onSelectChange(org.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar className="shrink rounded-md">
                <AvatarImage
                  src={org.logoUrl || undefined}
                  alt={org.name}
                  className="object-contain"
                />
                <AvatarFallback className='text-md font-bold'>
                  {org.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[190px]" title={org.name}>
                {org.name}
              </span>
              {org.id === selectedOrg?.id && (
                <Check className="ml-auto shrink-0 h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <div className="text-center text-muted-foreground w-full">
              No organizations available
            </div>
          </DropdownMenuItem>
        )}
        {organizations.length > 0 && <DropdownMenuSeparator />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrgSwitcherSelect;
