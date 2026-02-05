import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { IPhoneNo } from "@/utils/common.interfaces";
import { phoneCodes } from "@/config/constant";
import { useTranslations } from "next-intl";

export default function PhoneNo({ handleChangeInput, activeCodeValue, setActiveCodeValue }: IPhoneNo) {
  const [activeCode, setActiveCode] = useState('IN +91');

  const translate = useTranslations("PaymentGateway");
  const handleSelect = (val: string) => {
    const [_, code] = val.split(" ")
    setActiveCodeValue(code)
    setActiveCode(val);
  };

  return (
    <div className="grid gap-2">
      <label htmlFor="contactNo" className="  text-base font-semibold">
        {translate('holderContactNo')} <span className='text-md text-muted-foreground'>{translate('optional')}</span>
      </label>
      <div className="grid grid-cols-[5rem_auto] items-center border rounded-md group focus-within:ring-1 focus-within:ring-ring focus-within:border-ring h-12">
        <Select value={activeCode} onValueChange={handleSelect}>
          <SelectTrigger className="bg-transparent text-base border-none rounded-tr-[0] rounded-br-[0] outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 shadow-none">

            <SelectValue aria-label={activeCode} className="">{activeCodeValue}</SelectValue>
          </SelectTrigger>
          <SelectContent className="">
            {phoneCodes.map((data) => (
              <SelectItem key={`${data.name}-${data.dialCode}`} value={`${data.code} ${data.dialCode}`}>
                {data.name} ({data.dialCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex">
          <div className="border-[1px] my-2"></div>
          <input
            type="text"
            id="contactNo"
            className='w-full text-base border-none rounded-lg p-2 pl-4 focus:outline-none  rounded-tl-[0] rounded-bl-[0]'
            placeholder={translate('enterContactNo')}
            onChange={handleChangeInput}
          />
        </div>
      </div>
    </div>
  );
}
