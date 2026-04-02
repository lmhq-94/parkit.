/**
 * Re-exports phone formatting functions from shared package.
 * Kept for backward compatibility with existing imports in this app.
 */

export {
  COUNTRY_DIAL_CODES,
  formatPhone,
  formatPhoneInternational,
  formatPhoneWithCountryCode,
  isValidPhoneOptional,
  phoneDigitsForApi,
  getDeviceCountryCode,
} from "@parkit/shared";
