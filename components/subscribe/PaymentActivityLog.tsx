import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle, ArrowRightLeft, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error" | "process";
}

interface PaymentActivityLogProps {
  status: string;
}

export function PaymentActivityLog({ status }: PaymentActivityLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const addLog = (message: string, type: LogEntry["type"] = "info") => {
      setLogs((prev) => {
        // Deduplicate same status messages to avoid spam
        if (prev.length > 0 && prev[0].message === message) return prev;
        
        return [
          {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
          },
          ...prev,
        ];
      });
    };

    if (status === "pending_payment" || status === "draft") {
      addLog("Listening for deposit transaction...", "process");
    } else if (status === "processing") {
      addLog("Deposit detected! Waiting for confirmations...", "process");
      setTimeout(() => addLog("Bridge channel established via SideShift.", "info"), 1000);
    } else if (status === "paid") {
      addLog("Payment successful! Subscription active.", "success");
      addLog("Invoice settled to merchant.", "info");
    } else if (status === "failed") {
      addLog("Payment failed or expired.", "error");
    }
  }, [status]);

  return (
    <div className="rounded-md border bg-black/90 text-green-400 font-mono text-xs p-3 h-32 flex flex-col">
      <div className="flex items-center justify-between border-b border-green-900/50 pb-1 mb-2">
        <span className="font-bold">ACTIVITY LOG</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <span className="text-green-700">[{log.timestamp}]</span>
              <span className={
                log.type === "error" ? "text-red-400" :
                log.type === "success" ? "text-green-300 font-bold" :
                log.type === "process" ? "text-yellow-300" :
                "text-green-400"
              }>
                {i === 0 && log.type === "process" && (
                  <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
                )}
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <span className="text-green-900 animate-pulse">Initializing secure channel...</span>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
