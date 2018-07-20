import { ExecutionContext } from '../'
import { TransformDefSchema } from '../schemas'
import { BaseTransform } from './baseTransform';

const rp = require('request-promise')

export class UTMMGRSCoordinateTransform extends BaseTransform {

    private _servicePath = process.env.COORDINATECONVERSIONSERVICEURL

    constructor(protected executionContext: ExecutionContext, protected transformDef: TransformDefSchema, protected fieldName: string) {
        super(executionContext, transformDef, fieldName)
    }

    public fx(): Promise<boolean> {

        // console.log('I am transforming UTM-MGRS coordinates.')

        const result: Promise<boolean> = new Promise(async (resolve, reject) => {

            try {
                
                if (this.executionContext.transformed.Metadata.COORD_GEOJSON) return resolve(true)

                // # Gather IGEOLO
                const nitfIGEOLO = this.executionContext.transformed.Metadata.NITF_IGEOLO
                if (nitfIGEOLO && nitfIGEOLO.length === 60) {
    
                    // # Put it into format for loading into object.
                    
                    // For ICORDS UTM-MGRS, there are four 15 character coordinate strings in IGEOLO (zzBJKeeeeennnnn)
                    // The coordinate conversion service can take that full 15 character coordinate string as an input parameter.
                    const COORD_LENGTH: number  = 15
    
                    const myNewInstance = new CoordinateConversionRequest()
    
                    for( var i = 0; i <= 3; i++ )
                    {   // grab first 15 byte chunk
                        var coordinate = nitfIGEOLO.substr(i*COORD_LENGTH, COORD_LENGTH)
                        // Add to sourceCoordinates array.
                        myNewInstance.sourceCoordinates.push({
                            sourceCoordinateString: coordinate
                        })
                    }
    
                    // # Pass to coordinate conversion service.
                    const body = await this.callService(myNewInstance)
                    if (body && body.Coordinates) {
                        this.executionContext.transformed.Metadata.COORD_GEOJSON = super.toGeoJSON(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_WKT = super.toWkt(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_TYPE = 'U'
                        return resolve(true)
                    }
                }

                return reject(false)

            }
            catch (err) {
                console.error(`ERROR:utmmgrs_coordinateTransform.fx:${err}`)
                return reject(false)
            }
        })

        return result

    }

    private callService(conversionRequest): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._servicePath) {
                    return reject('Invalid Service Path for UTMMGRS Coordinate Service')
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
                console.error('ERROR:utmmgrsCoordinateTransform.callService')
                console.error(err)
                return reject(null)
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
    sourceCoordinateType: number = 19
    sourceHeightType: number = 0
    targetDatum: string = 'WGE'
    targetCoordinateType: number = 10
    targetHeightType: number = 0
    targetZone: boolean = false
    sourceCoordinates: Array<SourceCoordinate> = []
}

class SourceCoordinate {
    sourceCoordinateString: string = ''
}
