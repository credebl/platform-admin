import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserRegistartionDetails {
    userEmail: string;
    firstName?: string;
    lastName?: string;
}
interface UserRegistartionState {
    userRegistartionDetails: UserRegistartionDetails | null;
}
const initialState: UserRegistartionState = {
    userRegistartionDetails: null,
  };
const userRegistrationSlice = createSlice({
    name: "userRegistartion",
    initialState,
    reducers: {
      setRegistartionDetails: (state, action: PayloadAction<UserRegistartionDetails>) => {
        state.userRegistartionDetails = action.payload;
      },
    },
  });

  export const {setRegistartionDetails}=userRegistrationSlice.actions
  export default userRegistrationSlice.reducer
