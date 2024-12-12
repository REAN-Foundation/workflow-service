
import { logger } from "../../logger/logger";
import { Location, DistanceUnit } from "../../domain.types/engine/intermediate.types/common.types";

//////////////////////////////////////////////////////////////////////////////////////////////////////

export class MiscUtils {

    /**
     * Compare two locations and check if they are within the given threshold distance.
     *
     * @param location1 - The first location to compare
     * @param location2 - The second location to compare
     * @param threshold - The maximum allowable distance
     * @param unit - The unit of distance ('km', 'mi', or 'm' for meters)
     * @returns True if the locations are within the threshold, otherwise false
     */
    static compareLocations = (
        location1: Location,
        location2: Location,
        threshold: number,
        unit: DistanceUnit = 'm'
    ): boolean => {
        if (location1 == null || location2 == null) {
            logger.error("Both locations must be valid.");
            return false;
        }
        if (
            location1.Lattitude == null ||
            location1.Longitude == null ||
            location2.Lattitude == null ||
            location2.Longitude == null
        ) {
            logger.error("Both locations must have valid Latitude and Longitude.");
            return false;
        }

        const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

        const EARTH_RADIUS_KM = 6371; // Radius of Earth in kilometers
        const EARTH_RADIUS_MI = 3958.8; // Radius of Earth in miles

        // Use Earth's radius based on the unit
        let R: number = EARTH_RADIUS_KM * 1000; // Default to meters
        if (unit === 'km') {
            R = EARTH_RADIUS_KM;
        } else if (unit === 'mi') {
            R = EARTH_RADIUS_MI;
        } else if (unit === 'm') {
            R = EARTH_RADIUS_KM * 1000; // Convert kilometers to meters
        } else {
            logger.error("Unsupported unit. Use 'km', 'mi', or 'm'.");
            return false;
        }

        const lat1 = toRadians(location1.Lattitude);
        const lon1 = toRadians(location1.Longitude);
        const lat2 = toRadians(location2.Lattitude);
        const lon2 = toRadians(location2.Longitude);

        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in the specified unit

        return distance <= threshold;
    };

}
