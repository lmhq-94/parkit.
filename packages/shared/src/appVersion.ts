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
  if (!Constants) {
    return "";
  }
  return (
    Constants.expoConfig?.version ??
    Constants.nativeApplicationVersion ??
    ""
  );
}
