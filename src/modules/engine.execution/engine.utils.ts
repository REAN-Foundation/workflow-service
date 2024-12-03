import { Location, TimestampUnit, DistanceUnit } from "../../domain.types/engine/intermediate.types/common.types";
import { logger } from "../../logger/logger";

////////////////////////////////////////////////////////////////

/**
     * Compare two locations and check if they are within the given threshold distance.
     *
     * @param location1 - The first location to compare
     * @param location2 - The second location to compare
     * @param threshold - The maximum allowable distance
     * @param unit - The unit of distance ('km', 'mi', or 'm' for meters)
     * @returns True if the locations are within the threshold, otherwise false
     */
export function compareLocations(
    location1: Location,
    location2: Location,
    threshold: number,
    unit: DistanceUnit = 'm'
): boolean {
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
}

/**
     * Compare two timestamps and check if they are within the given threshold.
     *
     * @param timestamp1 - The first timestamp to compare
     * @param timestamp2 - The second timestamp to compare
     * @param threshold - The maximum allowable time difference
     * @param unit - The unit of time ('ms', 's', 'min', 'h', or 'd')
     * @returns True if the timestamps are within the threshold, otherwise false
     */
export function compareTimestamps(
    timestamp1: Date,
    timestamp2: Date,
    threshold: number,
    unit: TimestampUnit = 'm'
): boolean {
    // Convert timestamps to milliseconds
    const time1 = timestamp1.getTime();
    const time2 = timestamp2.getTime();

    // Calculate absolute difference in milliseconds
    const diffInMs = Math.abs(time1 - time2);

    // Convert threshold into milliseconds based on the unit
    let thresholdInMs: number = 1000 * 60 * 60 * 24;
    switch (unit) {
        case 'ms': // Milliseconds
            thresholdInMs = threshold;
            break;
        case 's': // Seconds
            thresholdInMs = threshold * 1000;
            break;
        case 'm': // Minutes
            thresholdInMs = threshold * 1000 * 60;
            break;
        case 'h': // Hours
            thresholdInMs = threshold * 1000 * 60 * 60;
            break;
        case 'd': // Days
            thresholdInMs = threshold * 1000 * 60 * 60 * 24;
            break;
        case 'w': // Weeks
            thresholdInMs = threshold * 1000 * 60 * 60 * 24 * 7;
            break;
        case 'mo': // Months
            thresholdInMs = threshold * 1000 * 60 * 60 * 24 * 30;
            break;
        case 'y': // Years
            thresholdInMs = threshold * 1000 * 60 * 60 * 24 * 365;
            break;
        default:
            logger.error("Unsupported unit. Use 'ms', 's', 'min', 'h', or 'd'.");
    }

    // Check if the difference is within the threshold
    return diffInMs <= thresholdInMs;
}

export function formatDateToYYMMDD(date: Date): string {
    const padZero = (num: number, size: number) => String(num).padStart(size, '0');

    const year = date.getFullYear() % 100; // Get last 2 digits of the year
    const month = padZero(date.getMonth() + 1, 2); // Months are 0-indexed
    const day = padZero(date.getDate(), 2);

    return `${year}${month}${day}`;
}

