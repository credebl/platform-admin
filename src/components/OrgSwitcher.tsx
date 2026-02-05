import React, { useEffect, useState } from "react";
import { isOrgLoaded, setSelectedOrganization } from "@/lib/organizationSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { OrgAgentdetails } from "@/utils/common.interfaces";
import OrgSwitcherSelect from "./OrgSwitcherSelect";
import { getOrganizationListApi } from "@/config/constant";
import { getRequest } from "@/config/apiCalls";

interface Organization {
  id: string;
  name: string;
  logoUrl: string
  org_agents: OrgAgentdetails[] | []
  appLaunchDetails?:[{}]
}

const OrgSwitcher = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.verifier.verifierToken);
  
  const selectedOrganizationState = useAppSelector(
    (state) => state.organization.selectedOrganization
  );

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    const getOrganizations = async () => {
      if (!accessToken) return;
      dispatch(isOrgLoaded(false))
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const response = await getRequest(getOrganizationListApi, {}, config.headers);

        const orgs = response?.data?.data?.organizations || [];
        setOrganizations(orgs);
        // Set first organization as default if none is selected
        if (orgs.length > 0 && !selectedOrganizationState) {
          const organizationDetails = {
            orgId: orgs[0].id,
            orgName: orgs[0].name,
            orgLogo: orgs[0].logoUrl ? orgs[0].logoUrl : '',
            orgAgent: orgs[0].org_agents,
            appLaunchDetails: orgs[0].appLaunchDetails
          }
          dispatch(setSelectedOrganization(organizationDetails));
          setSelectedOrg(orgs[0]);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        dispatch(isOrgLoaded(true))
      }
    };

    getOrganizations();
  }, [accessToken, dispatch, selectedOrganizationState]);

  useEffect(() => {
    if (selectedOrganizationState) {
      const foundOrg = organizations.find((org) => org.id === selectedOrganizationState.orgId) || null;
      setSelectedOrg(foundOrg);
    }
  }, [selectedOrganizationState, organizations]);

  const handleSelect = (orgId: string) => {

    const foundOrg = organizations.find((org) => org.id === orgId) || null;
    if (foundOrg) {
      const organizationDetails = {
        orgId: foundOrg.id,
        orgName: foundOrg.name,
        orgLogo: foundOrg.logoUrl ? foundOrg.logoUrl : '',
        orgAgent: foundOrg.org_agents,
        appLaunchDetails: foundOrg.appLaunchDetails
      }
      dispatch(setSelectedOrganization(organizationDetails));
      setSelectedOrg(foundOrg);
    }
  };

  return (
      <OrgSwitcherSelect
        selectedOrg={selectedOrg}
        organizations={organizations}
        onSelectChange={handleSelect}
      />
  );
};

export default OrgSwitcher;