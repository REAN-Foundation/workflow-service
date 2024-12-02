
export interface Location {
    Name     ?: string;
    Lattitude?: number;
    Longitude?: number;
}

export type DistanceUnit = 'km' | 'mi' | 'm';
export type TimestampUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'mo' | 'y';
