export const basePath = process.env.NEXT_PUBLIC_BASE_API_PATH
export const paymentBasePath = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_ENDPOINT

export const signInApi = `${basePath}/auth/signin`
export const fetchSessionDetails = `${basePath}/auth/sessionDetails`
export const signOutApi = `${basePath}/auth/signout`
export const sendProofRequest = `${basePath}/orgs/#/proofs/oob`
export const getUserProfileApi = `${basePath}/users/profile`
export const checkUserExists = `${basePath}/users`
export const verifyEmail = `${basePath}/auth/verify`
export const signUpApi = `${basePath}/auth/signup`
export const invitationsApi = `${basePath}/invitations`
export const refreshTokenUrl = `${basePath}/auth/refresh-token`
export const dashboardData = `${basePath}/ecosystem/count/dashboard`
export const ecosystemStatus = `${basePath}/ecosystem-status`
export const updateEcosystemStatusApi = `${basePath}/config/ecosystem`
export const userSessions= `${basePath}/auth/userId:/sessions`
export const deleteSession= `${basePath}/auth/sessionId:/sessions`
//Regx
export const emailRegex = /(\.[a-zA-Z]{2,})$/
export const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[-!@$%^*])(?=.*[!"$%*,-.\/:;=@^_])[a-zA-Z0-9!"$%*,-.\/:;=@^_]{8,}$/

export enum routes {
	DASHBOARD = "/dashboard",
}

export enum proofRequestState {
	SUCCESS = "success",
	FAILURE = "failure",
	IDLE = "idle",
}

export enum paymentHistoryStates {
	FAILURE = "failure",
	PENDING = "pending"
}

export const phoneNoValidation = /^\+[6-9]\d{11}$/;
export const letterValidation = /[a-zA-Z]/

//Details Modal Popup
export const credentialIssuerImg = '/images/Issuer.png'
export const credentialHolderImg = '/images/Holder.svg'
export const credentialSignatureImg = '/images/CredentialSignature.png'
export const credentialDetailImg = '/images/CredentialDetails.png'
export const greenCheck = "/images/green-check.gif"

//session

export const dashboard = '/dashboard'
export const sessionExcludedPaths = [
	'/en/signIn',
	'/fr/signIn',
	'/pt/signIn',
	'/en/signUp',
	'/fr/signUp',
	'/pt/signUp',
	'/en/verifyEmail',
	'/fr/verifyEmail',
	'/pt/verifyEmail'
]
export const signIn = '/signIn'
export const signInPaths = ['/en/signIn', '/pt/signIn', '/fr/signIn']

export enum Currency {
	INR = 'INR'
}
export interface VerifyTranactionResponse {
	id: string
	createDateTime: string
	orderId: string
	paymentId: string
	amount: string
	currency: string
	receipt: string | null
	status: string
	updatedAt: string
	orgId: string
	threadId: string | null
	userId: string
}


export const TABLE_COLUMNS = [
	{ key: "verification_id", width: "15%" },
	{ key: "user_name", width: "20%" },
	{ key: "schema_name", width: "20%" },
	{ key: "issuer", width: "20%" },
	{ key: "requested_on", width: "18%" },
	{ key: "status", width: "12%" },
	{ key: "action", width: "15%" },
];

export const phoneCodes = [{
	"code": "IN",
	"dialCode": "+91",
	"name": "India"
},]



export const serializationCondition = ['array', 'object']


export const landingPage = 'dashboard'

export const confirmationMessages = {
  deletePendingInvitationConfirmation:
    'Would you like to proceed? Keep in mind that this action cannot be undone.',
  sureConfirmation: 'Yes, I am sure',
  cancelConfirmation: 'No, cancel',
}
