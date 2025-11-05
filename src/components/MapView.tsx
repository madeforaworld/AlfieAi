import { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { PlanningApplication } from '../data/mockData';

interface MapViewProps {
  selectedProject: string | null;
  onProjectClick: (id: string) => void;
  applications: PlanningApplication[];
}

export function MapView({ selectedProject, onProjectClick, applications }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#32C8A2';
      case 'refused': return '#FF3B30';
      case 'pending': return '#007AFF';
      case 'withdrawn': return '#999';
      default: return '#999';
    }
  };

  useEffect(() => {
    // Only initialize map once
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // Initialize map centered on London
      const map = L.map(mapContainerRef.current!, {
        center: [51.5074, -0.1278], // London coordinates
        zoom: 11,
        zoomControl: false, // We'll use custom controls
      });

      // Add CartoDB Positron tiles (minimal style similar to Snazzy Maps)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add custom zoom controls
      const customZoomIn = document.getElementById('custom-zoom-in');
      const customZoomOut = document.getElementById('custom-zoom-out');
      
      if (customZoomIn) {
        customZoomIn.onclick = () => map.zoomIn();
      }
      if (customZoomOut) {
        customZoomOut.onclick = () => map.zoomOut();
      }

      // Mark map as ready
      setIsMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when applications change or map becomes ready
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    import('leaflet').then((L) => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Limit to prevent overcrowding
      const pinsToShow = applications.slice(0, 100);

      // Add new markers
      pinsToShow.forEach(app => {
        const color = getStatusColor(app.status);
        const isSelected = selectedProject === app.id;

        // Create custom icon with minimal design
        const iconHtml = `
          <div style="
            width: ${isSelected ? '28px' : '20px'};
            height: ${isSelected ? '28px' : '20px'};
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            transition: all 0.2s;
            cursor: pointer;
            ${isSelected ? 'box-shadow: 0 0 0 4px ' + color + '30, 0 2px 8px rgba(0,0,0,0.25);' : ''}
          "></div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
          iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
        });

        const marker = L.marker([app.latitude, app.longitude], { icon })
          .addTo(mapInstanceRef.current);

        // Add popup with minimal styling
        marker.bindPopup(`
          <div style="padding: 8px; min-width: 180px;">
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #1a1a1a;">${app.name.substring(0, 50)}</div>
            <div style="font-size: 11px; color: #666; margin-bottom: 2px;">${app.borough}</div>
            <div style="display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 3px; background-color: ${color}20; color: ${color}; text-transform: capitalize; font-weight: 500;">${app.status}</div>
          </div>
        `, {
          closeButton: false,
          offset: [0, -10],
          className: 'minimal-popup'
        });

        // Add click handler
        marker.on('click', () => {
          onProjectClick(app.id);
        });

        // Hover effect
        marker.on('mouseover', () => {
          marker.openPopup();
        });

        markersRef.current.push(marker);
      });
    });
  }, [applications, selectedProject, onProjectClick, isMapReady]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm z-0">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Custom CSS for Leaflet - Minimal Theme */}
      <style>{`
        .leaflet-container {
          font-family: inherit;
          background: #f8f9fa;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .minimal-popup .leaflet-popup-content-wrapper {
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .custom-marker {
          background: none;
          border: none;
        }
        .custom-marker:hover div {
          transform: scale(1.15);
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #333 !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f5f5f5 !important;
        }
        .leaflet-bar {
          border: none !important;
        }
      `}</style>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <Button 
          id="custom-zoom-in"
          size="icon" 
          variant="secondary" 
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button 
          id="custom-zoom-out"
          size="icon" 
          variant="secondary" 
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Legend - Minimal Style */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4 text-xs z-[1000] border border-gray-100">
        <p className="font-medium mb-3 text-gray-900">Application Status</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#32C8A2' }} />
            <span className="text-gray-700">Approved</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#007AFF' }} />
            <span className="text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#FF3B30' }} />
            <span className="text-gray-700">Refused</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: '#999' }} />
            <span className="text-gray-700">Withdrawn</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-gray-500 text-xs">{applications.slice(0, 100).length} applications shown</p>
        </div>
      </div>
    </div>
  );
}
