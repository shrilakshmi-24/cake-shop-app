'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issues in Next.js/Webpack
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
    lat?: number;
    lng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

// Component to handle map clicks
function LocationMarker({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: L.LatLng | null }) {
    const map = useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

// Component to update map center when props change (externally driven)
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function LeafletMap({ lat, lng, onLocationSelect }: LeafletMapProps) {
    // Default center: Bangalore (Example bakery location) or prop provided
    const defaultCenter: [number, number] = [12.9716, 77.5946];
    const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter;
    const [isLocating, setIsLocating] = useState(false);
    const [geoError, setGeoError] = useState('');

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        setGeoError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onLocationSelect(latitude, longitude);
                setIsLocating(false);
            },
            () => {
                setGeoError('Unable to retrieve your location');
                setIsLocating(false);
            }
        );
    };

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    onLocationSelect={onLocationSelect}
                    position={lat && lng ? new L.LatLng(lat, lng) : null}
                />
                <MapUpdater center={center} />
            </MapContainer>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2 items-end">
                {geoError && (
                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-medium shadow-sm border border-red-100 mb-2">
                        {geoError}
                    </div>
                )}
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-md text-sm font-semibold hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLocating ? (
                        <svg className="animate-spin h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                    )}
                    {isLocating ? 'Locating...' : 'Locate Me'}
                </button>
            </div>

            {/* Helper Text Overlay */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100/50">
                <span className="text-xs font-medium text-gray-600">
                    Click map to pin delivery location
                </span>
            </div>
        </div>
    );
}
