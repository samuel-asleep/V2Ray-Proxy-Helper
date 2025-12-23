import { Sidebar } from "@/components/Sidebar";
import { useServerConfig, useUpdateConfig } from "@/hooks/use-v2ray";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServerConfigSchema, type InsertServerConfig } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RefreshCw, Wand2, Shield, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Settings() {
  const { data: config, isLoading } = useServerConfig();
  const { mutate: updateConfig, isPending } = useUpdateConfig();
  const { toast } = useToast();

  const form = useForm<InsertServerConfig>({
    resolver: zodResolver(insertServerConfigSchema),
    defaultValues: {
      uuid: "",
      path: "/vmess",
      sni: "",
      port: 10000,
    },
    values: config ? {
      uuid: config.uuid,
      path: config.path,
      sni: config.sni || "",
      port: config.port,
    } : undefined,
  });

  const onSubmit = (data: InsertServerConfig) => {
    updateConfig(data, {
      onSuccess: () => {
        toast({
          title: "Configuration Saved",
          description: "Server config updated. Service is restarting...",
        });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      }
    });
  };

  const generateUUID = () => {
    const uuid = crypto.randomUUID();
    form.setValue("uuid", uuid);
    toast({ description: "New UUID generated" });
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground overflow-hidden font-body">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-display font-bold text-white mb-2">Configuration</h1>
            <p className="text-muted-foreground">Manage core server settings and routing protocols.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-panel border-0 ring-1 ring-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Core Settings
                </CardTitle>
                <CardDescription>
                  Changing these values will restart the V2Ray service automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <FormField
                      control={form.control}
                      name="uuid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">User ID (UUID)</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input {...field} className="font-mono bg-black/20 border-white/10 focus:border-primary/50 transition-colors" />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="secondary" 
                              onClick={generateUUID}
                              className="shrink-0 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20"
                            >
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate
                            </Button>
                          </div>
                          <FormDescription>Authentication ID for clients.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="path"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">WebSocket Path</FormLabel>
                            <FormControl>
                              <Input {...field} className="font-mono bg-black/20 border-white/10 focus:border-primary/50" />
                            </FormControl>
                            <FormDescription>e.g., /vmess (Must start with /)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sni"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">SNI / Spoof Host</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ''} 
                                placeholder={window.location.hostname} 
                                className="font-mono bg-black/20 border-white/10 focus:border-primary/50" 
                              />
                            </FormControl>
                            <FormDescription>Optional. Domain to spoof in TLS header.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/90 text-white min-w-[150px] shadow-lg shadow-primary/25"
                      >
                        {isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Configuration
                          </>
                        )}
                      </Button>
                    </div>

                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
