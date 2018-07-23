import { ExecutionContext } from '../'
import { TransformDefSchema } from '../schemas'
import { BaseTransform } from './'
import { ErrorHandler } from '../../common'

const rp = require('request-promise')

export class HRTECoordinateTransform extends BaseTransform {

    private _servicePath = process.env.COORDINATECONVERSIONSERVICEURL;

    constructor(protected executionContext: ExecutionContext, protected transformDef: TransformDefSchema, protected fieldName: string) {
        super(executionContext, transformDef, fieldName)
    }

    public fx(): Promise<boolean> {

        const result: Promise<boolean> = new Promise(async (resolve, reject) => {

            try {

                if (this.executionContext.transformed.Metadata.COORD_GEOJSON) return resolve(true)

                // # Gather UTM Zone
                let rawUtmZone = this.executionContext.transformed.UTMZone
    
                // Check UTM Zone
                var zoneLength: number
                if (rawUtmZone.length === 3) {
                    zoneLength = 2
                }
                else if (rawUtmZone.length === 2) {
                    zoneLength = 1
                }
                else {
                    console.log('ERROR:hrteCoordinateTransform.fx: UTMZone field malformed')
                    return reject(false)
                }
                // Get UTM Zone and Hemisphere
                let utmHemisphere = rawUtmZone.substr(rawUtmZone.length - 1, 1)
                let utmZone = rawUtmZone.substr(0, zoneLength)
    
                const myNewInstance = new CoordinateConversionRequest()
    
                // Parse POLYGON to components.
                // Put it into format for loading into object.
                let footprint = this.executionContext.transformed.Footprint
                footprint = footprint.replace(/[{()}]/g, '') // Remove parenthesis
                footprint = footprint.replace('POLYGON', '') // Remove WKT text
                
                const points = footprint.split(',')
                let pointCount = 1
                points.forEach((point) => { // e.g. 10 20 0
                    // Don't loop past four corners (WKT has first point twice)
                    if (point && pointCount <= 4) {
                        const coords = point.split(' ')
                        let counter = 0
                        let parsedEasting
                        let parsedNorthing
    
                        coords.forEach((coord) => { // ex. 10
                            if (coord) {
                                if (counter === 0) {
                                    parsedEasting = +coord
                                }
                                if (counter === 1) {
                                    parsedNorthing = +coord
                                }
                                counter++
                            }
                        })
                        myNewInstance.sourceCoordinates.push({
                            sourceEasting: parsedEasting,
                            sourceNorthing: parsedNorthing,
                            sourceHemisphere: utmHemisphere,
                            sourceZoneData: utmZone
                        });
                        pointCount++
                    }
                })
    
                // If it is northern hemisphere, must process points to see if any are actually in the southern hemisphere.
                if (utmHemisphere === 'N') {
                    // Find the nmin for hemisphere calculations.
                    var nMin = myNewInstance.sourceCoordinates[0].sourceNorthing
                    for ( let i = 1; i <= 3; i++ ) {
                        if ( myNewInstance.sourceCoordinates[i].sourceNorthing < nMin) {
                            nMin = myNewInstance.sourceCoordinates[i].sourceNorthing
                        }
                    }
    
                    // Determine if any northing value is greater than [nmin + 5000000].
                    for ( let i = 0; i <= 3; i++) {
                        if ( myNewInstance.sourceCoordinates[i].sourceNorthing > (5000000 + nMin) ) {
                            myNewInstance.sourceCoordinates[i].sourceHemisphere = 'S'
                        }
                        else {
                            myNewInstance.sourceCoordinates[i].sourceHemisphere = 'N'
                        }
                    }
                }
    
                //console.log(myNewInstance)
    
                // # Pass to coordinate conversion service.
                const body = await this.callService(myNewInstance)
                if (body && body.Coordinates) {
                    this.executionContext.transformed.Metadata.COORD_GEOJSON = super.toGeoJSON(body.Coordinates || [])
                    this.executionContext.transformed.Metadata.COORD_WKT = super.toWkt(body.Coordinates || [])
                    this.executionContext.transformed.Metadata.COORD_TYPE = 'H'
                    return resolve(true)
                }
        
            }
            catch (err) {
                ErrorHandler.logError(`hrteCoordinateTransform.fx.error:`, err)
                return reject(false)
            }
        })

        return result

    }

    private callService(conversionRequest): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._servicePath) {
                    return reject('Invalid Service Path for HRTE Coordinate Service')
                }
    
                const response = await rp.post({
                    headers: { 'content-type': 'application/json' },
                    url: this._servicePath,
                    body: JSON.stringify(conversionRequest)
                })
                const records = JSON.parse(response)
                return resolve(records)
    
            }
            catch (err) {
                ErrorHandler.logError('hrteCoordinateTransform.callService.error:', err)
                return reject(false)
            }
            
        })

        return result

    }

}


class CoordinateConversionRequest {
    lonRange: number = 0
    leadingZeros: boolean = false
    signHemisphere: number = 0
    geodeiticUnits: number = 2
    sourceDatum: string = 'WGE'
    sourceCoordinateType: number = 34
    sourceHeightType: number = 0
    sourceZone: boolean = false
    targetDatum: string = 'WGE'
    targetCoordinateType: number = 10
    targetHeightType: number = 0
    targetZone: boolean = false
    sourceCoordinates: Array<SourceCoordinate> = []
}

class SourceCoordinate {
    sourceEasting: string = ''
    sourceNorthing: string = ''
    sourceHemisphere: string = ''
    sourceZoneData: string = ''
}

/*
// Example input to coordinateConversion
{
  "lonRange": "0",
  "leadingZeros": "false",
  "signHemisphere": "0",
  "geodeiticUnits": "2",
  "sourceDatum": "WGE",
  "sourceCoordinateType": "34",
  "sourceHeightType": "0",
  "sourceZone": "false",
  "targetDatum": "WGE",
  "targetCoordinateType": "10",
  "targetHeightType": "0",
  "targetZone": "false",
  "sourceCoordinates": [
    {"sourceEasting": "223275",
     "sourceNorthing": "2715025",
     "sourceHemisphere": "N",
     "sourceZoneData": "40"},
    {"sourceEasting": "246187",
     "sourceNorthing": "2715025",
     "sourceHemisphere": "N",
     "sourceZoneData": "40"},
    {"sourceEasting": "246187",
     "sourceNorthing": "2707109",
     "sourceHemisphere": "N",
     "sourceZoneData": "40"},
    {"sourceEasting": "223275",
     "sourceNorthing": "2707109",
     "sourceHemisphere": "N",
     "sourceZoneData": "40"}
    ]
}
*/
