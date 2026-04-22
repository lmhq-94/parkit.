// Safe version getter that works in both Expo (mobile) and Next.js (web) environments
const getExpoConstants = () => {
  try {
    // Dynamic require to avoid breaking Next.js builds
    const { default: Constants } = require("expo-constants");
    return Constants;
  } catch {
    return null;
  }
};

export function getAppVersionString(): string {
  const Constants = getExpoConstants();
  if (Constants) {
    return (
      Constants.expoConfig?.version ??
      Constants.nativeApplicationVersion ??
      ""
    );
  }
  
  // For web environments (Next.js), read from package.json
  try {
    const packageJson = require("../../../package.json");
    return packageJson.version || "";
  } catch {
    return "";
  }
}
