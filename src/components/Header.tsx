"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avtar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useEffect, useState } from "react";
import { getRequest, postRequest } from "@/config/apiCalls";
import { getUserProfileApi, landingPage, signOutApi } from "@/config/constant";
import {
  isOrgLoaded,
  resetSelectedOrganization,
} from "@/lib/organizationSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import AppLauncher from "./appLauncher";
import { Button } from "./ui/button";
import Image from "next/image";
import LocaleSwitcher from "./LocaleSwitcher";
import OrgSwitcher from "./OrgSwitcher";
import { UseBreadcrumb } from "./ui/breadcrumb";
import { persistor } from "@/lib/store";
import { reset } from "@/lib/verifierSlice";
import { setLoggedInUser } from "@/lib/userSlice";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

// import { useSession } from "next-auth/react";

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  profileImg?: string;
  userOrgRoles: UserOrgRole[];
}

interface UserOrgRole {
  organisation: Organisation | null;
}

interface Organisation {
  logoUrl: string;
}

const Header = (): React.JSX.Element => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>();
  const verifierToken = useAppSelector((state) => state.verifier.verifierToken);

  const selectedOrg = useAppSelector(
    (state) => state.organization.selectedOrganization
  );

  const dispatch = useAppDispatch();
  const router = useRouter();
  const sessionId = useAppSelector((state) => state.verifier.sessionId)

  // const { data: session } = useSession();

  useEffect(() => {
    if (verifierToken) {
      const apiUrl = getUserProfileApi;
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifierToken}`,
        },
      };

      getRequest(apiUrl, {}, config.headers)
        .then((response) => {
          if (response && response.data) {
            const userData: UserProfile = response.data.data;
            const { id, email, firstName, lastName, profileImg } =
              response.data.data;
            const userDetails = {
              userId: id,
              userEmail: email,
              lastName,
              firstName,
            };
            console.log("userDetails",userDetails)
            setUserProfile(userData);
            if (id) {
              dispatch(setLoggedInUser(userDetails));
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        });
    }
  }, [verifierToken]);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // const handleLogout = async (): Promise<void> => {
  //   await persistor.flush();
  //   persistor.purge();
  //   dispatch(reset());
  //   dispatch(resetSelectedOrganization());
  //   dispatch(isOrgLoaded(false));
  //   router.push("/signIn");
  // };
  const handleLogout = async (): Promise<void> => {
    try {
      // Note : need to discuss when screen is ideal and token expired itself below API throw 401
      // so because of this session will not deleted from database
      const payload = {
        sessions: [sessionId],
      };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${verifierToken}`,
        },
      };
      await postRequest(signOutApi, payload, config);
      const rootKey = "persist:root";

      if (localStorage.getItem(rootKey)) {
        localStorage.removeItem(rootKey);

        const interval = setInterval(async () => {
          if (!localStorage.getItem(rootKey)) {
            clearInterval(interval);
            const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${landingPage}`;
            await signOut({
              callbackUrl: `${
                process.env.NEXT_PUBLIC_CREDEBL_UI_PATH
              }/sign-in?redirectTo=${encodeURIComponent(
                redirectUrl
              )}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
            });
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed in logged out", error);
      const rootKey = "persist:root";
      if (localStorage.getItem(rootKey)) {
        localStorage.removeItem(rootKey);

        const interval = setInterval(async () => {
          if (!localStorage.getItem(rootKey)) {
            clearInterval(interval);
            const redirectUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${landingPage}`;
            await signOut({
              callbackUrl: `${
                process.env.NEXT_PUBLIC_CREDEBL_UI_PATH
              }/sign-in?redirectTo=${encodeURIComponent(
                redirectUrl
              )}&clientAlias=${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
            });
          }
        }, 100);
      }
    }
  };

  return (
    <>
      <nav className="fixed z-20 w-full lg:pl-60 bg-whiteColor">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 pt-5 bg-white">
          <div className="flex items-center">
            <Button
              onClick={toggleSidebar}
              className="rounded-md bg-gray-200 p-2 lg:hidden"
            >
              <Image
                src={"/images/Hamburger menu icon.svg"}
                alt={"toggle"}
                width={24}
                height={24}
              />
            </Button>
            <div className="flex items-center ml-6">
              <div className="flex items-center h-full pt-4">
                <UseBreadcrumb />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    {userProfile?.profileImg ? (
                      <AvatarImage
                        src={userProfile.profileImg}
                        alt={`${userProfile.firstName}'s profile picture`}
                      />
                    ) : (
                      <AvatarFallback className="text-md">
                        {userProfile?.firstName?.[0]?.toUpperCase() ?? ""}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 border">
                <DropdownMenuLabel><div>
                           <div> {userProfile?.firstName} </div>
                          <div> <b>{userProfile?.email}</b></div>
                        </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={()=> router.push("/settings")}>
                          Settings 
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                           Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
