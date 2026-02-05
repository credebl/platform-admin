'use client'

import { usePathname, useRouter } from 'next/navigation'

import VerificationList from '@/app/[locale]/ecosystems/VerificationList'
import { landingPage } from '@/config/constant'
import { useAppSelector } from '@/lib/hooks'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

const SigninPage = (): JSX.Element => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAppSelector(
    (state) => state.verifier.verifierToken
  );
  const locale = pathname?.split('/')[1] || 'en'

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (!accessToken) {
      const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${locale}/${landingPage}`
      const authUrl = `${process.env.NEXT_PUBLIC_CREDEBL_UI_PATH}/sign-in?redirectTo=${encodeURIComponent(redirectUrl)}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`
      window.location.href = authUrl
    } else {
      router.push(`/${locale}/verificationList`)
    }
  }, [session, status, router, locale])

  if (status === 'loading') {
    return <div>Loading...</div>
  }
  if (!session) {
    return <div>Redirecting to login...</div>
  }

  return <VerificationList />
}

export default SigninPage