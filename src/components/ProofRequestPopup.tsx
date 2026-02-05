"use client";

import { CheckCircle, XCircle } from "lucide-react";
import {
  generateQRCodeStringColor,
  serializationCondition,
  stampImage,
  verifiedImage,
  verifyProofRequest,
} from "@/config/constant";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";
import CryptoJS from "crypto-js";
import { IProofRequestDetails } from "@/utils/common.interfaces";
import Image from "next/image";
import Loader from "./Loader";
import { postRequest } from "@/config/apiCalls";
import { supabase } from "@/utils/supabase";
import { toString as toQRCodeString } from "qrcode";
import { useAppSelector } from "@/lib/hooks";
// import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface QRCodeValues {
  email: string;
  schemaUrl: string;
}

interface VerificationStep {
  key: string;
  label: string;
  status: "pending" | "loading" | "success" | "failed";
  value: string;
  animated: boolean;
}

const ProofRequest: React.FC<IProofRequestDetails> = ({
  openModal,
  closeModal,
  onSuccess,
  requestId,
  userData,
  view,
  stateValue,
  issuerHolderDetails,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlLoaderRef = useRef<HTMLDivElement>(null);

  const [htmlTemplate, setHtmlTemplate] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [verificationDetails, setVerificationDetails] = useState<
    Record<string, string>
  >({});
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<
    Record<string, string | null>
  >({});
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState<
    VerificationStep[]
  >([]);
  const dataPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [animation, setAnimation] = useState(false);
  const [currentlyCopying, setCurrentlyCopying] = useState<string | null>(null);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [stampReady, setStampReady] = useState(false);

  const verifierAccessToken = useAppSelector(
    (state) => state.verifier.verifierToken
  );
  const selectedOrg = useAppSelector(
    (state) => state.organization.selectedOrganization
  );
  const translate = useTranslations("ProofRequestPopup");

  useEffect(() => {
    if (!iframeLoaded) return;

    const resizeContent = () => {
      if (!iframeRef.current || !containerRef.current) return;
      const iframeContentWidth = iframeRef.current.scrollWidth;
      const iframeContentHeight = iframeRef.current.scrollHeight;
      const availableWidthForIframe = containerRef.current.clientWidth;
      const availableHeightForIframe = containerRef.current.clientHeight;
      let scaleX = availableWidthForIframe / iframeContentWidth;
      let scaleY = availableHeightForIframe / iframeContentHeight;
      let newScale = Math.min(scaleX, scaleY, 1) * 0.9;
      setScale(newScale);
    };

    const initialResizeKey = setInterval(() => {
      if (iframeRef.current && containerRef.current && modalRef.current) {
        resizeContent();
        if (htmlLoaderRef.current) {
          htmlLoaderRef.current.style.display = "none";
        }
        containerRef.current.style.visibility = "visible";
        clearInterval(initialResizeKey);
      }
    }, 100);

    window.addEventListener("resize", resizeContent);
    return () => {
      clearInterval(initialResizeKey);
      window.removeEventListener("resize", resizeContent);
      setIframeLoaded(false);
    };
  }, [iframeLoaded]);

  useEffect(() => {
    if (iframeLoaded && (isVerified || stateValue === "done")) {
      const timer = setTimeout(() => {
        setStampReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [iframeLoaded, isVerified, stateValue]);

  const encryptData = (details: QRCodeValues): string => {
    const CRYPTO_PRIVATE_KEY: string = `${process.env.NEXT_PUBLIC_QR_ENCRYPTION_DECREPTION_KEY}`;
    return CryptoJS.AES.encrypt(
      JSON.stringify(details),
      CRYPTO_PRIVATE_KEY
    ).toString();
  };

  const generateQRCodeString = async (encryptData: string) => {
    return toQRCodeString(encryptData, {
      width: 130,
      margin: 0,
      color: {light: generateQRCodeStringColor}
    });
  };

  const getQrCodeSvg = async (email: string, schemaUrl: string) => {
    const dataToEncrypt = { email, schemaUrl };
    const qrData = await encryptData(dataToEncrypt);
    return generateQRCodeString(qrData);
  };

  const fetchVerifiedData = useCallback(
    async (maxRetries: number = 5, retryDelay: number = 2000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const { data, error } = await supabase
          .from("verification_requests")
          .select()
          .eq("presentation_id", requestId);

        if (error) {
          console.error(
            `Error fetching verification data (attempt ${attempt}):`,
            error
          );
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
          return null;
        }

        if (data && data.length > 0) {
          const firstObject = data[0];
          let improvedDateTime = firstObject.updated_at;
          if (firstObject.updated_at) {
            improvedDateTime = firstObject.updated_at.endsWith("Z")
              ? firstObject.updated_at
              : firstObject.updated_at + "Z";
          }
          return {
            Issuer: firstObject.issuer_did || "N/A",
            Holder: firstObject.holder_did || "N/A",
            "Credential Signature": firstObject.proof_data?.jws || "N/A",
            "Issued On":
              new Date(
                firstObject.credential_data?.verifiableCredential?.[0]?.issuanceDate
              ).toLocaleString() || "N/A",
            "Verified On": new Date(improvedDateTime).toLocaleString(),
            "Expired?": "Not Expired",
          };
        }
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
      return null;
    },
    [requestId]
  );

  const simulateStepByStepVerification = async (
    newVerificationDetails: Record<string, string> | null
  ) => {
    const steps = [
      { key: "Issuer", label: translate("credential_issuer") },
      { key: "Holder", label: translate("credential_holder") },
      { key: "Credential Signature", label: translate("credential_signature") },
      { key: "Issued On", label: translate("issued_on") },
      { key: "Verified On", label: translate("verified_on") },
      { key: "Expired?", label: translate("expiry") },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setVerificationProgress((prev) => [
        ...prev,
        { ...steps[i], status: "loading", value: "", animated: true },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedValue = newVerificationDetails
        ? newVerificationDetails[steps[i].key] || ""
        : "N/A";
      setVerificationProgress((prev) => {
        const newProgress = [...prev];
        newProgress[i] = {
          ...newProgress[i],
          status: newVerificationDetails ? "success" : "failed",
          value: updatedValue,
          animated: false,
        };
        return newProgress;
      });
    }

    if (newVerificationDetails && !verificationCompleted) {
      setVerificationDetails(newVerificationDetails);
      setIsVerified(true);
      setAnimation(true);
      setVerificationCompleted(true);
      setTimeout(() => setAnimation(false), 1000);
    }
    setLoading(false);
  };

  const verifyProofPresentationRequest = async (proofId: string) => {
    if (!selectedOrg?.orgId || !verifierAccessToken || !requestId) {
      setLoading(false);
      setShowDetails(true);
      setVerificationProgress([]);
      setVerificationDetails({});
      setIsVerified(false);
      await simulateStepByStepVerification(null);
      return;
    }

    setLoading(true);
    setShowDetails(true);
    setVerificationProgress([]);
    setVerificationDetails({});
    setIsVerified(false);

    const verifyPayload = {};
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${verifierAccessToken}`,
      },
    };
    let url = verifyProofRequest
      .replace("#", selectedOrg.orgId)
      .replace("proofId", proofId);

    try {
      const apiRes: any = await postRequest(url, verifyPayload, config);
      console.log("API Response:", apiRes);
      if (apiRes && apiRes.data) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const verificationDetails = await fetchVerifiedData();
        console.log("Fetched Verification Details:", verificationDetails);
        await simulateStepByStepVerification(verificationDetails);
        if (verificationDetails) {
          onSuccess();
        }
      } else {
        throw new Error("API verification failed or no data returned.");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      await simulateStepByStepVerification(null);
    }
  };

  const onClosePopup = () => {
    if (isVerified) {
      onSuccess();
    }
    if (dataPollingIntervalRef.current)
      clearInterval(dataPollingIntervalRef.current);
    setIsVerified(false);
    setVerificationProgress([]);
    setVerificationDetails({});
    setIframeLoaded(false);
    setShowDetails(false);
    closeModal();
    setHtmlTemplate("");
    setLoading(false);
    setTemplateLoading(true);
    setAnimation(false);
    setCurrentlyCopying(null);
    setCopyFeedback({});
    setStampReady(false);
  };

  useEffect(() => {
    setShowPopup(true);
    const genPreviewTemplate = async () => {
      if (userData && userData.length > 0) {
        let htmlPreview = userData[0]?.certificateTemplate;
        if (!htmlPreview) return;
        const schemaUrl = userData[0]?.schemaId;
        const prepareProofDetails = userData.map((element: any) => {
          const firstElement = Object.keys(element)[0];
          const firstValue = Object.values(element)[0];
          return { [firstElement]: firstValue };
        });

        prepareProofDetails.forEach((element: any) => {
          const entityKey = Object.keys(element)[0];
          const propertyValue = Object.values(element)[0];
          const placeholder = `\\{\\{credential\\['${entityKey}'\\]\\}\\}`;
          if (serializationCondition.includes(typeof propertyValue)) {
            htmlPreview = htmlPreview.replace(
              new RegExp(placeholder, "g"),
              JSON.stringify(propertyValue)
            );
          } else {
            htmlPreview = htmlPreview.replace(
              new RegExp(placeholder, "g"),
              String(propertyValue)
            );
          }
        });

        const emailDetails = userData.find((ele) =>
          Object.keys(ele).includes("email")
        );
        const emailValue = emailDetails ? (emailDetails as any).email : "";
        const qrSvg = await getQrCodeSvg(emailValue, schemaUrl);
        htmlPreview = htmlPreview.replace("{{qrcode}}", qrSvg);

        setHtmlTemplate(htmlPreview);
        setTemplateLoading(false);

        if (view || stateValue === "done") {
          setShowDetails(true);
          setLoading(true);
          const verificationDetails = await fetchVerifiedData();
          if (verificationDetails) {
            setVerificationProgress([
              {
                key: "Issuer",
                label: `${translate("credential_issuer")}: ${issuerHolderDetails["issuer"]}`,
                status: "success",
                value: verificationDetails["Issuer"] || "",
                animated: false,
              },
              {
                key: "Holder",
                label: `${translate("credential_holder")}: ${issuerHolderDetails["holder"]}`,
                status: "success",
                value: verificationDetails["Holder"] || "",
                animated: false,
              },
              {
                key: "Credential Signature",
                label: translate("credential_signature"),
                status: "success",
                value: verificationDetails["Credential Signature"] || "",
                animated: false,
              },
              {
                key: "Issued On",
                label: translate("issued_on"),
                status: "success",
                value: verificationDetails["Issued On"] || "",
                animated: false,
              },
              {
                key: "Verified On",
                label: translate("verified_on"),
                status: "success",
                value: verificationDetails["Verified On"] || "",
                animated: false,
              },
              {
                key: "Expired?",
                label: translate("expiry"),
                status: "success",
                value: verificationDetails["Expired?"] || "",
                animated: false,
              },
            ]);
            setVerificationDetails(verificationDetails);
            setIsVerified(true);
            if (!verificationCompleted) {
              setAnimation(true);
              setVerificationCompleted(true);
              setTimeout(() => setAnimation(false), 1000);
            }
          } else {
            setVerificationProgress([
              {
                key: "Issuer",
                label: translate("credential_issuer"),
                status: "failed",
                value: "N/A",
                animated: false,
              },
              {
                key: "Holder",
                label: translate("credential_holder"),
                status: "failed",
                value: "N/A",
                animated: false,
              },
              {
                key: "Credential Signature",
                label: translate("credential_signature"),
                status: "failed",
                value: "N/A",
                animated: false,
              },
              {
                key: "Issued On",
                label: translate("issued_on"),
                status: "failed",
                value: "N/A",
                animated: false,
              },
              {
                key: "Verified On",
                label: translate("verified_on"),
                status: "failed",
                value: "N/A",
                animated: false,
              },
              {
                key: "Expired?",
                label: translate("expiry"),
                status: "failed",
                value: "N/A",
                animated: false,
              },
            ]);
          }
          setLoading(false);
        }
      }
    };
    genPreviewTemplate();
  }, [userData, view, stateValue, fetchVerifiedData]);

  useEffect(() => {
    setAnimation(isVerified && !verificationCompleted);
    if (isVerified && !verificationCompleted) {
      setVerificationCompleted(true);
      setTimeout(() => setAnimation(false), 1000);
    }
  }, [isVerified, verificationCompleted]);

  useEffect(() => {
    return () => {
      if (dataPollingIntervalRef.current)
        clearInterval(dataPollingIntervalRef.current);
    };
  }, []);

  const getDetailIcon = (
    key: string,
    status: "pending" | "loading" | "success" | "failed" = "pending"
  ) => {
    switch (status) {
      case "loading":
        return <Loader />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-success" />;
      case "failed":
        return <XCircle className="w-6 h-6 text-failed" />;
      default:
        switch (key.toLowerCase()) {
          case "issuer":
            return (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            );
          case "holder":
            return (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            );
          case "credential signature":
            return (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            );
          case "issued on":
          case "verified on":
            return (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            );
          default:
            return (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            );
        }
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (currentlyCopying) return;
    let copyText = text;
    if (key === "Issuer" && verificationDetails["Issuer"]) {
      copyText = `${translate("credential_issuer")}: ${issuerHolderDetails["issuer"]} - ${verificationDetails["Issuer"]}`;
    } else if (
      key === "Holder" &&
      verificationDetails["Holder"] &&
      verificationDetails["Credential Signature"]
    ) {
      copyText = `${translate("credential_holder")}: ${issuerHolderDetails["holder"]} - ${verificationDetails["Credential Signature"]}`;
    }
    navigator.clipboard.writeText(copyText);
    setCurrentlyCopying(key);
    setCopyFeedback((prev) => ({ ...prev, [key]: "Copied!" }));
    setTimeout(() => {
      setCopyFeedback((prev) => {
        const newFeedback = { ...prev };
        delete newFeedback[key];
        return newFeedback;
      });
      setCurrentlyCopying(null);
    }, 2000);
  };

  const handleCopyAll = () => {
    if (currentlyCopying) return;
    const allText = verificationProgress
      .filter((step) => step.status !== "loading")
      .map((step) => `${step.label}: ${step.value}`)
      .join("\n");
    navigator.clipboard.writeText(allText);
    setCurrentlyCopying("all");
    setCopyFeedback((prev) => ({ ...prev, all: "Copied!" }));
    setTimeout(() => {
      setCopyFeedback((prev) => {
        const newFeedback = { ...prev };
        delete newFeedback["all"];
        return newFeedback;
      });
      setCurrentlyCopying(null);
    }, 2000);
  };

  const allVerified =
    verificationProgress.length > 0 &&
    verificationProgress.every((step) => step && step.status === "success");

  return (
    <>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div
            className={`relative m-4 w-[90%] h-[60%] sm:h-[90%] overflow-hidden rounded-lg border border-border bg-card shadow-md ${showDetails ? "grid grid-cols-4" : "flex"}`}
            ref={modalRef}
          >
            <div className="absolute top-2.5 right-2.5 z-[70]">
              <Button
                onClick={onClosePopup}
                variant={"ghost"}
                className="rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-secondary"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">{translate("close_modal")}</span>
              </Button>
            </div>

            <div
              className={`flex flex-col h-full ${showDetails ? "col-span-3 border-r border-border pr-2" : "col-span-4"}`}
            >
              <div className="h-[4.5rem] w-full grid justify-end items-end px-20 pb-2">
                {!templateLoading && (
                  <div className="flex gap-2">
                    {!(isVerified || stateValue === "done") ? (
                      <Button
                        style={{ fontFamily: "Ubuntu" }}
                        aria-busy={loading}
                        onClick={() =>
                          verifyProofPresentationRequest(requestId)
                        }
                        disabled={loading}
                        className={`flex justify-center items-center text-base w-fit font-medium text-center h-11 ${!loading ? "bg-primary hover:bg-primary/[.9]" : "disabled:bg-background disabled:opacity-80 text-foreground"}`}
                      >
                        <div className="flex items-center gap-2">
                          {loading ? (
                            <>
                              <Loader />
                              <span className="text-sm h-full flex items-center text-primary-foreground">
                                {translate("verifying")}
                              </span>
                            </>
                          ) : (
                            <>
                              <Image
                                src={`/images/verify.svg`}
                                alt="img"
                                width={verifiedImage.width}
                                height={verifiedImage.height}
                              />
                              <span className="text-sm h-full flex items-center text-primary-foreground">
                                {translate("verify")}
                              </span>
                            </>
                          )}
                        </div>
                      </Button>
                    ) : null}
                    {(isVerified || stateValue === "done") && stampReady && (
                      <div className="flex items-center z-20">
                        <div className="relative pt-[38px] pr-5">
                          <Image
                            src={stampImage}
                            alt="Verification Stamp"
                            width={120}
                            height={120}
                            className={`opacity-90 transition-opacity duration-1000 ${animation ? "animate-stampIn opacity-100" : "opacity-90"}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {templateLoading ? (
                <div className="z-30 inset-0 flex items-center justify-center text-md text-muted-foreground absolute">
                  <Loader />
                </div>
              ) : (
                <>
                  <div
                    ref={htmlLoaderRef}
                    className="z-30 inset-0 flex items-center justify-center text-md text-muted-foreground absolute"
                  >
                    <Loader />
                  </div>
                  <div
                    ref={containerRef}
                    className="h-full invisible mx-1 flex-1 overflow-hidden"
                  >
                    <div className="w-full h-full flex overflow-hidden justify-center items-center">
                      <iframe
                        ref={iframeRef}
                        style={{
                          transform: `scale(${scale})`,
                          transformOrigin: "center center",
                          width: "95%",
                          height: "116%",
                          aspectRatio: "2.424/1",
                          overflow: "visible",
                        }}
                        onLoad={() => setIframeLoaded(true)}
                        scrolling="yes"
                        srcDoc={htmlTemplate}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {showDetails && (
              <div className="p-4 h-full overflow-y-scroll bg-muted col-span-1">
                <div className="flex items-center justify-between p-4 border-b border-border bg-accent rounded-t-lg -mt-4 -mx-4 mb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold">
                      {translate("verification_details")}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {verificationProgress.map((step, index) => (
                    <div
                      key={step.key}
                      className={`bg-card rounded-lg border shadow-sm ${
                        step.status === "loading"
                          ? "border-border bg-accent"
                          : step.status === "success"
                          ? "border-border bg-success"
                          : step.status === "failed"
                          ? "border-border bg-failed"
                          : "border-border"
                      } relative overflow-hidden ${step.animated ? "animate-slideInFromRight" : ""}`}
                      style={{ animationDelay: "0s" }}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full">
                            {getDetailIcon(step.key, step.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <dt className="font-semibold text-foreground text-sm uppercase tracking-wide">
                              {step.label}
                            </dt>
                            <dd className="text-muted-foreground mt-1 break-all text-sm">
                              {step.status === "loading" ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                step.value
                              )}
                            </dd>
                          </div>
                        </div>
                        {step.status !== "loading" && (
                          <div className="absolute bottom-2 right-2">
                            {!copyFeedback[step.key] && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(step.value, step.key);
                                }}
                                disabled={
                                  currentlyCopying !== null &&
                                  currentlyCopying !== step.key
                                }
                                className="flex-shrink-0 p-1 h-auto text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 0h-2M10 18H8m6 0h-2"
                                  ></path>
                                </svg>
                              </Button>
                            )}
                            {copyFeedback[step.key] && (
                              <span className="text-xs text-primary-foreground bg-primary rounded-full px-2 py-0.5">
                                {copyFeedback[step.key]}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {allVerified && (
                <div className="p-4 pt-2 flex justify-end">
                  <div className="relative h-8 w-24"> 
                    {!copyFeedback["all"] ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyAll}
                        disabled={currentlyCopying !== null}
                        className="absolute inset-0 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 0h-2M10 18H8m6 0h-2"
                          ></path>
                        </svg>
                        <span className="ml-2">Copy All</span>
                      </Button>
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-primary-foreground bg-primary rounded-full px-2 py-0.5 animate-fadeIn">
                        {copyFeedback["all"]}
                      </span>
                    )}
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProofRequest;