'use client'

import { usePathname, useRouter } from 'next/navigation'

import { useAppSelector } from '@/lib/hooks'
import { useSession } from 'next-auth/react'

const ClientRedirectHandler = (): JSX.Element => {


  return (
    <div className="flex min-h-screen items-center justify-center">
    </div>
  )
}

export default ClientRedirectHandler
