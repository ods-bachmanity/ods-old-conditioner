import { BaseTransform } from './'
import { CoordinateConversionRequestSchema } from '../schemas'

const rp = require('request-promise')

export class UTMMGRSCoordinateTransform extends BaseTransform {

    private _servicePath = process.env.COORDINATECONVERSIONSERVICEURL

    public fx(): Promise<boolean> {
        const temp: any = this.executionContext.transformed.Metadata

        // TODO: Remove log statement
        console.log('I am transforming UTM-MGRS coordinates.')

        const result: Promise<boolean> = new Promise((resolve, reject) => {

            try {

            }
            catch (err) {

            }
            if (this.executionContext.transformed.Metadata.COORD_GEOJSON) return resolve(true)

            // # Gather IGEOLO
            let nitfIGEOLO = temp.NITF_IGEOLO
            if (nitfIGEOLO && nitfIGEOLO.length === 60) {

                // # Put it into format for loading into object.
                
                // For ICORDS UTM-MGRS, there are four 15 character coordinate strings in IGEOLO (zzBJKeeeeennnnn)
                // The coordinate conversion service can take that full 15 character coordinate string as an input parameter.
                const COORD_LENGTH: number  = 15

                const myNewInstance = new CoordinateConversionRequestSchema()

                for( var i = 0; i <= 3; i++ )
                {   // grab first 15 byte chunk
                    var coordinate = nitfIGEOLO.substr(i*COORD_LENGTH, COORD_LENGTH)
                    // Add to sourceCoordinates array.
                    myNewInstance.sourceCoordinates.push({
                        sourceCoordinateString: coordinate
                    })
                }

                // # Pass to coordinate conversion service.
                this.callService(myNewInstance).then((body) => {

                    if (body && body.Coordinates) {
                        this.executionContext.transformed.Metadata.COORD_GEOJSON = super.toGeoJSON(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_WKT = super.toWkt(body.Coordinates || [])
                        this.executionContext.transformed.Metadata.COORD_TYPE = 'U'
                        console.log('UTM-MGRS Coordinate Transform WKT: ' + this.executionContext.transformed.Metadata.COORD_WKT)
                    }

                    return resolve(false);
                }, (err) => {
                    console.log('ERROR:utm_mgrs_coordinateTransform.fx:' + err);
                    // this.te.errors.push('ERROR:utm_mgrs_coordinateTransform.fx:' + err);
                    return reject(false);
                });
            } else {
                return resolve(false)
            }

        })


        return result;
    }

    private callService(conversionRequest): Promise<any> {

        const result = new Promise((resolve, reject) => {

            rp.post({
                "headers": { "content-type": "application/json" },
                "url": this._servicePath,
                "body": JSON.stringify(conversionRequest)
            }).then((body) => {
                const conversionResult = JSON.parse(body);
                return resolve(conversionResult);
            }).catch((err) => {
                console.log('ERROR:utm_mgrs_coordinateTransform.callService');
                console.error(err.message ? err.message : '');
                return reject(false);
            });
    
        })

        return result;
    }

}

class SourceCoordinate {
    sourceCoordinateString: string = '';
}