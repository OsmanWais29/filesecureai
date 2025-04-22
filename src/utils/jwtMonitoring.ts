
import { supabase } from "@/lib/supabase";
import { verifyJwtToken } from "./jwtVerifier";

let intervalId: number | null = null;

export interface MonitoringStatus {
  active: boolean;
  lastCheck: Date | null;
  nextCheck: Date | null;
  checksPerformed: number;
  refreshesPerformed: number;
}

const status: MonitoringStatus = {
  active: false,
  lastCheck: null,
  nextCheck: null,
  checksPerformed: 0,
  refreshesPerformed: 0,
};

export function getMonitoringStatus(): MonitoringStatus {
  return { ...status };
}

export function startJWTMonitoring(intervalMinutes = 5): boolean {
  if (intervalId !== null) {
    console.log("JWT monitoring already running.");
    return false;
  }

  const runCheck = async () => {
    status.checksPerformed++;
    status.lastCheck = new Date();

    const result = await verifyJwtToken();
    let expiresInMinutes = 0;
    if (result.expiresAt) {
      expiresInMinutes = Math.round((result.expiresAt.getTime() - Date.now()) / 60000);
    }

    if (result.isValid && expiresInMinutes < 10) {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        status.refreshesPerformed++;
        console.log("JWT token refreshed during monitoring.");
      } else {
        console.warn("Failed JWT refresh during monitoring:", error.message);
      }
    }
    status.nextCheck = new Date(Date.now() + intervalMinutes * 60 * 1000);
  };

  runCheck();
  intervalId = window.setInterval(runCheck, intervalMinutes * 60 * 1000);
  status.active = true;
  return true;
}

export function stopJWTMonitoring(): boolean {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
    status.active = false;
    return true;
  }
  return false;
}
