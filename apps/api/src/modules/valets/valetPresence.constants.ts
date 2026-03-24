/**
 * Si `lastPresenceAt` es más antiguo que esto, el valet no cuenta como "en la app"
 * para la lista de conductores disponibles en un parqueo.
 */
export const VALET_PRESENCE_MAX_AGE_MS = 5 * 60 * 1000;
