import { useState } from "react";
import { AgentConfiguration, defaultAgentConfig } from "../types/agentConfig";
import { initialPipelineData } from "../data/pipelineData";
import { AgentConfigForm } from "./AgentConfigForm";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Search, Edit, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AgentConfigurationSettingsProps {
  embedded?: boolean;
}

export function AgentConfigurationSettings({ embedded = false }: AgentConfigurationSettingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentConfigs, setAgentConfigs] = useState<Record<string, AgentConfiguration>>({});

  // Get all agents from pipeline data
  const allAgents = initialPipelineData.phases.flatMap((phase) =>
    phase.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      phaseId: phase.id,
      phaseName: phase.name,
    }))
  );

  const filteredAgents = allAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAgentConfig = (agentId: string, agentName: string): AgentConfiguration => {
    if (agentConfigs[agentId]) {
      return agentConfigs[agentId];
    }

    // Return default config
    return {
      agentId,
      agentName,
      role: agentName.replace(" Agent", ""),
      ...defaultAgentConfig,
    };
  };

  const handleSaveConfig = (config: AgentConfiguration) => {
    setAgentConfigs((prev) => ({
      ...prev,
      [config.agentId]: config,
    }));
    setSelectedAgentId(null);
    toast.success(`Configuration saved for ${config.agentName}`);
  };

  const selectedAgent = allAgents.find((a) => a.id === selectedAgentId);

  return (
    <div className="h-full min-h-0">
      {!selectedAgentId ? (
        <div className="flex h-full min-h-0 flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Agent List */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-6">
              {/* Group by phase */}
              {Array.from(new Set(filteredAgents.map((a) => a.phaseId))).map((phaseId) => {
                const phaseAgents = filteredAgents.filter((a) => a.phaseId === phaseId);
                if (phaseAgents.length === 0) return null;

                const phaseName = phaseAgents[0].phaseName;

                return (
                  <div key={phaseId}>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        PHASE {phaseId}
                      </Badge>
                      {phaseName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phaseAgents.map((agent) => {
                        const hasConfig = !!agentConfigs[agent.id];
                        return (
                          <Card
                            key={agent.id}
                            className="group hover:border-primary/50 transition-all cursor-pointer"
                            onClick={() => setSelectedAgentId(agent.id)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {agent.id}
                                    </Badge>
                                    {hasConfig && (
                                      <CheckCircle2 className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <CardTitle className="text-base">{agent.name}</CardTitle>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAgentId(agent.id);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="text-xs text-muted-foreground">
                                {hasConfig ? "Custom configuration" : "Using default configuration"}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Configure {selectedAgent?.name}</h3>
              <p className="text-sm text-muted-foreground">
                Phase {selectedAgent?.phaseId} • {selectedAgent?.phaseName}
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedAgentId(null)}>
              Back to List
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <AgentConfigForm
              config={getAgentConfig(selectedAgentId, selectedAgent?.name || "")}
              onSave={handleSaveConfig}
            />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
