'use client'
import { useEffect, useState } from "react"

import { Globe, Mail, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getRequest } from "@/config/apiCalls";
import { dashboardData, ecosystemStatus } from "@/config/constant";
import { useDispatch } from "react-redux";
import { setEcosystemEnableStatus } from "@/lib/ecosystemSlice";


export default function Dashboard() {
  const [cardData, setCardData] = useState({
   ecosystem: 0,
   invitations: 0,
   activeOrgs: 0
   })

   const stats = [
      { title: "Ecosystems", value: cardData.ecosystem, icon: Globe },
      { title: "Invitations Sent", value: cardData.invitations, icon: Mail },
      { title: "Active Organizations", value: cardData.activeOrgs, icon: Building2 }
   ];

   const dispatch = useDispatch()

  async function fetchDashboardDetails(): Promise<void> {
      try{
         const data = await getRequest(dashboardData)
         if (data?.data.data) {
          setCardData(data?.data.data)
         }
      } catch {
         console.error('failed to fetch dashboard details')
      }
   }


  const fetchEcosystemStatus = async ():Promise<void>=>{ 
      try{
        const response = await getRequest(ecosystemStatus)
        if (response) {
            dispatch(setEcosystemEnableStatus(response.data.data))
        }
      }catch(error){
        console.error("failed to fetch ecosystem status",error)
      }
   }

   useEffect(()=> {
   },[])

   useEffect(()=> {
      fetchDashboardDetails()
      fetchEcosystemStatus()
   },[])

   return (
      <div className="space-y-6 mx-6">
         <div>
            <h1 className="text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground mt-1">
               Monitor your ecosystem platform at a glance
            </p>
         </div>

         <div className="flex sm:flex justify-between gap-6">
            {stats.map(({ title, value, icon: Icon }) => (
               <Card
                  key={title}
                  className="shadow grow"
               >
                  <CardContent className="flex cursor-default items-center justify-between p-6">
                     <div>
                        <p className="font-medium">{title}</p>
                        <h3 className="mt-2 text-4xl font-bold">
                           {value}
                        </h3>
                     </div>
                     <div className="opacity-30">
                        <Icon className="w-10 h-10" />
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>
   );
}
