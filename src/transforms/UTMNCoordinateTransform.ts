import { ExecutionContext } from '../'
import { TransformDefSchema } from '../schemas'
import { BaseTransform } from './'
import { ErrorHandler } from '../../common'

const rp = require('request-promise')

export class UTMNCoordinateTransform extends BaseTransform {

    private _servicePath = process.env.COORDINATECONVERSIONSERVICEURL;

    constructor(protected executionContext: ExecutionContext, protected transformDef: TransformDefSchema, protected fieldName: string) {
        super(executionContext, transformDef, fieldName)
    }

    public fx(): Promise<boolean> {
        
        // console.log(`UTM-N Transform running for ${this.fieldName}`)

        const result: Promise<boolean> = new Promise(async (resolve, reject) => {

            try {

                if (this.executionContext.transformed.Metadata.COORD_GEOJSON) return resolve(true)

                // # Gather IGEOLO
                const nitfIGEOLO = this.executionContext.transformed.Metadata.NITF_IGEOLO
                if (nitfIGEOLO && nitfIGEOLO.length === 60) {

                    // # Put it into format for loading into object.
                    
                    // There are four 15 character coordinate strings in IGEOLO (zzeeeeeennnnnnn)
                    // The first 2 bytes make up Zone portion (zz)
                    // The next 6 bytes make up the easting portion (eeeeee)
                    // The last 7 bytes make up Longitude portion (nnnnnnn)
                    const ZONE_LENGTH: number = 2
                    const EASTING_LENGTH: number = 6
                    const NORTHING_LENGTH: number = 7
                    const COORD_LENGTH: number  = 15

                    const myNewInstance = new CoordinateConversionRequest()

                    for ( var i = 0; i <= 3; i++ )
                    {   // grab first 15 byte chunk
                        var coordinate = nitfIGEOLO.substr(i*COORD_LENGTH, COORD_LENGTH)
                        // grab zone
                        var parsedZone = coordinate.substr(0,ZONE_LENGTH)
                        // grab easting
                        var parsedEasting = coordinate.substr(ZONE_LENGTH,EASTING_LENGTH)
                        // grab northing
                        var parsedNorthing = coordinate.substr(ZONE_LENGTH + EASTING_LENGTH, NORTHING_LENGTH)
                        // Add to sourceCoordinates array.
                        myNewInstance.sourceCoordinates.push({
                            sourceEasting: parsedEasting,
                            sourceNorthing: parsedNorthing,
                            sourceHemisphere: '',
                            sourceZoneData: parsedZone
                        })
                    }

                    // Find the nmin for hemisphere calculations.
                    var nmin = myNewInstance.sourceCoordinates[0].sourceNorthing
                    for ( var i = 1; i <= 3; i++ )
                    {
                        if ( myNewInstance.sourceCoordinates[i].sourceNorthing < nmin)
                        {
                            nmin = myNewInstance.sourceCoordinates[i].sourceNorthing
                        }
                    }

                    // Determine if any northing value is greater than [nmin + 5000000].
                    for ( var i = 0; i <= 3; i++ )
                    {
                        if ( myNewInstance.sourceCoordinates[i].sourceNorthing > (5000000 + nmin) )
                        {
                            myNewInstance.sourceCoordinates[i].sourceHemisphere = 'S'
                        }
                        else
                        {
                            myNewInstance.sourceCoordinates[i].sourceHemisphere = 'N'
                        }
                    }

                    // # Pass to coordinate conversion service.
                    const body = await this.callService(myNewInstance)
                    if (body && body.Coordinates) {
                        this.executionContext.transformed.Metadata.COORD_GEOJSON = super.toGeoJSON(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_WKT = super.toWkt(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_TYPE = 'N'
                        return resolve(true)
                    }
                }

                return reject(false)

            }
            catch (err) {
                ErrorHandler.logError(`utmnCoordinateTransform.fx.error:`, err)
                return reject(false)
            }
        })


        return result;
    }

    private callService(conversionRequest): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._servicePath) {
                    return reject('Invalid Service Path for UTMN Coordinate Service')
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
                ErrorHandler.logError('utmnCoordinateTransform.callService.error:', err)
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
