import { analytics } from "@/config/firebase";
import { logEvent } from "firebase/analytics";

export const logAnalyticsEvent = async (eventName: string, eventParams?: { [key: string]: any }) => {
  try {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, eventParams);
    }
  } catch (error) {
    console.error("Error logging analytics event:", error);
  }
};
