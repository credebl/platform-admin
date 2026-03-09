import { JwtPayload, jwtDecode } from "jwt-decode";
import axios, { AxiosResponse } from "axios";
import { generateAccessToken, logoutUser } from "@/utils/session";
import { landingPage, signOutApi } from "./constant";

import { signOut } from "next-auth/react";
import { store } from "@/lib/store";

const handleLogout = async (): Promise<void> => {
  try {
    // Note : need to discuss when screen is ideal and token expired itself below API throw 401
    // so because of this session will not deleted from database
    const { session } = store.getState();
    const token = session.token;
    const payload = {
      sessions: [session.sessionId],
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    await axios.post(signOutApi, payload, config);
    const rootKey = "persist:root";

    if (localStorage.getItem(rootKey)) {
      localStorage.removeItem(rootKey);

      const interval = setInterval(async () => {
        if (!localStorage.getItem(rootKey)) {
          clearInterval(interval);
          const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${landingPage}`;
          await signOut({
            callbackUrl: `${
              process.env.NEXT_PUBLIC_CREDEBL_UI_PATH
            }/sign-in?redirectTo=${encodeURIComponent(
              redirectUrl
            )}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
          });
        }
      }, 100);
    }
  } catch (error) {
    console.error("Failed in logged out", error);
    const rootKey = "persist:root";
    if (localStorage.getItem(rootKey)) {
      localStorage.removeItem(rootKey);

      const interval = setInterval(async () => {
        if (!localStorage.getItem(rootKey)) {
          clearInterval(interval);
          const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${landingPage}`;
          await signOut({
            callbackUrl: `${
              process.env.NEXT_PUBLIC_CREDEBL_UI_PATH
            }/sign-in?redirectTo=${encodeURIComponent(
              redirectUrl
            )}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
          });
        }
      }, 100);
    }
  }
};

axios.interceptors.request.use(
  async (config) => {
    const { session } = store.getState()
    if (!session?.token || !session.refreshToken) {
      console.log("session token", session)
      return config
    }
    try {
      const currentTime = Math.floor(Date.now() / 1000)
      const token = session.token
      const { refreshToken } = session
      const refreshTokenExp = jwtDecode<JwtPayload>(refreshToken).exp
      const isRefreshTokenExpired = refreshTokenExp
        ? refreshTokenExp - currentTime < 1
        : true
      const { exp: accessExp } = jwtDecode<JwtPayload>(token)
      const isExpired = accessExp ? accessExp - currentTime < 1 : true
      if (isRefreshTokenExpired){
        console.log("refresh token expire")
        logoutUser()
      }
      if (isExpired && !isRefreshTokenExpired) {
        console.log("gen new token")
        await generateAccessToken()
        const newToken = store.getState().session?.token
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`
        }
      }else {
          return {
            ...config,
            headers: new axios.AxiosHeaders({
              ...config.headers,
              Authorization: `Bearer ${token}`,
            }),
          }
      }
    } catch (error) {
      console.error('Error decoding token:', error)
    }
    return config
  },
  (error) => Promise.reject(error),
)

const handleError = async (error: any): Promise<never> => {
  if (error.response) {
    // Server responded with a status other than 200 range
    if (error.response.status === 403){
         logoutUser()
      }
    if (error.response.status === 401) {
      await generateAccessToken()
    }
    throw error;
  } else if (error.request) {
    // Request was made but no response was received
    throw new Error("No response received from server");
  } else {
    // Something happened in setting up the request
    throw new Error(error.message || "Error in setting up request");
  }
};

const postRequest = async (
  url: string,
  data?: object,
  config?: object
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.post(url, data, config);
    return response;
  } catch (error) {
    return await handleError(error);
  }
};

const getRequest = async (
  url: string,
  params?: object,
  config?: object
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.get(url, { params, headers: config });
    return response;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const putRequest = async (
  url: string,
  data: object,
  config?: object
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.put(url, data, config);
    return response;
  } catch (error) {
    handleError(error);
  }
};

const deleteRequest = async (
  url: string,
  data?: object
): Promise<AxiosResponse<any, any> | undefined> => {
  try {
    const response = await axios.delete(url, { data });
    return response;
  } catch (error) {
    handleError(error);
  }
};

export { postRequest, getRequest, putRequest, deleteRequest };
