import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface VerfierState {
  verifierToken : string,
  refreshToken : string,
  sessionId: string,
}

const initialState: VerfierState = {
  verifierToken: '',
  refreshToken: '',
  sessionId: '',
}

const verifierSlice = createSlice({
  name: 'verifier',
  initialState,
  reducers: {
    setVerifierToken: (state, action: PayloadAction<string>) => {
      state.verifierToken = action.payload
    },

    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload
    },

    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload
    },
    
    reset: () => initialState,
  },
})

export const { setVerifierToken, setRefreshToken, setSessionId, reset } = verifierSlice.actions
export default verifierSlice.reducer