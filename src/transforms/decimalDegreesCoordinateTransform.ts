import { BaseTransform } from '.'
import { CoordinateSchema } from '../schemas'
import { ErrorHandler } from '../../common'

export class DecimalDegreesCoordinateTransform extends BaseTransform {

    public fx(): Promise<Boolean> {

        const result: Promise<boolean> = new Promise((resolve, reject) => {

            try {

                if (this.executionContext.transformed.Metadata.COORD_GEOJSON) return resolve(true)

                // # Gather IGEOLO
                let nitfIGEOLO = this.executionContext.transformed.Metadata.NITF_IGEOLO
                if (nitfIGEOLO && nitfIGEOLO.length === 60) {
    
                    // # Put it into format for loading into object.
                    
                    // There are four 15 character coordinate strings in IGEOLO
                    // First 7 bytes make up Latitude portion (±dd.ddd)
                    // Last 8 bytes make up Longitude portion (±ddd.ddd)
                    // Break into pieces to create coordinate array for toGeoJSON and toWkt functions.
                    const LAT_LENGTH: number = 7
                    const LON_LENGTH: number = 8
                    const COORD_LENGTH: number  = 15
    
                    const arrCoords: Array<CoordinateSchema> = []
    
                    for( var i = 0; i <= 3; i++ )
                    {   // grab first 15 byte chunk
                        var coordinate = nitfIGEOLO.substr(i*COORD_LENGTH, COORD_LENGTH)
                        // grab raw lat
                        var rawSubLat = coordinate.substr(0,LAT_LENGTH)
                        // grab raw long
                        var rawSubLon = coordinate.substr(LAT_LENGTH,LON_LENGTH)
    
                        // format lat
                        var formattedLat = ''
                        if (rawSubLat[0] === '+') {
                            // Strip off the leading + symbol.
                            formattedLat = rawSubLat.substr(1,LAT_LENGTH - 1)
                        }
                        else if (rawSubLat[0] === '-') {
                            formattedLat = rawSubLat.substr(0,LAT_LENGTH)
                        }
                        else {
                            // this.te.errors.push('ERROR:decimal_degree_coordinateTransform.fx: ' + 'The ' + i + 'th latitude element of IGEOLO does not have + or - as the first byte.');
                            return reject(false)
                        }
    
                        // format lon
                        var formattedLon = ''
                        if (rawSubLon[0] === '+') {
                            // Strip off the leading + symbol.
                            formattedLon = rawSubLon.substr(1,LON_LENGTH - 1)
                        }
                        else if (rawSubLon[0] === '-') {
                            formattedLon = rawSubLon.substr(0,LON_LENGTH)
                        }
                        else {
                            // this.te.errors.push('ERROR:decimal_degree_coordinateTransform.fx: ' + 'The ' + i + 'th longitude element of IGEOLO does not have + or - as the first byte.');
                            return reject(false)
                        }
    
                        // Add to arrCoor array.
                        arrCoords.push({
                            Longitude: formattedLon,
                            Latitude: formattedLat,
                            Height: '0'
                        })
                    }
    
                    // # Create GeoJSON and wkt from parsed NITF_IGEOLO field.
                    if (arrCoords.length > 0) {
                        this.executionContext.transformed.Metadata.COORD_GEOJSON = super.toGeoJSON(arrCoords || [])
                        this.executionContext.transformed.Metadata.COORD_WKT = super.toWkt(arrCoords || [])
                        this.executionContext.transformed.Metadata.COORD_TYPE = 'D'
                        return resolve(true)
                    }
    
                }

                return reject(false)

            }
            catch (err) {
                ErrorHandler.logError(this.correlationId, `DecimalDegreesCoordinateTransform.fx().error:`, err)
                return reject(false)
            }

        })

        return result

    }

}