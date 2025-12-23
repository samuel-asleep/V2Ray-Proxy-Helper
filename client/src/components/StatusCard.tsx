import { useServerStatus, useRestartServer } from "@/hooks/use-v2ray";
import { Activity, Power, RefreshCw, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function StatusCard() {
  const { data: status, isLoading, refetch } = useServerStatus();
  const { mutate: restart, isPending: isRestarting } = useRestartServer();
  const { toast } = useToast();

  const handleRestart = () => {
    restart(undefined, {
      onSuccess: () => {
        toast({
          title: "Server Restarted",
          description: "V2Ray service has been restarted successfully.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Restart Failed",
          description: "Could not restart the service.",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="h-48 rounded-2xl bg-card/50 animate-pulse border border-white/5" />
    );
  }

  const isRunning = status?.running ?? false;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-white mb-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" />
            System Status
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isRunning 
                ? "bg-green-500/10 border-green-500/20 text-green-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              <span className="text-sm font-medium">{isRunning ? "Service Running" : "Service Stopped"}</span>
            </div>
            
            {status?.uptime && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-muted-foreground text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>Uptime: {Math.floor(status.uptime / 60)}m</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="border-white/10 hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            disabled={isRestarting}
            onClick={handleRestart}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Power className={`w-4 h-4 mr-2 ${isRestarting ? "animate-spin" : ""}`} />
            {isRestarting ? "Restarting..." : "Restart Service"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
