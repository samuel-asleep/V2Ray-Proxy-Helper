import { useServerConfig } from "@/hooks/use-v2ray";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Eye, EyeOff, ShieldCheck, Share2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";

export function VmessGenerator() {
  const { data: config, isLoading } = useServerConfig();
  const { toast } = useToast();
  const [showConfig, setShowConfig] = useState(false);

  if (isLoading || !config) return <div className="h-96 rounded-2xl bg-card/50 animate-pulse border border-white/5" />;

  // VMess Logic
  const host = window.location.hostname;
  // Use the configured SNI if available, otherwise fallback to hostname
  const sni = config.sni || host;
  
  const vmessConfig = {
    v: "2",
    ps: `Replit-V2Ray-${host.split('.')[0]}`,
    add: host,
    port: "443",
    id: config.uuid,
    aid: "0",
    scy: "auto",
    net: "ws",
    type: "none",
    host: sni,
    path: config.path,
    tls: "tls",
    sni: sni,
  };

  const vmessLink = `vmess://${btoa(JSON.stringify(vmessConfig))}`;
  
  // HTTP Custom Config Snippet
  const httpCustomPayload = `GET ${config.path} HTTP/1.1[crlf]Host: ${sni}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]User-Agent: okhttp/3.11[crlf][crlf]`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* VMess Link Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-6 flex flex-col h-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Connection
          </h2>
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary-foreground">
            TLS + WebSocket
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 py-4">
          <div className="p-4 bg-white rounded-xl shadow-2xl shadow-white/5 mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-secondary/50 rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10" />
            <QRCodeSVG 
              value={vmessLink} 
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
            Scan with V2RayNG, Shadowrocket, or any compatible client.
          </p>

          <div className="w-full space-y-3">
            <Button 
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
              onClick={() => copyToClipboard(vmessLink, "VMess Link")}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy VMess Link
            </Button>
            
            <Button 
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5 hover:text-white"
              onClick={() => setShowConfig(!showConfig)}
            >
              {showConfig ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showConfig ? "Hide Details" : "Show Details"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Configuration Details Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-6 flex flex-col h-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            Client Config
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            {sni}
          </div>
        </div>

        <div className="space-y-6 flex-1">
          {/* Snippet Block */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              HTTP Custom / Injector Payload
            </label>
            <div className="relative group">
              <pre className="p-4 rounded-xl bg-black/50 border border-white/5 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap break-all shadow-inner">
                {httpCustomPayload}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-white bg-black/50 hover:bg-black/80"
                onClick={() => copyToClipboard(httpCustomPayload, "Payload")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Address / Host</label>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-sm font-mono truncate">
                {host}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Port</label>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-sm font-mono">
                443
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Path</label>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-sm font-mono truncate">
                {config.path}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">SNI / Bug Host</label>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-sm font-mono truncate text-secondary">
                {sni}
              </div>
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-muted-foreground">UUID</label>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-xs font-mono break-all flex justify-between items-center group">
                <span className={showConfig ? "" : "blur-sm transition-all"}>{config.uuid}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(config.uuid, "UUID")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
