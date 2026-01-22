/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find drivers within specified radius using Haversine formula
 * @param customerLat - Customer latitude
 * @param customerLon - Customer longitude
 * @param drivers - Array of drivers with location
 * @param radiusKm - Search radius in kilometers (default: 5 km)
 * @returns Array of drivers within radius sorted by distance
 */
export function findDriversWithinRadius(
    customerLat: number,
    customerLon: number,
    drivers: any[],
    radiusKm: number = 5,
): any[] {
    return drivers
        .filter((driver) => {
            const distance = calculateDistance(
                customerLat,
                customerLon,
                driver.latitude,
                driver.longitude,
            );
            return distance <= radiusKm;
        })
        .map((driver) => ({
            ...driver,
            distance: calculateDistance(
                customerLat,
                customerLon,
                driver.latitude,
                driver.longitude,
            ),
        }))
        .sort((a, b) => a.distance - b.distance);
}

