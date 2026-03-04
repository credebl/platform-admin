import { PayloadAction, createSlice } from "@reduxjs/toolkit";


interface SelectedOrgnization{
  orgId: string;
  orgName: string;
  orgLogo: string;
  appLaunchDetails?:[{}]
}
interface OrganizationState {
  selectedOrganization: SelectedOrgnization | null;
  isOrgLoaded:boolean
}

const initialState: OrganizationState = {
  selectedOrganization: null,
  isOrgLoaded:false
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setSelectedOrganization: (state, action: PayloadAction<SelectedOrgnization>) => {
      state.selectedOrganization = action.payload;
    },
    resetSelectedOrganization: (state) => {
      state.selectedOrganization = null;
    },
    isOrgLoaded:(state,action: PayloadAction<boolean>)=>{
      state.isOrgLoaded = action.payload
    }
  },
});

export const { setSelectedOrganization, resetSelectedOrganization, isOrgLoaded } = organizationSlice.actions;
export default organizationSlice.reducer;
