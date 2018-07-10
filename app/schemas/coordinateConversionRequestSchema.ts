import { SourceCoordinate } from './'

export class CoordinateConversionRequestSchema {
    lonRange: number = 0;
    leadingZeros: boolean = false;
    signHemisphere: number = 0;
    geodeiticUnits: number = 2;
    sourceDatum: string = "WGE";
    sourceCoordinateType: number = 10;
    sourceHeightType: number = 0;
    targetDatum: string = "WGE";
    targetCoordinateType: number = 10;
    targetHeightType: number = 0;
    targetZone: boolean = false;
    sourceCoordinates: Array<SourceCoordinate> = [];
}