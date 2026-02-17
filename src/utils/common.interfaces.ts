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

export enum invitationState {
   ACTIVE = "ACTIVE",
   PENDING = "pending",
   ACCEPTED = "accepted",
   REJECTED = "rejected",
   INACTIVE = "INACTIVE",
}

export interface ErrorResponse {
  message?: string;
  [key: string]: any; // To handle unexpected properties
}

export interface IAlertComponent {
  message: string | null
  type: string
  viewButton?: boolean
  path?: string
  onAlertClose: () => void
}

export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: number
  refreshToken: string
  createdAt: string
  updatedAt: string
  accountId: string
  sessionType: string
  expiresAt: string
  clientInfo: clientInfo
}

export interface clientInfo {
  os: string
  browser: string
  deviceType: string
  rawDetail: string
  ip: string
}

export enum SESSION_TYPE {
  USER = 'user-session',
  ORGANIZATION = 'organization-session',
}
