/**
 * Google Maps constants and configuration utilities
 * Australia-specific bounds, state centers, and map styles
 */

/** Coordinates interface matching google.maps.LatLngLiteral */
interface LatLngLiteral {
  lat: number;
  lng: number;
}

/** Australia bounding box for map restriction */
export const AUSTRALIA_BOUNDS = {
  north: -10.6681857235,
  south: -43.6345972634,
  west: 113.338953078,
  east: 153.569469029,
} as const;

/** State center coordinates */
export const STATE_CENTERS: Record<string, LatLngLiteral> = {
  NSW: { lat: -31.8402, lng: 145.6128 },
  VIC: { lat: -37.0201, lng: 144.9646 },
  QLD: { lat: -20.9176, lng: 142.7028 },
  WA: { lat: -25.0423, lng: 117.7932 },
  SA: { lat: -30.0002, lng: 136.2092 },
  TAS: { lat: -41.4545, lng: 145.9707 },
  ACT: { lat: -35.2809, lng: 149.13 },
  NT: { lat: -19.4914, lng: 132.551 },
} as const;

/**
 * Get map options for a given state or Australia overview
 * Returns a plain object — Google Maps types are only available after loadGoogleMaps()
 */
export function getMapOptions(state?: string) {
  const center = state ? STATE_CENTERS[state] ?? STATE_CENTERS.NSW : STATE_CENTERS.NSW;

  return {
    center,
    zoom: state ? 7 : 4,
    mapTypeId: 'roadmap',
    mapTypeControl: true,
    mapTypeControlOptions: {
      position: 11, // TOP_RIGHT
    },
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    zoomControlOptions: {
      position: 13, // RIGHT_CENTER
    },
    scaleControl: true,
    rotateControl: true,
    restriction: {
      latLngBounds: AUSTRALIA_BOUNDS,
      strictBounds: false,
    },
    styles: [
      {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#0F766E', weight: 2 }],
      },
      {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#0F766E', weight: 1.5 }],
      },
    ],
  };
}
