'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

// Dynamically import Leaflet Map to avoid SSR issues
const LeafletMap = dynamic(
    () => import('./LeafletMap'),
    {
        loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">Loading Map...</div>,
        ssr: false
    }
);

export interface AddressDetails {
    houseNo: string;
    street: string;
    landmark: string;
    city: string;
    zip: string;
    lat?: number;
    lng?: number;
}

interface AddressFormProps {
    value: AddressDetails;
    onChange: (value: AddressDetails) => void;
}

export function AddressForm({ value, onChange }: AddressFormProps) {
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);

    const handleLocationSelect = async (lat: number, lng: number) => {
        // 1. Update coordinates immediately
        onChange({ ...value, lat, lng });

        // 2. Fetch address details
        setIsFetchingAddress(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: {
                    'User-Agent': 'CakeShopApp/1.0', // Required by Nominatim policy
                    'Accept-Language': 'en'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const addr = data.address;

                if (addr) {
                    // Refined Mapping Strategy
                    // 1. Construct a more descriptive street string
                    const streetComponents = [
                        addr.road || addr.pedestrian || addr.footway || addr.path,
                        addr.suburb || addr.neighbourhood || addr.residential
                    ].filter(Boolean);

                    const streetAddress = streetComponents.length > 0 ? streetComponents.join(', ') : '';

                    // 2. Fallback for City
                    const cityVal = addr.city || addr.town || addr.village || addr.city_district || addr.county || '';

                    onChange({
                        ...value,
                        lat,
                        lng,
                        street: streetAddress || value.street || '',
                        city: cityVal || value.city || '',
                        zip: addr.postcode || value.zip || '',
                        houseNo: (value.houseNo ? value.houseNo : addr.house_number) || '',
                        // If we have a landmark-like feature (amenity/building), we could potentially use it?
                        // Let's stick to simple fields for now to avoid noise.
                    });
                }
            }
        } catch (error) {
            console.error('Failed to resolve address', error);
        } finally {
            setIsFetchingAddress(false);
        }
    };

    const handleChange = (field: keyof AddressDetails, val: string) => {
        onChange({ ...value, [field]: val });
    };

    return (
        <div className="space-y-4">
            {/* Map Section */}
            <div className="bg-gray-100 rounded-xl overflow-hidden relative h-72 border border-gray-200 z-0 group">
                <LeafletMap
                    lat={value.lat}
                    lng={value.lng}
                    onLocationSelect={handleLocationSelect}
                />

                {isFetchingAddress && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">Detecting Address...</span>
                    </div>
                )}
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="text"
                    placeholder="House / Flat No."
                    value={value.houseNo}
                    onChange={e => handleChange('houseNo', e.target.value)}
                    className="col-span-1 rounded-xl border border-gray-200 p-3 text-sm focus:ring-1 focus:ring-gray-900"
                />
                <input
                    type="text"
                    placeholder="City"
                    value={value.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className="col-span-1 rounded-xl border border-gray-200 p-3 text-sm focus:ring-1 focus:ring-gray-900"
                />
                <input
                    type="text"
                    placeholder="Street / Colony"
                    value={value.street}
                    onChange={e => handleChange('street', e.target.value)}
                    className="col-span-2 rounded-xl border border-gray-200 p-3 text-sm focus:ring-1 focus:ring-gray-900"
                />
                <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={value.landmark}
                    onChange={e => handleChange('landmark', e.target.value)}
                    className="col-span-2 rounded-xl border border-gray-200 p-3 text-sm focus:ring-1 focus:ring-gray-900"
                />
                <input
                    type="text"
                    placeholder="Zip / Pincode"
                    value={value.zip}
                    onChange={e => handleChange('zip', e.target.value)}
                    className="col-span-1 rounded-xl border border-gray-200 p-3 text-sm focus:ring-1 focus:ring-gray-900"
                />
                {value.lat && (
                    <div className="col-span-1 flex items-center justify-end">
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Location Set ({value.lat.toFixed(4)}, {value.lng?.toFixed(4)})
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
