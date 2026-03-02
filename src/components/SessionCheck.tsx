'use client'

import { fetchSessionDetails, landingPage } from '@/config/constant'
import { setRefreshToken, setSessionId, setSessionToken } from '@/lib/sessionSlice'
import { signOut, useSession } from 'next-auth/react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import Image from 'next/image'
import Loader from '@/components/Loader'
import { passwordEncryption } from '@/config/common.functions'
import { persistor } from '@/lib/store'

const SessionCheck = ({
  children,
}: {
  children: React.ReactNode
}): JSX.Element => {
  const { data: session, status } = useSession()
  const [isChecking, setIsChecking] = useState(true)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const token = useAppSelector((state) => state.session.token);

  const setSessionDetails = (sessionDetails: any): void => {
    if (sessionDetails?.data?.sessionToken) {
      dispatch(setSessionToken(sessionDetails.data.sessionToken))
    }
    if (sessionDetails?.data?.refreshToken) {
      dispatch(setRefreshToken(sessionDetails.data.refreshToken))
    }
  }

  const logout = (): void => {
    localStorage.removeItem('persist:root')
    persistor.flush()
    persistor.purge()
    const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${landingPage}`
    signOut({
      callbackUrl: `${process.env.NEXT_PUBLIC_CREDEBL_UI_PATH}/sign-in?redirectTo=${encodeURIComponent(redirectUrl)}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
    })
    const signInUrl = `${process.env.NEXT_PUBLIC_CREDEBL_UI_PATH}/sign-in?redirectTo=${encodeURIComponent(redirectUrl)}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`
    router.replace(signInUrl)
  }

  const fetchSeesionDetails = async (sessionId: string): Promise<void> => {
    try {
      const encrypted = await passwordEncryption(sessionId)
      const encoded = encodeURIComponent(encrypted)
      const resp = await fetch(
        `${fetchSessionDetails}?sessionId=${encoded}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      const data = await resp.json()
      console.log("sess data",JSON.stringify(data,null,2))
      if (!data?.data){
        logout()
      }
      setSessionDetails(data)
    } catch (error) {
      console.error('error::', error)
    }
  }


  const handleAuthenticated = async () => {
    if (!session?.sessionId){
      return 
    }
    await fetchSeesionDetails(session.sessionId)
    dispatch(setSessionId(session.sessionId))
    const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard`
    router.replace(redirectUrl)
    setIsChecking(false)
  }

  useEffect(() => {
    console.log("fetch session details",session,status)
    if (status === 'loading') {
      return
    }
    if (status === 'authenticated' && session?.sessionId) {
      handleAuthenticated()
    } else if (status === 'unauthenticated' && session === null) {
      logout()
    } else {
      setIsChecking(false)
    }
  }, [status])

  if (status === 'loading' || isChecking || (status === 'authenticated' && !token)) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-white z-[9999] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <Loader size={90}/>
            {/* Logo in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/SOVIO.svg"
                alt="SOVIO Logo"
                width={58}
                height={58}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default SessionCheck
