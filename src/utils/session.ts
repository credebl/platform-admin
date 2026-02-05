import { landingPage, refreshTokenUrl } from '@/config/constant'
import { setRefreshToken, setVerifierToken } from '@/lib/verifierSlice'

import { signOut } from 'next-auth/react'
import { store } from '@/lib/store'

let refreshPromise: Promise<void> | null = null

export async function logoutUser(): Promise<void> {
  const rootKey = "persist:root";
  const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/en/${landingPage}`;
  if (localStorage.getItem(rootKey)) {
    localStorage.removeItem(rootKey);
  }
  const interval = setInterval(async () => {
    if (!localStorage.getItem(rootKey)) {
      clearInterval(interval);
      await signOut({
        callbackUrl: `${process.env.NEXT_PUBLIC_CREDEBL_UI_PATH
          }/sign-in?redirectTo=${encodeURIComponent(
            redirectUrl
          )}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
      });
    }
  }, 100);
}

export const generateAccessToken = async (): Promise<void> => {

  const state = store.getState()
  const refreshToken = state?.verifier?.refreshToken
  if (!refreshToken) {
    logoutUser()
  }
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const resp = await fetch(refreshTokenUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }
      )

      const data = await resp.json()
      if (data.message === 'Refresh token has expired' || resp.status === 404) {
        logoutUser()
        return
      }

      if (data?.data?.access_token) {
        store.dispatch(setVerifierToken(data.data.access_token))
      }
      if (data?.data?.refresh_token) {
        store.dispatch(setRefreshToken(data.data.refresh_token))
      }
    } catch (error) {
      console.error('Failed to generate access token:', error)
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}