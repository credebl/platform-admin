import { ReactElement } from "react";

export interface Data {
  handleChange(value: string): void;
  inputType: string;
  data: string | JSX.Element;
  subData?: string;
}
export interface TableData {
  clickId?: string | null;
  data: Data[];
}

export interface IEmptyListMessage {
  message: string;
  description: string;
  buttonContent?: string;
  svgComponent?: ReactElement;
  feature?: string;
  onClick?: () => void;
  noExtraHeight?: boolean;
}
export enum ProofRequestState {
  presentationReceived = "presentation-received",
  offerReceived = "offer-received",
  declined = "declined",
  requestSent = "request-sent",
  requestReceived = "request-received",
  credentialIssued = "credential-issued",
  credentialReceived = "credential-received",
  done = "done",
  abandoned = "abandoned",
}
export enum ProofRequestStateUserText {
  requestSent = "Requested",
  requestReceived = "Received",
  done = "Verified",
  abandoned = "Declined",
}
export interface userData {
  [key: string]: string;
  schemaId: string;
  certificateTemplate: string;
}

export interface IProofRequestDetails {
  verifyLoading?: boolean;
  openModal: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  requestId: string;
  userData?: userData[];
  view?: boolean;
  userRoles?: string[];
  stateValue: string;
  issuerHolderDetails: IVerificationDetails
}

export interface IVerificationDetails {
  holder: string;
  issuer: string;
}

export interface showDetails {
  showModal: boolean
  setShowModal: (value: boolean) => void
  threadId: string
  content: any
  issuerHolderDetails: IVerificationDetails
  animation: boolean
}

export interface IPhoneNo {
  handleChangeInput: (event: React.ChangeEvent<HTMLInputElement>) => void
  activeCodeValue: string
  setActiveCodeValue: (val: string) => void
}

export interface OrgAgentdetails {
  orgDid: string
}
export interface EmailVerifyData {
  verificationCode: string,
  email: string
}
export interface UserRegistartion {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

export interface ErrorResponse {
  message?: string;
  [key: string]: any; // To handle unexpected properties
}
