import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [ecosystemEnabled, setEcosystemEnabled] = useState(true);

  const handleToggle = (checked: boolean) => {
    setEcosystemEnabled(checked);
    toast.success(`Ecosystem ${checked ? "enabled" : "disabled"} successfully`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="text-muted-foreground mt-1 mb-6">Manage settings for ecosystem</p>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Enable/Disable Ecosystem</CardTitle>
              <CardDescription>
                Toggle the ecosystem feature on or off for your organization
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
