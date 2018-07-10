import { ExecutionContext } from '../'
import { TransformDefSchema, CoordinateConversionRequestSchema } from '../schemas'
import { BaseTransform } from './baseTransform';

const rp = require('request-promise')

export class GeographicCoordinateTransform extends BaseTransform {

    private _servicePath: string = process.env.COORDINATECONVERSIONSERVICEURL

    constructor(protected executionContext: ExecutionContext, protected transformDef: TransformDefSchema, protected fieldName: string) {
        super(executionContext, transformDef, fieldName)
    }

    public fx(): Promise<Boolean> {

        console.log(`Geographic Transform running for ${this.fieldName}`)

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
    
                    const myNewInstance = new CoordinateConversionRequestSchema()
    
                    for( var i = 0; i <= 3; i++ )
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
                        console.log(`Geographic Coordinate Transform WKT: ${this.executionContext.transformed.Metadata.COORD_WKT}`)
                    }
                    return resolve(true)
                
                } else {

                    return reject(false)

                }
    
            }
            catch (err) {
                console.log(`ERROR:geographic_coordinateTransform.fx:${err}`)
                // this.te.errors.push('ERROR:geographic_coordinateTransform.fx:' + err);
                return reject(false)
            }

        })

        return result

    }

    private callService(conversionRequest: CoordinateConversionRequestSchema): Promise<any> {

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
                console.log('ERROR:geographicCoordinateTransform.callService');
                console.error(err);
                return reject(null);
            }
            
        })

        return result;

    }

}
