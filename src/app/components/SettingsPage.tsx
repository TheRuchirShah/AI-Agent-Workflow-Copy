import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AgentConfigurationSettings } from "./AgentConfigurationSettings";
import { GeneralSettings } from "./GeneralSettings";

interface SettingsPageProps {
  onBack: () => void;
  backLabel: string;
}

export function SettingsPage({ onBack, backLabel }: SettingsPageProps) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col items-start px-4 py-3 sm:py-4">
          <div className="min-w-0">
            <h1 className="font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage pipeline configuration, agents, and preferences
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex min-h-0 flex-1 flex-col px-4 py-6">
        <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
          <div className="mb-2">
            <Button variant="ghost" onClick={onBack} className="-ml-2 h-7 w-fit justify-start gap-1 px-2 text-sm font-normal text-muted-foreground hover:text-foreground" aria-label={backLabel}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </div>
          <div className="mb-4 w-full shrink-0 overflow-x-auto border-b border-border">
            <TabsList className="h-auto w-max min-w-full justify-start gap-6 rounded-none bg-transparent p-0 text-muted-foreground sm:min-w-0">
              <TabsTrigger
                value="general"
                className="h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-1 py-3 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="agents"
                className="h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-1 py-3 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                Agents Configuration
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-1 py-3 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-1 py-3 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                Integrations
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <TabsContent value="general" className="m-0 h-full min-h-0">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="agents" className="m-0 h-full min-h-0 overflow-hidden">
              <AgentConfigurationSettings embedded />
            </TabsContent>

            <TabsContent value="notifications" className="m-0 h-full min-h-0">
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                Notification settings coming soon...
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="m-0 h-full min-h-0">
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                Integration settings coming soon...
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
