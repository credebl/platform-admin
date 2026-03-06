import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Ecosystem {
   ecosystemEnableStatus: boolean
}

const initialState: Ecosystem = {
  ecosystemEnableStatus: false,
};

const ecosystemSlice = createSlice({
  name: "ecosystem",
  initialState,
  reducers: {
    setEcosystemEnableStatus: (state, action: PayloadAction<boolean>) => {
      state.ecosystemEnableStatus = action.payload;
    },
  },
});

export const { setEcosystemEnableStatus } = ecosystemSlice.actions;
export default ecosystemSlice.reducer;
