import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'fr', 'pt'],
  defaultLocale: 'en',
})

export const config = {
  matcher: [
    '/',
    '/(en|fr|pt)/:path*',
    '/((?!api|_next|.*\\..*).*)'
  ],
}


