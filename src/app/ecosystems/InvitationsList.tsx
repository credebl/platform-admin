"use client";

import {
  CallbackFunction,
  ColumnActionName,
  ITableMetadata,
  TableStyling,
  getColumns,
} from "@/components/ui/generic-table-component/columns";
import {
    invitationState,
} from "../../utils/common.interfaces";
import React, { useEffect, useState } from "react";
import { dateConversion } from "@/config/common.functions";
import {
  invitationsApi,
  signOutApi,
} from "@/config/constant";
import { getRequest, postRequest } from "@/config/apiCalls";

import { Button } from "@/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/generic-table-component/data-table";
import Modal from "@/components/Modal";
import { RefreshCw } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Alert from "@/components/alert";
import { HttpStatusCode } from "axios";
import { AlertComponent } from "@/components/AlertComponent";
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip } from "@/components/ui/tooltip";


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
  const [ecosystemList, setEcosystemList] = useState<any>([]);
  const [email, setEmail] = useState('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('')
  const sessionId = useAppSelector((state) => state.session.sessionId);


  const accessToken = useAppSelector(
    (state) => state.session.token
  );

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


  const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard`;


   useEffect(() => {
      console.log("paginationParameter",paginationParameter)
      fetchInvitations();
   }, [
      paginationParameter.pageNumber,
      paginationParameter.pageSize,
   ]);

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
              className="w-1/4 cursor-pointer"
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
                  <div className="w-3/4 text-[15px] mb-2 text-left"><b>{row.original?.ecosystem?.name && row.original?.ecosystem?.name[0].toUpperCase() + row.original?.ecosystem?.name.slice(1)}</b></div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="max-w-sm whitespace-normal break-words mb-2 text-muted-foreground cursor-default text-left">
                          {row.original?.ecosystem?.description.length > 70
                            ? row.original?.ecosystem?.description.slice(0, 70) + "..."
                            : row.original?.ecosystem?.description}
                        </div>
                      </TooltipTrigger>
                      
                      <TooltipContent side="right" align="center">
                        <p className="max-w-xs">{row.original?.ecosystem?.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-xs text-muted-foreground">
                        <span className="font-semibold">Created : </span>
                        <span>{dateConversion(row.original?.ecosystem?.createDateTime)}</span>
                  </div>

               </div>
               :<div className="h-16 grid items-center">--</div>

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
        <div className="w-1/4">
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
          className={`w-1/4 text-xs font-medium min-[120px]:px-4  rounded-md flex justify-center w-fit border  
          ${!row.original?.ecosystem  &&
               "status-pending border border-[var(--accent)] border-opacity-90"
               }
          ${ row.original?.ecosystem &&
               "status-accepted border border-green border-opacity-70"
               }
        `}
        >
          { row.original?.ecosystem 
            ? invitationState.CREATED[0].toUpperCase() + invitationState.CREATED.slice(1).toLowerCase()
            : invitationState.PENDING[0].toUpperCase() + invitationState.PENDING.slice(1).toLowerCase()
            }
        </span>
      ),
      columnFunction: [],
    }  ];

  const metadata: ITableMetadata = {
    enableSelection: false,
  };

  const tableStyling: TableStyling = { metadata, columnData };
  const column = getColumns<any>(tableStyling);

  const handleLogout = async (): Promise<void> => {
    try {
      const payload = {
        sessions: [sessionId],
      };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };
      await postRequest(signOutApi, payload, config);
      const rootKey = "persist:root";

      if (localStorage.getItem(rootKey)) {
        localStorage.removeItem(rootKey);

        const interval = setInterval(async () => {
          if (!localStorage.getItem(rootKey)) {
            clearInterval(interval);
            const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard`;
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
            const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/dashboard`;
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
      setEmail('')
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
         fetchInvitations()
       } 
      setLoading(false);
    } catch (error) {
      setErrorMessage(`Failed to send invitation ${error}`)
      handleShowAlert()
    }finally {
      setOpenModal(false)
      setLoading(false)
    }
   }

   function handleShowAlert() {
       setShowAlert(true)
       setTimeout(()=> {
        setShowAlert(false)
        setMessage("")
        setErrorMessage("")
      },2000)
   }

  return (
    <>
      <div className="px-4 pt-2 p-4">
        {showAlert && (errorMessage || message) && (
         <>
            <AlertComponent
              type={message ? "success" : "failure"}
              message={message || errorMessage}
              onAlertClose={() => setShowAlert(false)}
            />
          </>
        )}
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

                 <p className="mt-3 mb-2">
                    Email<span className="text-red-400 font-semibold">*</span>
                 </p>
                 <Input
                    className="max-w-sm px-3"
                    type="email"
                    name="email"
                    id="email"
                    placeholder={"Enter email"}
                    value={email}
                    required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                    title="Please enter a valid email address (e.g. name@domain.com)"
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
    </>
  );
};

export default InvitationsList;
