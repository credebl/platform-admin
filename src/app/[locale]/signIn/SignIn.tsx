"use client";

import * as Yup from "yup";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import React, { useState } from "react";

import { Alert } from "flowbite-react";
import { Button } from "@/components/ui/button";
import FooterBar from "@/components/FooterBar";
import HeaderBar from "@/components/HeaderBar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { passwordEncryption } from "@/config/common.functions";
import { postRequest } from "@/config/apiCalls";
import { setVerifierToken } from "@/lib/verifierSlice";
import { signInApi } from "@/config/constant";
import { useAppDispatch } from "@/lib/hooks";
import { useFormik } from "formik";
import { useLocaleRouter } from "@/utils/useLocalizedRouter";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const SignIn = (): React.JSX.Element => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const { push } = useLocaleRouter();
  const translate = useTranslations("SignIn");

  const onSignIn = (credentials: { email: string; password: string }) => {
    setLoading(true);
    setErrorMessage("");

    if (credentials.email && credentials.password) {
      const payload = {
        email: credentials.email,
        password: passwordEncryption(credentials.password),
      };

      postRequest(signInApi, payload)
        .then((res) => {
          dispatch(setVerifierToken(res?.data.data.access_token));
          setLoading(false);
          push("/verificationList");
        })
        .catch((error) => {
          setErrorMessage(translate("invalid_credentials"));
          setShowAlert(true);
          setLoading(false);
        });
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(translate("invalid_email"))
        .required(translate("email_req")),
      password: Yup.string()
        .min(8, translate("min_8_char"))
        .required(translate("password_req")),
    }),
    onSubmit: (values: { email: string; password: string }) => {
      onSignIn(values);
    },
  });
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <HeaderBar />
        <div className="flex flex-1 flex-col md:flex-row">
          <div className="hidden md:block md:w-3/5 w-full bg-primary/8 bg-opacity-10 lg:p-4 md:p-4">
            <div className="flex justify-center">
              <img
                className="max-h-100/10rem"
                src="/images/signin.svg"
                alt="img"
              />
            </div>
          </div>
          <div className="md:w-2/5 w-full p-10 flex bg-card">
            <div className="w-full">
              <div className="flex mt-2 xl:mt-8">
                <div className="w-full flex flex-col items-center justify-center ">
                  <h2 className="font-inter text-3xl font-bold leading-10">
                    {translate("login")}
                  </h2>
                  <p className="text-muted-foreground font-inter text-base font-medium leading-5 mt-4">
                    {translate("enter_email")}
                  </p>
                </div>
              </div>

              {showAlert && errorMessage && (
                <Alert
                  color="failure"
                  className="mt-4 p-2"
                  onDismiss={() => setShowAlert(false)}
                >
                  <span>{errorMessage}</span>
                </Alert>
              )}

              <form
                className="mt-8 md:mt-16 space-y-6"
                onSubmit={formik.handleSubmit}
              >
                <input
                  type="hidden"
                  name="_csrf"
                  value={new Date().getTime()}
                />

                <div className="font-inter text-base font-medium leading-5 mb-8">
                  <div className="block mb-2 text-sm font-medium">
                    <Label className="font-semibold" htmlFor="email">{translate("your_email")}</Label>
                    <span className="text-destructive text-xs ml-2">*</span>
                  </div>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      type="email"
                      placeholder="test@example.com"
                      className="pl-10"
                      disabled={loading}
                      id="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email ? (
                    <div className="-mb-2 text-sm text-destructive">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>

                <div className="font-inter text-base font-medium leading-5 mb-8">
                  <div className="block mb-2 text-sm font-medium">
                    <Label htmlFor="password">{translate("your_password")}</Label>
                    <span className="text-destructive text-xs ml-2">*</span>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder={translate("enter_password")}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPasswordVisible((prevVisible) => !prevVisible)
                      }
                      className="text-muted-foreground absolute top-2.5 right-3 focus:outline-none"
                    >
                      {passwordVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {formik.touched.password && formik.errors.password ? (
                    <div className="-mb-2 text-sm text-destructive">
                      {formik.errors.password}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:flex-row justify-between">
                  <div>
                    <a
                      id="navigatetosignup"
                      href="/signUp"
                      className="text-sm hover:underline hover:text-blue-500"
                    >
                      {translate("new_Organization_Register")}
                    </a>
                  </div>
                  <div>
                    <Button
                      type="submit"
                      variant="default"
                      className="h-[45px] px-3 text-center cursor-pointer"
                      disabled={!formik.isValid || loading}
                    >
                      {loading && <Loader />}
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="21"
                      viewBox="0 0 38 37"
                      fill="none"
                      className="mr-2"
                    >
                      <path
                        d="M25.6203 21.2026C25.9292 21.2026 26.2293 21.053 26.389 20.7875C26.6242 20.3982 26.4697 19.9092 26.0451 19.6936C24.8394 19.0839 23.5513 18.6222 22.2245 18.2876C25.6888 16.7062 28.079 13.4342 28.079 9.65217C28.079 4.329 23.3565 0 17.5494 0C11.7423 0 7.01973 4.329 7.01973 9.65217C7.01973 13.4326 9.40823 16.7015 12.8672 18.2844C9.97157 19.0132 7.31283 20.4063 5.13493 22.4027C1.82335 25.4383 0 29.4793 0 33.7826V36.1956C0 36.6396 0.393134 37 0.877497 37C1.36186 37 1.75499 36.6396 1.75499 36.1956V33.7826C1.75499 29.9088 3.39762 26.2732 6.3775 23.5401C9.35739 20.8069 13.3253 19.3043 17.5494 19.3043C20.2257 19.3043 22.8705 19.9269 25.1975 21.1029C25.3308 21.1704 25.4765 21.2026 25.6203 21.2026ZM8.77472 9.65217C8.77472 5.217 12.711 1.60867 17.5494 1.60867C22.3877 1.60867 26.3241 5.217 26.3241 9.65217C26.3241 14.0873 22.3877 17.6957 17.5494 17.6957C12.711 17.6956 8.77472 14.0873 8.77472 9.65217Z"
                        fill="currentColor"
                      />
                      <path
                        d="M21.2585 36.3855C19.9011 25.8284 27.5516 21.0023 36.3948 21.5679"
                        stroke="currentColor"
                        strokeLinecap="round"
                      />
                      <path
                        d="M33.6328 18.5L36.9964 21.5833L33.6328 24.6667"
                        stroke="currentColor"
                        strokeLinecap="round"
                      />
                    </svg>
                      {translate("sign_in")}
                    </Button>
                  </div>
                </div>
                <div className="text-center mt-4">
                  {/* Modal Component */}
                  {showRegisterModal && (
                    <Modal
                      title="Register to start verifying digital credentials"
                      closePopup={() => setShowRegisterModal(false)}
                      className="w-full max-w-3xl bg-white rounded-lg shadow-lg font-semibold"
                    >
                      <div className="p-6">
                        <hr className="border-gray-300 w-full mb-4" />

                        <p className="text-md font-medium text-gray-800 leading-relaxed text-left">
                          {translate("new_Organization_Register_Description1")}{" "}
                          <a
                            href="mailto:info@ayanworks.com"
                            className="text-blue-600 font-semibold underline ml-1"
                          >
                            info@ayanworks.com
                          </a>{" "}
                          {translate("new_Organization_Register_Description2")}
                        </p>

                        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-sm">
                          <ul className="list-none space-y-3 text-gray-800">
                            <li className="flex items-center text-base">
                              <span className="text-blue-500 mr-2">✔</span>
                              <b className="mr-1">
                                {translate("legal_name")}
                              </b>{" "}
                              <span className="font-normal">
                                {translate("of_your")}
                                {translate("organisation")}
                              </span>
                            </li>
                            <li className="flex items-center text-base">
                              <span className="text-blue-500 mr-2">✔</span>
                              <b className="mr-1">
                                {translate("registration_number")}
                              </b>{" "}
                              <span className="font-normal">
                                – {translate("such_as_company_cin_etc")}
                              </span>
                              <span className="text-gray-500 ml-1">
                                {translate("optional")}
                              </span>
                            </li>
                            <li className="flex items-center text-base">
                              <span className="text-blue-500 mr-2">✔</span>
                              <b className="mr-1">
                                {translate("full_name")}
                              </b>{" "}
                              <span className="font-normal">
                                {translate("and")}
                              </span>{" "}
                              <b className="mx-1">{translate("email_id")}</b>{" "}
                              <span className="font-normal">
                                {" "}
                                {translate("administrator_portal")}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </Modal>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <FooterBar />
      </div>
    </>
  );
};
export default SignIn;
