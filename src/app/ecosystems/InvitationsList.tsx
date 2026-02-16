"use client";

import {
  CallbackFunction,
  ColumnActionName,
  ITableMetadata,
  SortActions,
  TableStyling,
  getColumns,
} from "@/components/ui/generic-table-component/columns";
import {
    invitationState,
  ProofRequestState,
  ProofRequestStateUserText,
} from "../../utils/common.interfaces";
import React, { useEffect, useMemo, useState } from "react";
import { ScanSvg, VerifySvg, ViewSvg } from "@/config/SVG";
import { dateConversion, decryptValue } from "@/config/common.functions";
import {
  fetchProofRequestDetails,
  fetchVerificationList,
  invitationsApi,
  signOutApi,
  webhookUrlConfig,
} from "@/config/constant";
import { getRequest, postRequest } from "@/config/apiCalls";

import { Button } from "@/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/generic-table-component/data-table";
import Image from "next/image";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import ProofRequest from "@/components/ProofRequestPopup";
import { RefreshCw } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { format } from "date-fns";
import { signOut } from "next-auth/react";
import { useAppSelector } from "@/lib/hooks";
import { useLocaleRouter } from "@/utils/useLocalizedRouter";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Alert from "@/components/alert";
import { HttpStatusCode } from "axios";

const initialPageState = {
  pageSize: 10,
  pageNumber: 1,
  search: "",
  sortBy: "createDateTime",
  sortingOrder: "desc",
  allSearch: "",
};

interface PageParameter {
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  lastPage: number;
  pageSize?: number;
  previousPage: number | null;
  sortBy: string;
  sortOrder: string;
  search: string;
}

type ColumnFunctionality =
  | ColumnActionName
  | { sortCallBack: CallbackFunction };

export interface IColumnData {
  id: string;
  title: string;
  accessorKey: string;
  columnFunction: ColumnFunctionality[];
  cell?: (cell: CellContext<any, unknown>) => JSX.Element;
}

const InvitationsList = (): React.JSX.Element => {
  const router = useRouter();
  const [ecosystemList, setEcosystemList] = useState<any>([]);
  const [listAPIParameter, setListAPIParameter] =
    useState(initialPageState);
  const [email, setEmail] = useState('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestId, setRequestId] = useState<string>("");
  const [userData, setUserData] = useState(null);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [view, setView] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
 const [message, setMessage] = useState('')
  const [showOrgRegistrationModal, setShowOrgRegistrationModal] =
    useState(false);
  const [stateValue, setStateValue] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showWalletInfoModal, setShowWalletInfoModal] = useState(false);
  const sessionId = useAppSelector((state) => state.verifier.sessionId);

  const { push } = useLocaleRouter();

  const verifierAccessToken = useAppSelector(
    (state) => state.verifier.verifierToken
  );

  const selectedOrg = useAppSelector(
    (state) => state.organization.selectedOrganization
  );
  const isOrgLoaded = useAppSelector((state) => state.organization.isOrgLoaded);
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy hh:mm:ss a");
  };

  const [paginationParameter, setPaginationParameter] = useState<PageParameter>(
    {
      pageNumber: 0,
      totalPages: 0,
      lastPage: 0,
      pageSize: 10,
      hasNextPage: false,
      hasPreviousPage: false,
      nextPage: null,
      previousPage: null,
      sortBy: "createDateTime",
      sortOrder: "desc",
      search: "",
    }
  );

  const [verificationTableData, setVerificationTableData] = useState<
    ITableMetadata | []
  >([]);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${verifierAccessToken}`,
    },
  };

  const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/ecosystems`;

  // const webhookURLConfig = async (orgId: string) => {
  //   try {
  //     if (orgId && process.env.NEXT_PUBLIC_WEBHOOK_URL) {
  //       const url = webhookUrlConfig.replace("orgId", orgId);
  //       const payload = {
  //         webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL,
  //       };
  //       await postRequest(url, payload, config);
  //       setLoading(false);
  //       setShowOrgRegistrationModal(false);
  //     } else {
  //       setLoading(false);
  //       setShowAlert(true);
  //       setErrorMessage(translate("webhookConfigError"));
  //       console.error("Error in webhook url configration");
  //     }
  //   } catch (error) {
  //     console.error("Error in webhook url configration");
  //     setLoading(false);
  //     setShowAlert(true);
  //     setErrorMessage(translate("webhookConfigError"));
  //   }
  // };

  // useEffect(() => {
  //   const handleOrgSelection = async () => {
  //     if (!selectedOrg) {
  //       setShowOrgRegistrationModal(true);
  //       setShowWalletInfoModal(false);
  //       return;
  //     }

  //     setShowOrgRegistrationModal(false);
  //     if (selectedOrg?.orgAgent?.length > 0) {
  //       // await webhookURLConfig(selectedOrg.orgId);
  //       setShowWalletInfoModal(false);
  //     }

  //     if (selectedOrg?.orgAgent?.length === 0) {
  //       setShowWalletInfoModal(true);
  //     }
  //   };

  //   handleOrgSelection();
  //   fetchVerificationData(listAPIParameter, true);
  // }, [selectedOrg]);

  // const fetchVerificationData = (
  //   listAPIParameter: any,
  //   isPageLoading: boolean
  // ) => {
  //   if (isPageLoading) {
  //     setLoading(true);
  //   } else {
  //     setTableLoading(true);
  //   }
  //   if (selectedOrg && verifierAccessToken) {
  //     const proofRequestUrl = fetchVerificationList.replace(
  //       "#",
  //       selectedOrg.orgId
  //     );
  //     const config = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${verifierAccessToken}`,
  //       },
  //     };
  //     getRequest(
  //       `${proofRequestUrl}?pageSize=${
  //         paginationParameter.pageSize
  //       }&pageNumber=${paginationParameter.currentPage + 1}&sortBy=${
  //         paginationParameter.sortOrder
  //       }&sortField=${paginationParameter.sortBy}&searchByText=${
  //         paginationParameter.search
  //       }`,
  //       {},
  //       config.headers
  //     )
  //       .then((response) => {
  //         if (response?.data.data.data.length > 0) {
  //           response?.data.data.data.map((record: any) => ({
  //             presentationId: record.presentationId,
  //             emailId: record.emailId,
  //             isEncrypted: isEncrypted(record.emailId),
  //           }));
  //           setVerificationTableData(response?.data.data.data);
  //           generateVerificationDetails(response?.data.data.data);
  //           const {
  //             totalItems,
  //             nextPage,
  //             lastPage,
  //             hasNextPage,
  //             hasPreviousPage,
  //             previousPage,
  //           } = response?.data.data;
  //           setPaginationParameter((prevState) => ({
  //             ...prevState,
  //             totalItems: totalItems,
  //             hasNextPage: hasNextPage,
  //             hasPreviousPage: hasPreviousPage,
  //             nextPage: nextPage,
  //             previousPage: previousPage,
  //             lastPage: lastPage,
  //           }));
  //           setTotalItem(totalItems);
  //         } else {
  //           setVerificationTableData([]);
  //           setVerificationList([]);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching verification data:", error);
  //         setVerificationList([]);
  //       })
  //       .finally(() => {
  //         if (isPageLoading) {
  //           setLoading(false);
  //         } else {
  //           setTableLoading(false);
  //         }
  //       });
  //   } else {
  //     if (isPageLoading) {
  //       setLoading(false);
  //     } else {
  //       setTableLoading(false);
  //     }
  //   }
  // };

  // const openProofRequestModel = (
  //   flag: boolean,
  //   requestId: string,
  //   state: string
  // ) => {
  //   setRequestId(requestId);
  //   setOpenModal(flag);
  //   setStateValue(state);
  //   setView(state === "done");
  // };

  // Cache decrypted emails to avoid redundant decryption
  // const decryptedEmailCache = useMemo(() => new Map<string, string>(), []);

  // const getDecryptedEmail = (emailId: string): string => {
  //   if (!emailId) return translate("notAvailable");
  //   if (decryptedEmailCache.has(emailId)) {
  //     return decryptedEmailCache.get(emailId)!;
  //   }
  //   const isEnc = isEncrypted(emailId);
  //   const result = isEnc ? decryptValue(emailId) : emailId;
  //   decryptedEmailCache.set(emailId, result);
  //   return result;
  // };

  // const generateVerificationDetails = (verificationDetailsResponse: any) => {
  //   const generatedVerificationList = verificationDetailsResponse?.map(
  //     (record: any) => {
  //       const email = getDecryptedEmail(record.emailId);
  //       return {
  //         data: [
  //           {
  //             data: (
  //               <div
  //                 data-tooltip-id={`tooltip-presentationId-${record.presentationId}`}
  //                 data-tooltip-content={record.presentationId}
  //                 className="cursor-pointer"
  //               >
  //                 {record.presentationId
  //                   ? record.presentationId.split("-")[0]
  //                   : translate("notAvailable")}
  //                 <Tooltip
  //                   id={`tooltip-presentationId-${record.presentationId}`}
  //                   place="top"
  //                 />
  //               </div>
  //             ),
  //           },
  //           {
  //             data: record.emailId ? (
  //               <span
  //                 data-tooltip-id={`tooltip-email-${record.presentationId}`}
  //                 data-tooltip-content={email}
  //                 className="cursor-pointer"
  //               >
  //                 {email}
  //                 <Tooltip
  //                   id={`tooltip-email-${record.presentationId}`}
  //                   place="top"
  //                 />
  //               </span>
  //             ) : (
  //               translate("notAvailable")
  //             ),
  //           },
  //           {
  //             data: record.schemaName
  //               ? record.schemaName
  //               : translate("notAvailable"),
  //           },
  //           {
  //             data: record.issuanceEntity ? (
  //               <span
  //                 data-tooltip-id={`tooltip-issuer-${record.presentationId}`}
  //                 data-tooltip-content={record.issuanceEntity}
  //                 className="cursor-pointer"
  //               >
  //                 {record.issuanceEntity}
  //                 <Tooltip
  //                   id={`tooltip-issuer-${record.presentationId}`}
  //                   place="top"
  //                 />
  //               </span>
  //             ) : (
  //               translate("notAvailable")
  //             ),
  //           },
  //           {
  //             data: (
  //               <div>
  //                 <span
  //                   data-tooltip-id={`tooltip-${record.createDateTime}`}
  //                   data-tooltip-content={formatDate(record.createDateTime)}
  //                   className="cursor-pointer"
  //                 >
  //                   {dateConversion(record.createDateTime)}
  //                 </span>
  //                 <Tooltip
  //                   id={`tooltip-${record.createDateTime}`}
  //                   place="top"
  //                 />
  //               </div>
  //             ),
  //           },
  //           {
  //             data: (
  //               <span
  //                 className={`text-xs font-medium sm:mr-0 md:mr-2 min-[320]:px-1 sm:px-0 lg:px-0.5 py-0.5 rounded-md flex justify-center min-[320]:w-full 2xl:w-8/12 ${
  //                   record?.state === ProofRequestState.requestSent &&
  //                   "bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--accent)]"
  //                 } ${
  //                   record?.state === ProofRequestState.done &&
  //                   "bg-[var(--success)] text-[var(--success-foreground)] border border-[var(--success)]"
  //                 } ${
  //                   record?.state === ProofRequestState.abandoned &&
  //                   "bg-[var(--failed)] text-[var(--failed-foreground)] border border-[var(--failed)]"
  //                 } ${
  //                   record?.state === ProofRequestState.presentationReceived &&
  //                   "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--secondary)]"
  //                 }`}
  //               >
  //                 {record?.state === ProofRequestState.requestSent
  //                   ? ProofRequestStateUserText.requestSent
  //                   : record?.state === ProofRequestState.presentationReceived
  //                   ? ProofRequestStateUserText.requestReceived
  //                   : record?.state === ProofRequestState.done
  //                   ? ProofRequestStateUserText.done
  //                   : record?.state === ProofRequestState.abandoned
  //                   ? ProofRequestStateUserText.abandoned
  //                   : ""}
  //               </span>
  //             ),
  //           },
  //           {
  //             data: (
  //               <Button
  //                 variant="default"
  //                 disabled={
  //                   loadingId === record.presentationId ||
  //                   (record.state !== ProofRequestState.presentationReceived &&
  //                     record?.state !== "done" &&
  //                     record?.state !== "abandoned")
  //                 }
  //                 onClick={() => {
  //                   if (
  //                     record.state === ProofRequestState.presentationReceived ||
  //                     record?.state === "done"
  //                   ) {
  //                     setLoadingId(record.presentationId);
  //                     setVerificationDetials({
  //                       holder: getDecryptedEmail(record.emailId),
  //                       issuer: record.issuanceEntity
  //                         ? record.issuanceEntity
  //                         : translate("not_available"),
  //                     });
  //                     openProofRequestModel(
  //                       true,
  //                       record?.presentationId,
  //                       record?.state
  //                     );
  //                     getProofPresentationData(record?.presentationId).finally(
  //                       () => setLoadingId(null)
  //                     );
  //                   }
  //                 }}
  //                 className={`${
  //                   record.state !== ProofRequestState.presentationReceived &&
  //                   record?.state !== "done" &&
  //                   record?.state !== "abandoned"
  //                     ? "cursor-not-allowed opacity-50 text-muted-foreground"
  //                     : "text-primary-foreground"
  //                 } flex items-center justify-center gap-2 text-base font-medium text-center bg-primary rounded-md focus:ring-4 focus:ring-[var(--ring)] sm:w-auto`}
  //               >
  //                 {loadingId === record.presentationId ? (
  //                   <Loader />
  //                 ) : record?.state === "done" ? (
  //                   <div className="flex items-center">
  //                     <ViewSvg />
  //                     <span className="pl-1">{translate("view")}</span>
  //                   </div>
  //                 ) : record?.state === "abandoned" ? (
  //                   <>
  //                     <p
  //                       className="flex items-center justify-center"
  //                       data-tooltip-id="my-tooltip"
  //                       data-tooltip-content={
  //                         record.errorMessage?.split(":")[1].trim() ||
  //                         translate("notAnyReason")
  //                       }
  //                     >
  //                       <Image
  //                         src="/images/assets/DeclinedReason.png"
  //                         alt={translate("declinedReasonImg")}
  //                         width={30}
  //                         height={30}
  //                       />
  //                       <span>{translate("declined_reason")}</span>
  //                     </p>
  //                     <Tooltip
  //                       id="my-tooltip"
  //                       place="top"
  //                       className="tooltip-custom"
  //                     />
  //                   </>
  //                 ) : (
  //                   <div className="flex items-center">
  //                     <VerifySvg />
  //                     <span>{translate("verify")}</span>
  //                   </div>
  //                 )}
  //               </Button>
  //             ),
  //           },
  //         ],
  //       };
  //     }
  //   );
  //   setVerificationList(generatedVerificationList);
  // };

   useEffect(() => {
      console.log("paginationParameter",paginationParameter)
      fetchInvitations();
   }, [
      paginationParameter.pageNumber,
      paginationParameter.pageSize,
   ]);

  // const scanToVerify = async () => {
  //   setLoading(true);
  //   try {
  //     await push("/scanQrCode");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const getProofPresentationData = async (proofId: string) => {
  //   try {
  //     const orgId = selectedOrg.orgId;
  //     if (orgId && verifierAccessToken) {
  //       const config = {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${verifierAccessToken}`,
  //         },
  //       };
  //       getRequest(
  //         `${fetchProofRequestDetails.replace("#", orgId)}/${proofId}`,
  //         {},
  //         config.headers
  //       )
  //         .then((response) => {
  //           setUserData(response?.data.data);
  //         })
  //         .catch((error) => {
  //           console.error("Error in fetch single proof details", error);
  //         });
  //     }
  //   } catch (error) {
  //     console.error("Error in getProofPresentationData:", error);
  //     throw error;
  //   }
  // };

  // const onRefresh = () => {
  //   decryptedEmailCache.clear();
  //   fetchVerificationData(listAPIParameter, false); // Changed to false to use tableLoading
  // };
   //
  useEffect(()=> {console.log("paginaitonparametne",paginationParameter)},[paginationParameter.pageNumber])

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const data = await getRequest(invitationsApi, {pageSize: paginationParameter?.pageSize , pageNumber: paginationParameter.pageNumber + 1});
         console.log("raw",data?.data.data)
      console.log("datae",data?.data.data.data)
      const totalPages = data?.data.data.totalPages
       setPaginationParameter((prev) => ({
          ...prev,
          totalPages: totalPages // or just totalPages
       }));
      setEcosystemList(data?.data.data.data)

      setLoading(false);
    } catch (error) {
      console.error("fetchInvitations",error)
      setErrorMessage(`Failed to fetch invitations ${error}`)
    }
    
  }

  useEffect(() => {
      fetchInvitations()
    }
  ,[])

  const handlePageChange = (page: number): void => {
    setPaginationParameter((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
  };

  const isEncrypted = (value: string) => {
    const result =
      value && typeof value === "string" && value.startsWith("U2FsdGVkX1");
    return result;
  };

  const columnData: IColumnData[] = [
    {
      id: "email",
      title: "Email",
      accessorKey: "email",
      columnFunction: [],
      cell: ({ row }) => {
        return (
          <>
            <span
              className="cursor-pointer"
            >
              {row.original.email}
            </span>
          </>
        );
      },
    },
    {
      id: "name",
      title: "Ecosystem Name",
      accessorKey: "name",      
      columnFunction: [],
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
        >
          {row.original?.ecosystem ?
               <div>
                  <div className="text-[15px] mb-2"><b>{row.original?.ecosystem?.name && row.original?.ecosystem?.name[0].toUpperCase() + row.original?.ecosystem?.name.slice(1)}</b></div>
                  <div className="max-w-sm  whitespace-normal break-words mb-2 text-muted-foreground">{100 < row.original?.ecosystem?.description.length ? row.original?.ecosystem?.description.slice(0,100) + '...' : row.original?.ecosystem?.description}</div>
                  <div className="text-xs text-muted-foreground">
                        <span className="font-semibold">Created : </span>
                        <span>{dateConversion(row.original?.ecosystem?.createDateTime)}</span>
                  </div>
               </div>
               :'--'

          }
        </div>
      ),
    },
    
    {
      id: "leadOranization",
      title: "Lead Organization",
      accessorKey: "leadOranization",
      columnFunction: [],
      cell: ({ row }) => (
        <div>
          {row.original?.organisation?.name
            ? row.original?.organisation?.name
            : "--"}
        </div>
      ),
    },
    {
      id: "status",
      title: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`text-xs font-medium min-[120px]:px-4  rounded-md flex justify-center w-fit border  
          ${row.original?.ecosystem  && row.original?.orgStatus === invitationState.INACTIVE &&
               "bg-gray-200 border border-[var(--accent)] border-opacity-90 text-muted-foreground"
               }
          ${row.original?.ecosystem  && row.original?.orgStatus === invitationState.ACTIVE &&
               "bg-green-200 text-green border border-green border-opacity-70"
               }
          ${row.original?.status === invitationState.PENDING || row.original?.status === invitationState.ACCEPTED &&
               "bg-[var(--primary)]/50  border  border-opacity-70"
           }
        `}
        >
          { row.original?.orgStatus === invitationState.INACTIVE
            ? invitationState.INACTIVE[0].toUpperCase() + invitationState.INACTIVE.slice(1).toLowerCase()
            : row.original?.orgStatus === invitationState.ACTIVE
            ? invitationState.ACTIVE[0].toUpperCase() + invitationState.ACTIVE.slice(1).toLowerCase()
            :"Pending"}
          {/* { row.original?.eocystem ? row.original.orgStatus : row.original.status } */}
        </span>
      ),
      columnFunction: [],
    },
    // {
    //   id: "actions",
    //   title: "Action",
    //   accessorKey: "actions",
    //   cell: ({ row }) => (
    //     <Button
    //       variant="default"
    //       disabled={
    //         loadingId === row.original.presentationId ||
    //         (row.original.state !== ProofRequestState.presentationReceived &&
    //           row.original?.state !== "done" &&
    //           row.original?.state !== "abandoned")
    //       }
    //       className={`flex items-center justify-center ${
    //         row.original.state !== ProofRequestState.presentationReceived &&
    //         row.original?.state !== "done" &&
    //         row.original?.state !== "abandoned"
    //           ? "cursor-not-allowed opacity-50 text-base font-medium text-center"
    //           : "text-base font-medium text-center"
    //       }`}
    //       onClick={() => {
    //       }}
    //     >
    //       View
    //     </Button>
    //   ),
    //   columnFunction: [],
    // },
  ];

  const metadata: ITableMetadata = {
    enableSelection: false,
  };

  const tableStyling: TableStyling = { metadata, columnData };
  const column = getColumns<any>(tableStyling);

  const handleLogout = async (): Promise<void> => {
    try {
      // Note : need to discuss when screen is ideal and token expired itself below API throw 401
      // so because of this session will not deleted from database
      const payload = {
        sessions: [sessionId],
      };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifierAccessToken}`,
        },
      };
      await postRequest(signOutApi, payload, config);
      const rootKey = "persist:root";

      if (localStorage.getItem(rootKey)) {
        localStorage.removeItem(rootKey);

        const interval = setInterval(async () => {
          if (!localStorage.getItem(rootKey)) {
            clearInterval(interval);
            const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/verificationList`;
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
            const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/verificationList`;
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

   const showInvitationPopUp = () => {
      setOpenModal(true)
   }

   const sendInvitation = async () => {
    try {
      setLoading(true)
      const payload = { email }
      const data = await postRequest(invitationsApi, payload);
       console.log("rawg",data)
       console.log("console data status",data?.status)
      if (data && data?.status === HttpStatusCode.Created){
         setMessage(data.data.message)
         handleShowAlert()
            console.log("data received")
         fetchInvitations()
            console.log("fetch invitaitons")
         setOpenModal(false)
            console.log("done")
       } 
      setLoading(false);
    } catch (error) {
      console.log("erorrroroor", error)
      console.error("sendInvitation",error)
      setErrorMessage(`Failed to send invitations ${error}`)
      handleShowAlert()
    }
   }

   function handleShowAlert() {
       setShowAlert(true)
       setTimeout(()=> setShowAlert(false),2000)
   }

  return (
    <>
      <div className="px-4 pt-2 p-4">
        <div className="mb-4 flex justify-between flex-wrap flex-col sm:flex-row gap-4">
          <h1 className="ml-1 text-2xl font-semibold text-gray-900 sm:text-md dark:text-white mr-auto">
            Ecosystems
          </h1>
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
               onClick={fetchInvitations}
              className="rounded-lg mr-4 sm:mr-0 items-center mt-2 sm:mt-0"
            >
              <RefreshCw
                className={`h-5 w-5 ${tableLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={showInvitationPopUp}
              className="flex items-center gap-2 px-4 py-2 text-base font-medium"
              disabled={loading}
            >
              {/* <ScanSvg /> */}
              Create Ecosystem Lead
            </Button>
          </div>
        </div>
        <div className="relative min-h-[400px]">
          <DataTable
            isLoading={tableLoading}
            placeHolder="Search"
            data={
              Array.isArray(ecosystemList) ? ecosystemList : []
            }
            columns={column}
            index={"id"}
            pageIndex={paginationParameter.pageNumber}
            pageSize={paginationParameter.pageSize || 10}
            pageCount={paginationParameter.totalPages}
            onPageChange={(index) => {
              console.log("index",index)
              setPaginationParameter((prev) => ({
                ...prev,
                pageNumber: index,
              }));
            }}
            onPageSizeChange={(size) => {
              console.log("page ize", size)
              setPaginationParameter((prev) => ({
                ...prev,
                pageSize: size,
                pageNumber: 0,
              }));
            }}
            onSearchTerm={(term) =>
              setPaginationParameter((prev) => ({
                ...prev,
                search: term,
              }))
            }
          />
        </div>
      </div>
      {/* {userData && (
        // <ProofRequest
        //   openModal={openModal}
        //   closeModal={() => {
        //     setVerificationDetials({
        //       holder: translate("not_available"),
        //       issuer: translate("not_available"),
        //     });
        //     openProofRequestModel(false, "", "");
        //   }}
        //   requestId={requestId}
        //   stateValue={stateValue}
        //   userData={userData}
        //   view={view}
        //   onSuccess={() => fetchVerificationData(listAPIParameter, false)}
        //   issuerHolderDetails={verification}
        // />
      )} */}

        {showAlert && (errorMessage || message) && (
          <Alert
            type={message ? "success" : "failure"}
            message={message || errorMessage}
            closeAlert={() => setShowAlert(false)}
          />
        )}
        {openModal &&
           <Modal
              closePopup={() => setOpenModal(false)}
              showCloseButton={true}
              className="w-full max-w-3xl  border sm:w-1/4 2xl:w-1/3"
           >
              <div className="mt-6 flex flex-col items-start justify-start px-4 pb-8 text-center">
                 <h2 className="font-semibold text-lg">
                    Invite Ecosystem Lead
                 </h2>

                 <p className="mt-3 text-muted-foreground">
                    Email
                 </p>
                 <Input
                    className="max-w-sm"
                    type={"email"}
                    name="email"
                    id="email"
                    placeholder={"Enter email"}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                 />

                 <div className="mt-8 flex justify-center gap-4">
                    <Button
                       className="flex items-center gap-2 px-4 py-2 text-base font-medium"
                       onClick={sendInvitation}
                    >
                       Send
                    </Button>
                 </div>
              </div>
           </Modal>
        }

      {showWalletInfoModal && (
        <Modal
          closePopup={() => setShowWalletInfoModal(false)}
          showCloseButton={false}
          className="h-3/4 w-3/4 sm:w-1/2 2xl:h-auto"
        >
          <div className="max-h-full w-full overflow-y-auto rounded-lg bg-card p-2 2xl:p-6">
            {/* Banner Box */}
            <div className="mb-6 p-5">
              <h3 className="mb-2 text-lg font-semibold text-yellow-800">
                Wallet Setup
              </h3>
              <ul className="list-disc space-y-3 pl-5 text-sm text-gray-800">
                <li>
                  <strong>Step 1: Wallet Configuration</strong>
                  <br />
                  Click on <em>`Proceed to Setup Wallet`</em> to navigate to the
                  <em>`Setup Your Wallet`</em> section under your organization,
                  where you can complete the wallet service configuration.
                </li>
                <li>
                  <strong>Step 2: Confirm Configuration</strong>
                  <br />
                  Ensure the wallet has been created and properly linked to your
                  organization.
                </li>
              </ul>
              <div className="mt-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">
                ⚠️ Completing these steps is required for secure credential
                verification flow.
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                className="flex items-center gap-2 px-4 py-2 text-base font-medium"
                onClick={() =>
                  router.push(
                    `${
                      process.env.NEXT_PUBLIC_CREDEBL_UI_PATH
                    }/agent-config?orgId=${
                      selectedOrg.orgId
                    }&redirectTo=${encodeURIComponent(
                      redirectUrl
                    )}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`
                  )
                }
              >
                Proceed to Setup Wallet
              </Button>
            </div>
            <div className="my-2 flex w-[50%] items-center justify-center gap-2 md:my-6 md:gap-4 m-auto">
              <hr className="border-border flex-grow border-2 border-t" />
            </div>
            <div
              className="flex justify-center gap-2 m-auto cursor-pointer"
              onClick={handleLogout}
            >
              <Image
                src={"/images/logout.svg"}
                alt="logout"
                width={24}
                height={24}
              />
                     Logout
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default InvitationsList;
