'use client'
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, CheckCircle2, XCircle } from "lucide-react";
import { getRequest, putRequest } from "@/config/apiCalls";
import { ecosystemStatus, updateEcosystemStatusApi } from "@/config/constant";
import { HttpStatusCode } from "axios";

const Settings = () => {
  const [ecosystemEnabled, setEcosystemEnabled] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  async function updateEcosystemStatus(checked: boolean):Promise<void>{
      try{
        const response = await putRequest(updateEcosystemStatusApi,{ isEcosystemEnabled: checked })
        console.log("response",response)
        if (response && response.status === HttpStatusCode.Ok) {
           setEcosystemEnabled(checked);
           setAlertType("success");
           setAlertMessage(`Ecosystem ${checked ? "enabled" : "disabled"} successfully`);
           setTimeout(() => setAlertMessage(null), 3000);
        }
      }catch(error){
        console.error("failed to fetch ecosystem status",error)
        setAlertType("error");
        setAlertMessage(`Error updating status for ecosystem: ${error}`);
      }
  }

  const handleToggle = (checked: boolean) => {
    updateEcosystemStatus(checked)
  };

  const fetchEcosystemStatus = async ():Promise<void>=>{ 
      try{
        const response = await getRequest(ecosystemStatus)
        console.log("response",response)
        if (response) {
            setEcosystemEnabled(response.data.data)
        }
      }catch(error){
        console.error("failed to fetch ecosystem status",error)
      }
   }

   useEffect(()=> {
    fetchEcosystemStatus()
   },[])

  return (
    <div className="mx-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="text-muted-foreground mt-1 mb-6">Manage settings for ecosystem</p>

      {alertMessage && (
        <Alert variant={alertType === "success" ? "default" : "destructive"} className="mb-6">
          {alertType === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Enable/Disable Ecosystem</CardTitle>
              <CardDescription>
                Toggle the ecosystem feature on or off for your organizations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="ecosystem-toggle" className="text-sm font-medium">
                Ecosystem is {ecosystemEnabled ? "enabled" : "disabled"}
              </Label>
              <span className="text-xs text-muted-foreground">
                {ecosystemEnabled
                  ? "Members can access and interact with the ecosystem"
                  : "Ecosystem access is currently turned off"}
              </span>
            </div>
            <Switch
              id="ecosystem-toggle"
              checked={ecosystemEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
