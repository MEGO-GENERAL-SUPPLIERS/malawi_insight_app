// components/ServerNetworkIndicator.tsx
import React, { useEffect, useState } from "react";
import {
  WifiOffIcon,
  WifiLowIcon,
  WifiHighIcon,
  WifiIcon,
  DatabaseZapIcon,
  GlobeLockIcon,
  PlaneIcon,
  ArrowUpDownIcon,
  ServerCrashIcon,
} from "lucide-react";
import { checkHealthAsync } from "~/services/healthCheckService";

const StatusColor = {
  airplane: "text-red-500",
  adapterOff: "text-red-500",
  disconnected: "text-red-500",
  noInternet: "text-orange-500",
  offline: "text-red-500",
  weak: "text-red-500",
  slow: "text-orange-500",
  fair: "text-cyan-300",
  average: "text-cyan-400",
  good: "text-green-500",
  excellent: "text-green-600",
  serverDown: "text-red-500",
  serverUp: "text-green-600",
  databaseDown: "text-red-500",
  databaseUp: "text-green-600",

  // blinking states
  networkChecking: "animate-pulse text-orange-400 data-[alt=true]:text-orange-700",
  serverChecking: "animate-pulse text-orange-400 data-[alt=true]:text-orange-500",
  databaseChecking: "animate-pulse text-orange-400 data-[alt=true]:text-orange-500",
} as const;

const StatusText: Record<string, string> = {
  airplane: "Airplane Mode",
  adapterOff: "Network Adapter Off",
  disconnected: "Not connected to any network",
  offline: "Offline (No network connection)",
  noInternet: "No Internet Access",
  weak: "Weak Connection",
  slow: "Slow Connection",
  fair: "Fair Connection",
  average: "Average Connection",
  good: "Good Connection",
  excellent: "Excellent Connection",
  checking: "Checking...",
};

type NetworkStrength =
  | "airplane"
  | "adapterOff"
  | "disconnected"
  | "offline"
  | "noInternet"
  | "weak"
  | "slow"
  | "fair"
  | "average"
  | "good"
  | "excellent"
  | "checking";

interface Status {
  network: NetworkStrength;
  server: boolean | "checking";
  database: boolean | "checking";
}

interface Props {
  showNetworkIndicator?: boolean;
  showServerIndicator?: boolean;
  showDatabaseIndicator?: boolean;
}

const ServerNetworkIndicator: React.FC<Props> = ({
  showNetworkIndicator = true,
  showServerIndicator = false,
  showDatabaseIndicator = false,
}) => {
  const [status, setStatus] = useState<Status>({
    network: "offline",
    server: "checking",
    database: "checking",
  });

  const [blinkAlt, setBlinkAlt] = useState(false); // network fast blink
  const [blinkAltSlow, setBlinkAltSlow] = useState(false); // server/db slow blink

  // fast toggle (network - 0.6s)
  useEffect(() => {
    if (status.network === "checking") {
      const timer = setInterval(() => setBlinkAlt(prev => !prev), 600);
      return () => clearInterval(timer);
    }
  }, [status.network]);

  // slow toggle (server/db - 15s)
  useEffect(() => {
    if (status.server === "checking" || status.database === "checking") {
      const timer = setInterval(() => setBlinkAltSlow(prev => !prev), 5000);
      return () => clearInterval(timer);
    }
  }, [status.server, status.database]);

  const getRetryInterval = (): number => {
    const retry = localStorage.getItem("network.retry");
    const retryNum = retry ? parseInt(retry, 10) : 3000;
    return isNaN(retryNum) ? 3000 : retryNum;
  };

  const detectAdapterStatus = (): NetworkStrength | null => {
    const conn = (navigator as any).connection || {};
    if (!navigator.onLine) {
      if (conn.type === "none") return "airplane";
      if (conn.type === "wifi" || conn.type === "ethernet") return "disconnected";
      return "adapterOff";
    }
    return null;
  };

  const checkLatency = async (): Promise<NetworkStrength> => {
    const url = "https://www.google.com/favicon.ico";
    const start = performance.now();
    try {
      await fetch(url, { mode: "no-cors" });
      const latency = performance.now() - start;

      if (latency < 100) return "excellent";
      if (latency < 200) return "good";
      if (latency < 400) return "average";
      if (latency < 600) return "fair";
      if (latency < 1000) return "slow";
      return "weak";
    } catch {
      return "noInternet";
    }
  };

  const fetchStatus = async () => {
    const adapterState = detectAdapterStatus();
    if (adapterState) {
      setStatus({ network: adapterState, server: false, database: false });
      return;
    }

    setStatus(prev => ({
      ...prev,
      network: "checking",
      server: "checking",
      database: "checking",
    }));

    const netStrength = await checkLatency();
    const healthResponse = await checkHealthAsync();
    console.log("fetchAsync", healthResponse);
    const health = healthResponse.data;

    setStatus({
      network: netStrength,
      server: !!health?.serverAvailable,
      database: !!health?.databaseStatus,
    });
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, getRetryInterval());
    window.addEventListener("online", fetchStatus);
    window.addEventListener("offline", fetchStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", fetchStatus);
      window.removeEventListener("offline", fetchStatus);
    };
  }, []);

  const renderNetworkIcon = () => {
    if (status.network === "checking") {
      return (
        <WifiIcon
          className={`w-5 h-5 ${StatusColor.networkChecking}`}
          data-alt={blinkAlt}
        />
      );
    }

    const networkColor = StatusColor[status.network] || StatusColor.offline;

    if (status.network === "airplane") return <PlaneIcon className={`w-5 h-5 ${networkColor}`} />;
    if (status.network === "adapterOff") return <GlobeLockIcon className={`w-5 h-5 ${networkColor}`} />;
    if (status.network === "disconnected" || status.network === "noInternet")
      return <WifiOffIcon className={`w-5 h-5 ${networkColor}`} />;

    switch (status.network) {
      case "weak":
      case "slow":
        return <WifiLowIcon className={`w-5 h-5 ${networkColor}`} />;
      case "fair":
      case "average":
        return <WifiHighIcon className={`w-5 h-5 ${networkColor}`} />;
      case "good":
      case "excellent":
        return <WifiIcon className={`w-5 h-5 ${networkColor}`} />;
      default:
        return <WifiOffIcon className={`w-5 h-5 ${networkColor}`} />;
    }
  };

  const renderServerIcon = () => {
    if (status.server === "checking") {
      return (
        <ServerCrashIcon
          className={`w-5 h-5 ${StatusColor.serverChecking}`}
          data-alt={blinkAltSlow}
        />
      );
    }
    return status.server ? (
      <ArrowUpDownIcon className={`w-5 h-5 ${StatusColor.serverUp}`} />
    ) : (
      <ServerCrashIcon className={`w-5 h-5 ${StatusColor.serverDown}`} />
    );
  };

  const renderDatabaseIcon = () => {
    if (status.database === "checking") {
      return (
        <DatabaseZapIcon
          className={`w-5 h-5 ${StatusColor.databaseChecking}`}
          data-alt={blinkAltSlow}
        />
      );
    }
    return status.database ? (
      <DatabaseZapIcon className={`w-5 h-5 ${StatusColor.databaseUp}`} />
    ) : (
      <DatabaseZapIcon className={`w-5 h-5 ${StatusColor.databaseDown}`} />
    );
  };

  return (
    <div className="flex items-center space-x-3 overflow-hidden">
      {showNetworkIndicator && (
        <div className="relative flex-shrink-0 group">
          {renderNetworkIcon()}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 whitespace-nowrap">
            {StatusText[status.network]}
          </span>
        </div>
      )}

      {showServerIndicator && (
        <div className="relative flex-shrink-0 group">
          {renderServerIcon()}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 whitespace-nowrap">
            Server: {status.server === true ? "Online" : "Offline"}
          </span>
        </div>
      )}

      {showDatabaseIndicator && (
        <div className="relative flex-shrink-0 group">
          {renderDatabaseIcon()}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 whitespace-nowrap">
            Database: {status.database === true ? "Online" : "Offline"}
          </span>
        </div>
      )}
    </div>
  );
};

export default ServerNetworkIndicator;
