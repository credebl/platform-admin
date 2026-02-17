import { PayloadAction, createSlice } from '@reduxjs/toolkit'

interface SessionState {
  token : string,
  refreshToken : string,
  sessionId: string,
}

const initialState: SessionState= {
  token: '',
  refreshToken: '',
  sessionId: '',
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessionToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
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

export const { setSessionToken, setRefreshToken, setSessionId, reset } = sessionSlice.actions
export default sessionSlice.reducer
