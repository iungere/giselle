import { useCallback, useEffect, useRef } from "react";

export function usePopupWindow(url: string) {
  console.log("usePopupWindow initialized with URL:", url);
  const popupRef = useRef<Window | null>(null);

  const open = useCallback(() => {
    const width = 800;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    console.log("Attempting to open popup window with URL:", url);
    try {
      popupRef.current = window.open(
        url,
        "Configure GitHub App",
        `width=${width},height=${height},top=${top},left=${left},popup=1`,
      );

      if (!popupRef.current) {
        console.warn("Failed to open popup window - null reference returned");
      } else {
        console.log("Popup window opened successfully");
      }
    } catch (error) {
      console.error("Error opening popup window:", error);
    }
  }, [url]);

  useEffect(() => {
    console.log("usePopupWindow effect initialized");
    return () => {
      console.log("Cleanup: checking if popup needs to be closed");
      if (popupRef.current && !popupRef.current.closed) {
        console.log("Closing popup window");
        popupRef.current.close();
      }
    };
  }, []);

  return { open };
}
