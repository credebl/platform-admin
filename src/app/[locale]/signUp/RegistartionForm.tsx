"use client";

import * as Yup from "yup";

import { Alert } from "flowbite-react";
import { ErrorResponse, UserRegistartion } from "@/utils/common.interfaces";
import { Field, Form, Formik } from "formik";
import { PassInvisible, PassVisible } from "@/config/SVG";
import { passwordRegex, signUpApi } from "@/config/constant";

import { AxiosError } from "axios";
import Image from "next/image";
import { passwordEncryption } from "@/config/common.functions";
import { postRequest } from "@/config/apiCalls";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

const RegistartionForm = (): React.JSX.Element => {
  const router = useRouter();
  const translate = useTranslations("SignUp");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const userRegistartionDetails = useAppSelector(
    (state) => state.userRegistartion.userRegistartionDetails
  );
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const onSignUp = async (userDetails: UserRegistartion) => {
    try {
      setLoading(true);
      const payload = {
        email: userRegistartionDetails.userEmail,
        password: passwordEncryption(userDetails.password),
        isPasskey: false,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
      };
      const signUpUserResponse = await postRequest(signUpApi, payload, config);
      if (signUpUserResponse?.data.statusCode === 201) {
        setShowAlert(true);
        setSuccessMessage(translate("signUpSuccess"));
        setTimeout(() => {
          setShowAlert(false);
          setSuccessMessage("");
          setLoading(false);
          router.push("/signIn");
        }, 3000);
      }
    } catch (error) {
      console.error("Error in sign-up");
      const errorResponse = (error as AxiosError)?.response
        ?.data as ErrorResponse;
      setLoading(false);
      if (errorResponse.statusCode === 409) {
        setShowAlert(true);
        setErrorMessage(translate("user_signup_conflict"));
      } else {
        setErrorMessage(translate("error_in_user_signup"));
        setShowAlert(true);
      }
    }
  };

  return (
    <div className="md:w-2/5 w-full p-10 flex bg-card">
      <button className="flex mt-2" onClick={() => router.push("/signIn")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          width="26"
          height="24"
          viewBox="0 0 37 20"
          className="text-custom-900 dark:text-custom-100"
        >
          <path d="M0.201172 9.23695C0.00108337 9.60157 -0.0512199 10.0028 0.050869 10.3898C0.152962 10.7769 0.404865 11.1324 0.774712 11.4114L11.3468 19.391C11.5906 19.5815 11.8823 19.7335 12.2047 19.838C12.5272 19.9426 12.874 19.9976 13.2249 19.9999C13.5759 20.0022 13.9239 19.9518 14.2487 19.8514C14.5735 19.7511 14.8686 19.603 15.1168 19.4157C15.365 19.2284 15.5612 19.0057 15.6941 18.7605C15.827 18.5153 15.8939 18.2526 15.8908 17.9878C15.8878 17.7229 15.8149 17.4611 15.6763 17.2177C15.5378 16.9743 15.3365 16.7542 15.084 16.5702L9.02094 11.9939L34.357 11.9939C35.0579 11.9939 35.7302 11.7837 36.2259 11.4096C36.7215 11.0355 37 10.5281 37 9.999C37 9.46992 36.7215 8.96251 36.2259 8.5884C35.7302 8.21428 35.0579 8.00411 34.357 8.00411L9.02094 8.00411L15.0814 3.4298C15.3338 3.24578 15.5352 3.02565 15.6737 2.78227C15.8122 2.53888 15.8851 2.27711 15.8882 2.01223C15.8912 1.74735 15.8244 1.48466 15.6915 1.2395C15.5586 0.994335 15.3623 0.771599 15.1142 0.584293C14.866 0.396986 14.5709 0.248857 14.2461 0.148552C13.9213 0.0482464 13.5732 -0.00222778 13.2223 7.43866e-05C12.8714 0.00237656 12.5245 0.0574093 12.2021 0.161961C11.8796 0.26651 11.588 0.418484 11.3442 0.609016L0.772064 8.58861C0.527206 8.77433 0.333214 8.99464 0.201172 9.23695Z" />
        </svg>
      </button>
      <div className="w-full">
        <div className="flex mt-2 xl:mt-8">
          <div className="w-full flex flex-col items-center justify-center ">
            <h2 className="font-inter text-3xl font-bold leading-10">
              {translate("signUp")}
            </h2>
            <p className="text-muted-foreground font-inter text-base font-medium leading-5 mt-4">
              {translate("user_details_text")}
            </p>
          </div>
        </div>
        <div className="block md:hidden bg-blue-500 bg-opacity-10 justify-center">
          <Image src="/images/signin.svg" alt="img" width={20} height={20} />
        </div>

        {showAlert && (errorMessage || successMessage) && (
          <Alert
            color={successMessage ? "success" : "failure"}
            className="mt-4 p-2"
            onDismiss={() => setShowAlert(false)}
          >
            <span>{successMessage || errorMessage}</span>
          </Alert>
        )}
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={Yup.object().shape({
            firstName: Yup.string()
              .required(translate("first_name_required"))
              .min(2, translate("first_name_min_length"))
              .max(50, translate("first_name_max_length"))
              .trim(),
            lastName: Yup.string()
              .required(translate("last_name_required"))
              .min(2, translate("last_name_min_length"))
              .max(50, translate("last_name_max_length"))
              .trim(),
            password: Yup.string()
              .required(translate("password_reqired"))
              .matches(passwordRegex, translate("password_format"))
              .trim(),
            confirmPassword: Yup.string()
              .required(translate("confirm_password_required"))
              .oneOf([Yup.ref("password")], translate("password_match"))
              .trim(),
          })}
          validateOnBlur
          validateOnChange
          enableReinitialize
          onSubmit={(values: UserRegistartion) => {
            onSignUp(values);
          }}
        >
          {(formikHandlers): JSX.Element => (
            <Form
              className="mt-8 md:mt-16 space-y-6"
              onSubmit={formikHandlers.handleSubmit}
            >
              <input type="hidden" name="_csrf" value={new Date().getTime()} />

              <div className="text-primary-700 font-inter text-base font-medium leading-5 mb-8">
                <div className="block mb-2 text-sm font-medium dark:text-white">
                  <Label className="font-semibold" htmlFor="firstName">
                    {translate("first_name")}
                  </Label>
                  <span className="text-destructive text-xs ml-2">*</span>
                </div>
                <div className="relative">
                  <Field
                    id="firstName"
                    name="firstName"
                    className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                    placeholder={translate("first_name_placeholder")}
                  />
                </div>

                {formikHandlers.touched.firstName && (
                  <span className="text-destructive text-xs absolute mt-1">
                    {formikHandlers.errors.firstName}
                  </span>
                )}
              </div>
              <div className="text-primary-700 font-inter text-base font-medium leading-5 mb-8">
                <div className="block mb-2 text-sm font-medium dark:text-white">
                  <Label className="font-semibold" htmlFor="lastName">
                    {translate("last_name")}
                  </Label>
                  <span className="text-destructive text-xs ml-2">*</span>
                </div>
                <div className="relative">
                  <Field
                    id="lastName"
                    name="lastName"
                    className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                    placeholder={translate("last_name_placeholder")}
                  />
                </div>

                {formikHandlers.touched.lastName && (
                  <span className="text-destructive text-xs absolute mt-1">
                    {formikHandlers.errors.lastName}
                  </span>
                )}
              </div>
              <div className="text-primary-700 font-inter text-base font-medium leading-5 mb-8">
                <div className="block mb-2 text-sm font-medium dark:text-white">
                  <Label className="font-semibold" htmlFor="password">
                    {translate("password")}
                  </Label>
                  <span className="text-destructive text-xs ml-2">*</span>
                </div>

                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    placeholder={translate("password_placeholder")}
                    className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                    type={passwordVisible ? "text" : "password"}
                  />
                  
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordVisible((prevVisible) => !prevVisible)
                    }
                    className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 dark:text-white hover:text-gray-800 dark:hover:text-white"
                  >
                    {passwordVisible ? <PassInvisible /> : <PassVisible />}
                  </button>
                </div>

                {formikHandlers.touched.password && (
                  <span className="text-destructive text-xs absolute mt-1">
                    {formikHandlers.errors.password}
                  </span>
                )}
              </div>
              <div className="text-primary-700 font-inter text-base font-medium leading-5 mb-8">
                <div className="block mb-2 text-sm font-medium dark:text-white">
                  <Label className="font-semibold" htmlFor="confirmPassword">
                    {translate("confirm_password")}
                  </Label>
                  <span className="text-destructive text-xs ml-2">*</span>
                </div>
                <div className="relative">
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder={translate("confirm_password_placeholder")}
                    className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                    type={confirmPasswordVisible ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible((prevVisible) => !prevVisible)
                    }
                    className="bg-transparent absolute right-2 top-1/2 transform -translate-y-1/2 dark:text-white hover:text-gray-800 dark:hover:text-white"
                  >
                    {confirmPasswordVisible ? (
                      <PassInvisible />
                    ) : (
                      <PassVisible />
                    )}
                  </button>
                </div>

                {formikHandlers.touched.confirmPassword && (
                  <span className="text-destructive text-xs absolute mt-1">
                    {formikHandlers.errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:flex-row justify-between">
                <div>
                  <a
                    id="navigatetosignup"
                    href="/signIn"
                    className="text-sm text-primary-foreground dark:text-gray-200 hover:underline hover:text-blue-500"
                  >
                    {translate("sign_in")}
                  </a>
                </div>
                <div>
                  <Button
                    id="signUpButton"
                    type="submit"
                    className="h-[45px] px-3 text-center cursor-pointer"
                    disabled={!formikHandlers.isValid || loading}
                  >
                    {loading && (
                      <div className="flex items-center">
                        <Loader />
                      </div>
                    )}

                    <div className="flex items-center gap-2 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 20" fill="currentColor">
                              <path d="M29.8369 10.763C29.9991 10.3984 30.0415 9.99721 29.9588 9.61015C29.876 9.22309 29.6717 8.86759 29.3719 8.58861L20.7999 0.609018C20.6022 0.418485 20.3657 0.26651 20.1043 0.161959C19.8428 0.0574089 19.5616 0.00237707 19.2771 7.53215e-05C18.9925 -0.00222642 18.7103 0.0482475 18.447 0.148553C18.1836 0.248858 17.9443 0.396985 17.7431 0.584292C17.5419 0.771598 17.3828 0.994332 17.275 1.2395C17.1673 1.48466 17.1131 1.74735 17.1155 2.01223C17.118 2.27711 17.1771 2.53888 17.2894 2.78227C17.4018 3.02566 17.565 3.24578 17.7697 3.4298L22.6857 8.0061H2.14299C1.57464 8.0061 1.02956 8.21628 0.627668 8.59039C0.225779 8.96451 0 9.47192 0 10.001C0 10.5301 0.225779 11.0375 0.627668 11.4116C1.02956 11.7857 1.57464 11.9959 2.14299 11.9959H22.6857L17.7718 16.5702C17.5672 16.7542 17.4039 16.9743 17.2916 17.2177C17.1793 17.4611 17.1202 17.7229 17.1177 17.9878C17.1152 18.2526 17.1694 18.5153 17.2772 18.7605C17.3849 19.0057 17.5441 19.2284 17.7453 19.4157C17.9465 19.603 18.1858 19.7511 18.4491 19.8514C18.7125 19.9518 18.9947 20.0022 19.2792 19.9999C19.5638 19.9976 19.845 19.9426 20.1064 19.838C20.3679 19.7335 20.6043 19.5815 20.802 19.391L29.374 11.4114C29.5725 11.2257 29.7298 11.0054 29.8369 10.763Z" />
                            </svg>
                      <span className="whitespace-nowrap">
                        {translate("sign_up_button")}
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
export default RegistartionForm;
