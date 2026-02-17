'use client'

import { usePathname, useRouter } from 'next/navigation'

import { useAppSelector } from '@/lib/hooks'
import { useSession } from 'next-auth/react'

const ClientRedirectHandler = (): JSX.Element => {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const accessToken = useAppSelector(
    (state) => state.session.token
  );
  
  const locale = pathname?.split('/')[1] || 'en'
 

  return (
    <div className="flex min-h-screen items-center justify-center">
    </div>
  )
}

export default ClientRedirectHandler
