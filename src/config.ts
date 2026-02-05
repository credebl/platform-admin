import { Pathnames } from 'next-intl/routing'

export const port = process.env.PORT || 3000
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`

export const defaultLocale = 'en' as const
export const locales = ['en', 'fr', 'pt'] as const

export const pathnames = {
  '/': '/',
  '/dashboard': {
    en: '/dashboard',
    fr: '/dashboard',
    pt: '/dashboard',
  },
  '/templates': {
    en: '/templates',
    fr: '/templates',
    pt: '/templates',
  },
  '/issuance': {
    en: '/issuance',
    fr: '/issuance',
    pt: '/issuance',
  },
} satisfies Pathnames<typeof locales>

// Use the default: `always`
export const localePrefix = undefined

export type AppPathnames = keyof typeof pathnames
