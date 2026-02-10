'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IOutlet } from '@/lib/db/models/Outlet';

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

interface OutletGridProps {
    outlets: IOutlet[];
}

export default function OutletGrid({ outlets }: OutletGridProps) {
    const router = useRouter();
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLoc, setLoadingLoc] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        // Optimistic: Check local storage first
        try {
            const cached = localStorage.getItem('user_coords');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.lat && parsed.lng) {
                    setUserLoc(parsed);
                    setLoadingLoc(false);
                }
            }
        } catch (e) {
            console.error("Failed to parse cached location", e);
        }

        if (!navigator.geolocation) {
            setLoadingLoc(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLoc(newLoc);
                setLoadingLoc(false);
                localStorage.setItem('user_coords', JSON.stringify(newLoc));
            },
            (error) => {
                console.error("Error getting location", error);
                // If we have cached location, don't override with error, just stop loading
                setLoadingLoc(prev => {
                    if (prev) { // If still loading (no cache hit or cache hit but we wanted fresh)
                        // Actually if cache hit, we set loadingLoc false already. 
                        // So this only runs if no cache or cache failed.
                        return false;
                    }
                    return false;
                });
                // Only set permission denied if we have NO location at all
                setUserLoc(prev => {
                    if (!prev) setPermissionDenied(true);
                    return prev;
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 300000 // Accept positions up to 5 mins old
            }
        );
    }, []);

    const handleOutletClick = (outlet: IOutlet, isDisabled: boolean) => {
        if (isDisabled) return;
        router.push(`/${outlet.slug}`);
    };

    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Order from Nearby Outlets</h2>
                    {loadingLoc && <span className="text-sm text-gray-500 animate-pulse">Locating you...</span>}
                    {permissionDenied && (
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm text-rose-500 hover:text-rose-600 underline"
                        >
                            Location required. Retry?
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {outlets.map((outlet: any) => {
                        let distance = null;
                        // Default to disabled until proven otherwise
                        let isDisabled = true;
                        let distanceText = '';

                        if (userLoc) {
                            distance = calculateDistance(
                                userLoc.lat,
                                userLoc.lng,
                                outlet.coordinates.lat,
                                outlet.coordinates.lng
                            );
                            if (distance <= 5) {
                                isDisabled = false;
                            }
                            distanceText = `${distance.toFixed(1)} km`;
                        } else if (loadingLoc) {
                            // While loading and no cache, keep disabled but show specific text or just wait
                            distanceText = '...';
                        } else {
                            distanceText = 'Location required';
                        }

                        return (
                            <div
                                key={outlet._id}
                                onClick={() => handleOutletClick(outlet, isDisabled)}
                                className={`
                                    relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300
                                    ${isDisabled ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:border-blue-200 cursor-pointer transform hover:-translate-y-1'}
                                `}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                                        {outlet.name.charAt(0)}
                                    </div>
                                    {distanceText && (
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDisabled ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                            {distanceText}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{outlet.name}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{outlet.address}</p>

                                <div className="flex items-center text-sm font-medium text-blue-600">
                                    {isDisabled ? (
                                        <span className="text-gray-400">Not Deliverable</span>
                                    ) : (
                                        <span>Visit Store &rarr;</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
