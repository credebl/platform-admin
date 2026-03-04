import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserDetails {
    userId: string;
    userEmail: string;
    firstName: string;
    lastName: string;
}
interface UserState {
    userDetails: UserDetails | null;
}

const initialState: UserState = {
  userDetails: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoggedInUser: (state, action: PayloadAction<UserDetails>) => {
      state.userDetails = action.payload;
    },
  },
});

export const { setLoggedInUser } = userSlice.actions;
export default userSlice.reducer;
