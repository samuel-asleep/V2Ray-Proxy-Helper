import { Link, useLocation } from "wouter";
import { LayoutDashboard, Settings, Terminal, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Configuration", icon: Settings },
  { href: "/logs", label: "Server Logs", icon: Terminal },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-full md:w-64 md:h-screen flex-shrink-0 bg-card/50 backdrop-blur-md border-r border-border flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Radio className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight text-white">V2Ray Admin</h1>
          <p className="text-xs text-muted-foreground font-medium">Server Manager</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group overflow-hidden",
                  isActive
                    ? "text-white bg-primary/10 shadow-inner"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <Icon className={cn("w-5 h-5 relative z-10", isActive ? "text-secondary" : "group-hover:text-secondary/80")} />
                <span className="font-medium relative z-10">{item.label}</span>
                
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(6,182,212,0.8)] z-10" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border border-white/5">
          <p className="text-xs text-muted-foreground text-center font-mono">
            v2.1.0-stable
          </p>
        </div>
      </div>
    </div>
  );
}
