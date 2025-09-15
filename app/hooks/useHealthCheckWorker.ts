import { useEffect } from "react";

export function useHealthCheckWorker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const worker = new Worker(
        new URL("../workers/healthCheckWorker.ts", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (event) => {
        console.log("Health check result from worker:", event.data);
        // Update your state or localStorage here if needed
      };

      return () => {
        worker.terminate();
      };
    }
  }, []);
}
