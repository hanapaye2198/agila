import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.agila.attendance",
  appName: "AGILA Attendance",
  webDir: "dist",
  android: { allowMixedContent: false },
};

export default config;
