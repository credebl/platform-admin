'use client'

import { ReactNode } from 'react'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

interface SessionProviderWrapperProps {
  children: ReactNode
  session?: Session | null
}

export default function SessionProviderWrapper({
  children,
  session,
}: SessionProviderWrapperProps): JSX.Element {
  return <SessionProvider session={session} key={session?.user.id}>{children}</SessionProvider>
}
