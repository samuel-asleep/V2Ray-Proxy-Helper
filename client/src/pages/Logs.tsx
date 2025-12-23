import { Sidebar } from "@/components/Sidebar";
import { useServerLogs } from "@/hooks/use-v2ray";
import { Terminal, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Logs() {
  const { data: logs, isLoading } = useServerLogs();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const copyLogs = () => {
    if (logs?.lines) {
      navigator.clipboard.writeText(logs.lines.join('\n'));
      toast({ title: "Logs Copied", description: "All logs copied to clipboard" });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground overflow-hidden font-body">
      <Sidebar />
      <main className="flex-1 h-screen flex flex-col relative overflow-hidden">
        <div className="p-6 md:p-8 flex-shrink-0 flex justify-between items-center z-10 bg-background/50 backdrop-blur-md border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-primary" />
              System Logs
            </h1>
            <p className="text-sm text-muted-foreground">Real-time output from V2Ray core.</p>
          </div>
          <Button variant="outline" size="sm" onClick={copyLogs} className="border-white/10 hover:bg-white/5">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-hidden relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full rounded-2xl bg-black border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="ml-4 text-xs font-mono text-muted-foreground">bash — v2ray run</div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
            >
              {isLoading ? (
                <div className="text-muted-foreground animate-pulse">Initializing log stream...</div>
              ) : (
                logs?.lines.map((line, i) => (
                  <div key={i} className="break-all whitespace-pre-wrap">
                    <span className="text-zinc-600 mr-3 select-none">{i + 1}</span>
                    <span className={
                      line.includes("warning") ? "text-yellow-400" :
                      line.includes("error") ? "text-red-400" :
                      line.includes("info") ? "text-blue-400" :
                      "text-zinc-300"
                    }>{line}</span>
                  </div>
                ))
              )}
              {logs?.lines.length === 0 && (
                <div className="text-muted-foreground italic">No logs available yet.</div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
