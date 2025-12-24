import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import fs from "fs/promises";
import path from "path";
import { type ServerConfig } from "@shared/schema";

export class V2RayManager {
  private process: ChildProcessWithoutNullStreams | null = null;
  private logs: string[] = [];
  private readonly configPath = path.join(process.cwd(), "v2ray_config.json");
  private readonly MAX_LOGS = 100;

  async start(config: ServerConfig) {
    if (this.process) {
      this.stop();
    }

    if (!config.isRunning) {
      this.log("Server is disabled in configuration.");
      return;
    }

    // Generate config file
    const v2rayConfig = {
      log: {
        loglevel: "info",
      },
      inbounds: [
        {
          port: config.port,
          listen: "0.0.0.0",
          protocol: "vmess",
          settings: {
            clients: [
              {
                id: config.uuid,
                alterId: 0,
              },
            ],
          },
          streamSettings: {
            network: "ws",
            wsSettings: {
              path: config.path,
            },
          },
        },
      ],
      outbounds: [
        {
          protocol: "freedom",
          settings: {},
        },
      ],
    };

    await fs.writeFile(this.configPath, JSON.stringify(v2rayConfig, null, 2));

    this.log("Starting V2Ray with config: " + JSON.stringify(v2rayConfig, null, 2));

    try {
      // Find v2ray executable. Assuming it's in PATH or standard location.
      // Nix usually puts it in PATH.
      this.process = spawn("v2ray", ["run", "-c", this.configPath]);

      this.process.stdout.on("data", (data) => {
        this.log(`[STDOUT] ${data.toString().trim()}`);
      });

      this.process.stderr.on("data", (data) => {
        this.log(`[STDERR] ${data.toString().trim()}`);
      });

      this.process.on("close", (code) => {
        this.log(`V2Ray process exited with code ${code}`);
        this.process = null;
      });

      this.process.on("error", (err) => {
        this.log(`Failed to start V2Ray: ${err.message}`);
      });

    } catch (error: any) {
        this.log(`Error starting V2Ray: ${error.message}`);
    }
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.log("V2Ray process stopped.");
    }
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
    // Also log to console for debugging
    console.log(`[V2Ray] ${message}`);
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  isRunning(): boolean {
    return this.process !== null;
  }
}

export const v2ray = new V2RayManager();
