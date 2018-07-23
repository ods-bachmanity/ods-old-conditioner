import { BaseTransform } from './'
import { CoordinateSchema } from '../schemas'
import { ErrorHandler } from '../../common'

export class CoordinateTransform extends BaseTransform {

    public fx(): Promise<boolean> {

        const result: Promise<boolean> = new Promise((resolve, reject) => {
            
            if (this.executionContext.transformed.Metadata.COORD_GEOJSON) return resolve(true)

            let footprint = this.executionContext.transformed.Footprint
            if (!footprint) {
                return reject(false)
            }

            footprint = footprint.replace(/[{()}]/g, '') // Remove parenthesis
            footprint = footprint.replace('POLYGON', '') // Remove WKT text
            const points = footprint.split(',')
            let output = []

            points.forEach((point) => { // e.g. 10 20 0
                if (point) {
                    const coords = point.split(' ')
                    let counter = 0
                    const record = {
                        Longitude: 0,
                        Latitude: 0,
                        Height: 0
                    }
                    coords.forEach((coord) => { // ex. 10
                        if (coord) {
                            if (counter === 0) {
                                record.Longitude = +coord
                            }
                            if (counter === 1) {
                                record.Latitude = +coord
                            }
                            counter++
                        }
                    })
                    output.push(record)
                }
            })

            this.executionContext.transformed.Metadata.COORD_GEOJSON = super.toGeoJSON(output || [])
            this.executionContext.transformed.Metadata.COORD_WKT = super.toWkt(output || [])
            this.executionContext.transformed.Metadata.COORD_TYPE = 'D'

            return resolve(true)
        })
        
        return result
    }

}
