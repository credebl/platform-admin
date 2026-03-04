// src/hooks/useLocaleRouter.ts
'use client'

import { usePathname, useRouter } from 'next/navigation'

export const useLocaleRouter = (): any => {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'

  const push = (path: string): void => {
    if (path.startsWith('/')) {
      router.push(`/${locale}${path}`)
    } else {
      router.push(`/${locale}/${path}`)
    }
  }

  return {
    push,
    locale,
    router,
  }
}
