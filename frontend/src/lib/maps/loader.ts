/**
 * Google Maps JS API Loader
 * Uses the v2 functional API: setOptions() + importLibrary()
 * Ensures Google Maps is only configured once per session
 */
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { publicConfig } from '@/lib/config/public';

let initialized = false;

/**
 * Initialize Google Maps and load required libraries
 * Safe to call multiple times — only runs once
 */
export async function loadGoogleMaps() {
  if (!initialized) {
    setOptions({
      key: publicConfig.googleMapsApiKey,
      v: 'weekly',
      language: publicConfig.googleMapsLanguage,
      region: publicConfig.googleMapsRegion,
    });
    initialized = true;
  }

  // Load all libraries we need
  await Promise.all([
    importLibrary('places'),
    importLibrary('geometry'),
    importLibrary('marker'),
  ]);

  return google;
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetGoogleMapsLoader(): void {
  initialized = false;
}
