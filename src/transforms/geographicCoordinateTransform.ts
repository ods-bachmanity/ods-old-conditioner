import { ExecutionContext } from '../'
import { TransformDefSchema } from '../schemas'
import { BaseTransform } from './'
import { ErrorHandler } from '../../common'

const rp = require('request-promise')

export class GeographicCoordinateTransform extends BaseTransform {

    private _servicePath: string = process.env.COORDINATECONVERSIONSERVICEURL

    constructor(protected executionContext: ExecutionContext, protected transformDef: TransformDefSchema, protected fieldName: string) {
        super(executionContext, transformDef, fieldName)
    }

    public fx(): Promise<Boolean> {

        // console.log(`Geographic Transform running for ${this.fieldName}`)

        const result: Promise<boolean> = new Promise(async (resolve, reject) => {

            try {
                
                if (this.executionContext.transformed.Metadata.COORD_GEOJSON) return resolve(true)

                // # Gather IGEOLO
                const nitfIGEOLO = this.executionContext.transformed.Metadata.NITF_IGEOLO
                if (nitfIGEOLO && nitfIGEOLO.length === 60) {
    
                    // # Put it into format for loading into object.
                    
                    // There are four 15 character coordinate strings in IGEOLO
                    // First 7 bytes make up Latitude portion (DDMMSS[N|S])
                    // Last 8 bytes make up Longitude portion (DDDMMSS[E|W])
                    // Input to coordinate conversion service needs space separator (DD MM SS[N|S]) (DDD MM SS[N|S])
                    const LAT_LENGTH: number = 7
                    const LON_LENGTH: number = 8
                    const COORD_LENGTH: number  = 15
    
                    const myNewInstance = new CoordinateConversionRequest()
    
                    for ( var i = 0; i <= 3; i++ )
                    {   // grab first 15 byte chunk
                        var coordinate = nitfIGEOLO.substr(i*COORD_LENGTH, COORD_LENGTH)
                        // grab raw lat
                        var rawSubLat = coordinate.substr(0,LAT_LENGTH)
                        // grab raw long
                        var rawSubLon = coordinate.substr(LAT_LENGTH,LON_LENGTH)
    
                        // format lat
                        var formattedLat = rawSubLat.substr(0,2) + ' ' + rawSubLat.substr(2,2) + ' ' + rawSubLat.substr(4,3)
                        // split long
                        var formattedLon = rawSubLon.substr(0,3) + ' ' + rawSubLon.substr(3,2) + ' ' + rawSubLon.substr(5,3)
                        // Add to sourceCoordinates array.
                        myNewInstance.sourceCoordinates.push({
                            sourceLongitude: formattedLon,
                            sourceLatitude: formattedLat,
                            sourceHeight: '0'
                        })
                    }
    
                    // # Pass to coordinate conversion service.
                    const body = await this.callService(myNewInstance)
                    if (body && body.Coordinates) {
                        this.executionContext.transformed.Metadata.COORD_GEOJSON = super.toGeoJSON(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_WKT = super.toWkt(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_TYPE = 'G'
                        return resolve(true)
                    }
                
                }

                return reject(false)
    
            }
            catch (err) {
                ErrorHandler.logError(`geographicCoordinateTransform.fx.error:`, err)
                return reject(false)
            }

        })

        return result

    }

    private callService(conversionRequest: CoordinateConversionRequest): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._servicePath) {
                    return reject('Invalid Service Path for Geographic Coordinate Service')
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
                ErrorHandler.logError('geographicCoordinateTransform.callService.error:', err)
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
    sourceCoordinateType: number = 10
    sourceHeightType: number = 0
    targetDatum: string = 'WGE'
    targetCoordinateType: number = 10
    targetHeightType: number = 0
    targetZone: boolean = false
    sourceCoordinates: Array<SourceCoordinate> = []
}

class SourceCoordinate {
    sourceLongitude: string = ''
    sourceLatitude: string = ''
    sourceHeight: string = '0'
}
