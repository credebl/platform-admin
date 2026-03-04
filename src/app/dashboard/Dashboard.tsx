'use client'
import { useEffect, useState, type ReactElement } from "react"

import { Globe, Mail, Building2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getRequest } from "@/config/apiCalls";
import { dashboardData } from "@/config/constant";


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
  async function fetchDashboardDetails(): Promise<void> {
      try{
         const data = await getRequest(dashboardData)
         console.log("data",data)
         if (data?.data.data) {
          setCardData(data?.data.data)
         }
      } catch {
         console.log('failed to fetch dashboard details')
      }
   }

   useEffect(()=> {
      fetchDashboardDetails()
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
            {stats.map(({ title, value, icon: Icon }, index) => (
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
