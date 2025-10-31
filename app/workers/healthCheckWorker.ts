// healthCheckWorker.ts
if (typeof self !== "undefined") {
  self.onmessage = async (_event: any) => {
    // Your existing health check logic here
    try {
      // example: check server/db
      const response = await fetch("/api/v1/health_check");
      const data = await response.json();

      self.postMessage({ success: true, data });
    } catch (error: any) {
      self.postMessage({ success: false, error: error.message });
    }
  };
}