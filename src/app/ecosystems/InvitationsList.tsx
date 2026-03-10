"use client";
import * as Yup from 'yup'
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
} from "@/config/constant";
import { getRequest, postRequest } from "@/config/apiCalls";

import { Button } from "@/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/generic-table-component/data-table";
import Modal from "@/components/Modal";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HttpStatusCode } from "axios";
import { AlertComponent } from "@/components/AlertComponent";
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip } from "@/components/ui/tooltip";
import { Formik, Form as FormikForm } from "formik";
import { useAppSelector } from '@/lib/hooks';
import { RootState } from '@/lib/store';



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

  const ecosystemEnabled = useAppSelector((state: RootState) => state.ecosystem?.ecosystemEnableStatus)

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


  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  })

  useEffect(() => {
    let timer: NodeJS.Timeout
    timer = setTimeout(() => { fetchInvitations() }, 500)
    return () => clearTimeout(timer)
  }, [
    paginationParameter.pageNumber,
    paginationParameter.pageSize,
    paginationParameter.search
  ]);


  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const data = await getRequest(invitationsApi, { pageSize: paginationParameter?.pageSize, pageNumber: paginationParameter.pageNumber + 1, search: paginationParameter.search });
      const totalPages = data?.data.data.totalPages
      setPaginationParameter((prev) => ({
        ...prev,
        totalPages: totalPages // or just totalPages
      }));
      setEcosystemList(data?.data.data.data)

      setLoading(false);
    } catch (error) {
      console.error("fetchInvitations", error)
      setErrorMessage(`Failed to fetch invitations ${error}`)
    }

  }


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
            : <div className="h-16 grid items-center">--</div>

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
          ${!row.original?.ecosystem &&
            "status-pending border border-[var(--accent)] border-opacity-90"
            }
          ${row.original?.ecosystem &&
            "status-accepted border border-green border-opacity-70"
            }
        `}
        >
          {row.original?.ecosystem
            ? invitationState.CREATED[0].toUpperCase() + invitationState.CREATED.slice(1).toLowerCase()
            : invitationState.PENDING[0].toUpperCase() + invitationState.PENDING.slice(1).toLowerCase()
          }
        </span>
      ),
      columnFunction: [],
    }];

  const metadata: ITableMetadata = {
    enableSelection: false,
  };

  const tableStyling: TableStyling = { metadata, columnData };
  const column = getColumns<any>(tableStyling);

  const showInvitationPopUp = () => {
    setOpenModal(true)
    setEmail('')
  }

  const sendInvitation = async () => {
    try {
      setLoading(true)
      const payload = { email }
      const data = await postRequest(invitationsApi, payload);
      if (data && data?.status === HttpStatusCode.Created) {
        setMessage(data.data.message)
        handleShowAlert()
        fetchInvitations()
      }
      setLoading(false);
    } catch (error) {
      setErrorMessage(`Failed to send invitation ${error}`)
      handleShowAlert()
    } finally {
      setOpenModal(false)
      setLoading(false)
    }
  }

  function handleShowAlert() {
    setShowAlert(true)
    setTimeout(() => {
      setShowAlert(false)
      setMessage("")
      setErrorMessage("")
    }, 2000)
  }

  const onSubmit = async (): Promise<void> => {
    sendInvitation()
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-md dark:text-white mr-auto">
              Ecosystems
            </h1>
            <p className="text-muted-foreground">Here&apos;s a list of all ecosystems</p>
          </div>
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
            { ecosystemEnabled &&
               <Button
                 onClick={showInvitationPopUp}
                 className="flex items-center gap-2 px-4 py-2 text-base font-medium"
                 disabled={loading}
               >
                 Create Ecosystem Lead
               </Button>
             }
          </div>
        </div>
        <div className="relative min-h-[400px]">
          <DataTable
            isLoading={tableLoading}
            placeHolder="Filter by email"
            data={
              Array.isArray(ecosystemList) ? ecosystemList : []
            }
            columns={column}
            index={"id"}
            pageIndex={paginationParameter.pageNumber}
            pageSize={paginationParameter.pageSize || 10}
            pageCount={paginationParameter.totalPages}
            onPageChange={(index) => {
              setPaginationParameter((prev) => ({
                ...prev,
                pageNumber: index,
              }));
            }}
            onPageSizeChange={(size) => {
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
                pageNumber: 0
              }))
            }
          />
        </div>
      </div>

      {openModal &&
        <Modal
          closePopup={() => setOpenModal(false)}
          showCloseButton={true}
          className="w-full max-w-3xl min-w-md border sm:w-1/4 2xl:w-1/3"
        >
          <div className="mt-6 flex flex-col items-start justify-start px-4 pb-8 text-center">
            <h2 className="font-semibold text-lg mb-4">
              Invite Ecosystem Lead
            </h2>
            <Formik
              initialValues={{
                email: '',
              }}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ errors, touched, handleChange, handleBlur, values, isValid }) => (
                <FormikForm className="space-y-4">
                  <div className="">
                    <div className="text-left">
                      <p>Email<span className='ml-auto text-semi-bold text-red-500'>*</span></p>
                      <Input
                        placeholder="Email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          handleChange(e)
                          setEmail((prev) => (e.target.value))
                        }}
                        onBlur={handleBlur}
                        className="px-3 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-w-sm"
                      />
                      {errors.email && touched.email && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-start gap-2">
                    <Button type="submit" disabled={loading || !isValid}>
                      {loading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </FormikForm>
              )}
            </Formik>
          </div>
        </Modal>
      }
    </>
  );
};

export default InvitationsList;
