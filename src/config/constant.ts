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
export const dashboardData = `${basePath}/ecosystem/dashboard/summary`
export const ecosystemStatus = `${basePath}/ecosystem/status`
export const updateEcosystemStatusApi = `${basePath}/config/ecosystem`
export const userSessions= `${basePath}/auth/userId:/sessions`
export const deleteSession= `${basePath}/auth/sessionId:/sessions`
//Regx
export const emailRegex = /(\.[a-zA-Z]{2,})$/
export const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[-!@$%^*])(?=.*[!"$%*,-.\/:;=@^_])[a-zA-Z0-9!"$%*,-.\/:;=@^_]{8,}$/

export enum routes {
	DASHBOARD = "/dashboard",
}


//Details Modal Popup
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
export const signInPaths = ['/signIn', '/signIn', '/signIn']

export enum Currency {
	INR = 'INR'
}


export const serializationCondition = ['array', 'object']


export const landingPage = 'dashboard'

export const confirmationMessages = {
  deletePendingInvitationConfirmation:
    'Would you like to proceed? Keep in mind that this action cannot be undone.',
  sureConfirmation: 'Yes, I am sure',
  cancelConfirmation: 'No, cancel',
}
