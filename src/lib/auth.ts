import { NextAuthOptions, Session } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'

interface MyToken extends JWT {
  user?: {
    id: string
    email: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize() {
        return null
      },
    }),
  ],

  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
       
        token.sessionId = user.sessionId
      }
      return token
    },
    async session({ session, token }: { session: Session; token: MyToken }) {

      if (token?.sessionId) {
        session.sessionId = token.sessionId
      }

      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
      process.env.NEXTAUTH_PROTOCOL === 'http'
        ? 'next-auth.session-token'
        : '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_PROTOCOL !== 'http',
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN,
      },
    },
  },
}