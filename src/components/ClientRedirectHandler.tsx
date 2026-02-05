'use client'

import { usePathname, useRouter } from 'next/navigation'

import { useAppSelector } from '@/lib/hooks'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const ClientRedirectHandler = (): JSX.Element => {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const accessToken = useAppSelector(
    (state) => state.verifier.verifierToken
  );
  
  const locale = pathname?.split('/')[1] || 'en'
  // useEffect(() => {
  //   if (status === 'loading') {
  //     return
  //   }

  //   if (accessToken) {
  //     router.push(`/${locale}/verificationList`)
  //   } else {
  //     const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${locale}/verificationList`
  //     const authUrl = `${process.env.NEXT_PUBLIC_CREDEBL_UI_PATH}/sign-in?redirectTo=${encodeURIComponent(redirectUrl)}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`
  //     window.location.href = authUrl
  //   }
  // }, [status, router, locale])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* <div>
        {status === 'loading' ? 'Checking session...' : 'Redirecting...'}
      </div> */}
    </div>
  )
}

export default ClientRedirectHandler
