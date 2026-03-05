import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { syncCalendarData } from "../api/calendar.service"; // Your API call to 8080
import { notify } from "../utils/toast";

export const useCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const startSync = useGoogleLogin({
    flow: "auth-code", // REQUIRED to get Refresh Token on backend
    scope:
      "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks",
    onSuccess: async (codeResponse) => {
      setIsSyncing(true);
      try {
        // Send the "code" to your 8080 backend
        let res = await syncCalendarData(codeResponse.code);
        notify.success(res?.message);
        console.log("✅ Sync Successful", res?.message);
      } catch (err: any) {
        notify.success(err?.message);
        console.error("❌ Sync Failed", err);
      } finally {
        setIsSyncing(false);
      }
    },
    onError: (error) => console.error("Login Failed:", error),
  });

  return { startSync, isSyncing };
};
