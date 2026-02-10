import Outlet from '@/lib/db/models/Outlet';
import { getDistanceFromLatLonInKm } from '@/lib/utils/geo';
import dbConnect from '@/lib/db/connect';

export async function findNearestOutlet(lat: number, lng: number, maxDistanceKm: number = 5) {
    await dbConnect();
    const outlets = await Outlet.find({ isActive: true });

    let nearestOutlet: any = null;
    let minDistance = Infinity;

    for (const outlet of outlets) {
        if (!outlet.coordinates?.lat || !outlet.coordinates?.lng) continue;

        const distance = getDistanceFromLatLonInKm(
            lat,
            lng,
            outlet.coordinates.lat,
            outlet.coordinates.lng
        );

        if (distance <= maxDistanceKm && distance < minDistance) {
            minDistance = distance;
            nearestOutlet = outlet;
        }
    }

    return nearestOutlet ? { outlet: nearestOutlet, distance: minDistance } : null;
}
