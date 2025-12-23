import { Sidebar } from "@/components/Sidebar";
import { StatusCard } from "@/components/StatusCard";
import { VmessGenerator } from "@/components/VmessGenerator";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground overflow-hidden font-body">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white glow-text">Dashboard</h1>
            <p className="text-muted-foreground">Monitor connection status and client configuration.</p>
          </motion.div>

          <StatusCard />
          <VmessGenerator />
        </div>
      </main>
    </div>
  );
}
