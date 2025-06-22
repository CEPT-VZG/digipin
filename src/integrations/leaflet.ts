/**
 * Integration Example: Using DIGIPIN with Leaflet Maps
 */

import { 
  decode, 
  getBounds, 
  getNeighbors 
} from '../index';
import type { LeafletIntegration } from '../types';

/**
 * Leaflet integration helper functions
 */
export const DigipinLeaflet: LeafletIntegration = {
  /**
   * Convert DIGIPIN to Leaflet bounds
   */
  toBounds(digipin: string): unknown {
    const bounds = getBounds(digipin);
    
    // Return Leaflet LatLngBounds format
    return {
      _southWest: { lat: bounds.minLat, lng: bounds.minLon },
      _northEast: { lat: bounds.maxLat, lng: bounds.maxLon },
      getSouthWest: () => ({ lat: bounds.minLat, lng: bounds.minLon }),
      getNorthEast: () => ({ lat: bounds.maxLat, lng: bounds.maxLon }),
      getCenter: () => {
        const center = decode(digipin);
        return { lat: center.latitude, lng: center.longitude };
      }
    };
  },

  /**
   * Create Leaflet marker from DIGIPIN
   */
  createMarker(digipin: string, options: any = {}): unknown {
    const coords = decode(digipin);
    
    return {
      _latlng: { lat: coords.latitude, lng: coords.longitude },
      _digipin: digipin,
      options: {
        title: `DIGIPIN: ${digipin}`,
        alt: `Location: ${coords.latitude}, ${coords.longitude}`,
        ...options
      },
      getLatLng: () => ({ lat: coords.latitude, lng: coords.longitude }),
      getTooltip: () => `DIGIPIN: ${digipin}\\nCoordinates: ${coords.latitude}, ${coords.longitude}`
    };
  }
};

/**
 * Example usage with pseudo-Leaflet code
 */
export function createDigipinMap(containerId: string, centerDigipin: string) {
  // This would be actual Leaflet code in a real implementation
  console.log(`Creating map in container: ${containerId}`);
  
  const center = decode(centerDigipin);
  console.log(`Map center: ${center.latitude}, ${center.longitude}`);
  
  // Add center marker
  const centerMarker = DigipinLeaflet.createMarker(centerDigipin, {
    color: 'red',
    title: 'Center Location'
  });
  console.log('Center marker created:', centerMarker);
  
  // Add neighbor markers
  const neighbors = getNeighbors(centerDigipin, { maxDistance: 1 });
  console.log(`Adding ${neighbors.length} neighbor markers`);
  
  neighbors.forEach((neighbor: any, index: number) => {
    const marker = DigipinLeaflet.createMarker(neighbor.digipin, {
      color: 'blue',
      title: `Neighbor ${index + 1}`
    });
    console.log(`Neighbor marker ${index + 1}:`, marker);
  });
  
  // Create bounds for all markers
  const bounds = DigipinLeaflet.toBounds(centerDigipin);
  console.log('Map bounds:', bounds);
  
  return {
    center: centerMarker,
    neighbors: neighbors.map((n: any) => DigipinLeaflet.createMarker(n.digipin)),
    bounds
  };
}

// Example usage
if (require.main === module) {
  console.log('=== DIGIPIN + Leaflet Integration Example ===');
  
  const mapData = createDigipinMap('map-container', '4P3-JK8-52C9');
  console.log('Map created with', mapData.neighbors.length, 'neighbor markers');
}