import { useMemo } from "react";
import { motion } from "framer-motion";
import { Navigation, ZoomIn, ZoomOut } from "lucide-react";
import { NearbyGig } from "@/lib/api";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

interface MapSectionProps {
  gigs: NearbyGig[];
  center: { lat: number; lng: number } | null;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const MAPTILER_KEY = "CjTAEr9j7nCG6mk1WrXd";

const gigIcon = L.divIcon({
  className: "custom-gig-marker",
  html: '<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#9333ea;transform:rotate(-45deg);box-shadow:0 0 20px rgba(147,51,234,.7);border:2px solid white;display:flex;align-items:center;justify-content:center"><div style="width:10px;height:10px;border-radius:50%;background:white"></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#a855f7;border:3px solid rgba(255,255,255,.95);box-shadow:0 0 20px rgba(168,85,247,.6)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapZoomSync = ({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) => {
  const map = useMap();
  map.setView([center.lat, center.lng], zoom, { animate: true });
  return null;
};

const MapSection = ({ gigs, center, zoom, onZoomIn, onZoomOut }: MapSectionProps) => {
  const mapCenter = center ?? { lat: 30.70091, lng: 76.75925 };
  const tileUrl = useMemo(
    () => `https://api.maptiler.com/maps/outdoor-v4/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    [],
  );

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold font-display">Nearby Gigs Map</h2>
        <div className="flex gap-2">
          <button onClick={onZoomOut} className="rounded-xl glass-surface p-2 hover:shadow-glow transition-all">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={onZoomIn} className="rounded-xl glass-surface p-2 hover:shadow-glow transition-all">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative rounded-3xl p-[4px] bg-gradient-to-br from-purple-500 via-primary to-accent shadow-[0_0_30px_hsl(258_70%_58%/0.4)]">
        <div className="relative w-full h-[26rem] rounded-[22px] overflow-hidden glass-surface border-4 border-primary/60">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          scrollWheelZoom
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer url={tileUrl} />
          <MapZoomSync center={mapCenter} zoom={zoom} />
          {center && <Marker position={[center.lat, center.lng]} icon={userIcon}><Popup>Your location</Popup></Marker>}
          {gigs.map((gig) => (
            <Marker key={gig.id} position={[gig.lat, gig.lng]} icon={gigIcon}>
              <Popup>
                <p className="text-xs font-semibold">{gig.title}</p>
                <p className="text-xs text-muted-foreground">₹{gig.price} · {gig.distanceKm} km</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {center && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 bottom-4 z-[1000] rounded-xl glass-surface px-3 py-2 text-xs text-muted-foreground flex items-center gap-1"
          >
            <Navigation className="h-3 w-3" />
            Live map centered on your location
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MapSection;
