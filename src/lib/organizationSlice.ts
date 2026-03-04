import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { OrgAgentdetails } from "@/utils/common.interfaces";

interface SelectedOrgnization{
  orgId: string;
  orgName: string;
  orgLogo: string;
  orgAgent: OrgAgentdetails[]|[];
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
