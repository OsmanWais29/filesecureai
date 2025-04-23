
import { useState, useCallback, useEffect } from "react";

export type NetworkStatus = "online" | "offline" | "limited";

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(navigator.onLine ? "online" : "offline");
  const [isLimitedConnectivity, setIsLimitedConnectivity] = useState(false);

  const handleOnline = useCallback(() => setNetworkStatus("online"), []);
  const handleOffline = useCallback(() => setNetworkStatus("offline"), []);

  const checkConnectivity = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const since = Date.now();
      await fetch("/favicon.ico", { method: "HEAD", cache: "no-store", mode: "no-cors" });
      const delta = Date.now() - since;
      const isLimited = delta > 2000;
      setIsLimitedConnectivity(isLimited);
      if (isLimited && networkStatus === "online") setNetworkStatus("limited");
      if (!isLimited && networkStatus === "limited") setNetworkStatus("online");
    } catch {
      setIsLimitedConnectivity(true);
      setNetworkStatus("limited");
    }
  }, [networkStatus]);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setNetworkStatus(navigator.onLine ? "online" : "offline");
    const id = setInterval(() => { if (navigator.onLine) checkConnectivity(); }, 30000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(id);
    };
  }, [handleOnline, handleOffline, checkConnectivity]);

  return { networkStatus, isLimitedConnectivity, handleOnline, handleOffline };
}
