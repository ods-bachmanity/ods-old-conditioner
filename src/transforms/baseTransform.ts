import { DefinitionSchema, TransformDefSchema, CoordinateSchema } from '../schemas'
import { ExecutionContext } from '..'
import { Logger } from '../../common'

import * as _ from 'lodash'

export class BaseTransform {

    protected definition: DefinitionSchema
    
    public constructor(protected executionContext: ExecutionContext, 
        protected transformDef: TransformDefSchema,
        protected fieldName: string, protected correlationId: string, protected logger: Logger) {

            this.definition = executionContext.definition
        
    }

    public fx(): Promise<Boolean> {
        this.logger.warn(this.correlationId, `Base Transform Ran for ${this.fieldName}`, `BaseTransform.fx`)
        return Promise.resolve(true)
    }

    protected toGeoJSON(input: Array<CoordinateSchema>): any {

        if (!input || input.length <= 0) {
            return {}
        }
        const result: Array<Array<number>> = []
        input.forEach((item: CoordinateSchema) => {
            const point = []
            point.push(+item.Longitude)
            point.push(+item.Latitude)
            point.push(+item.Height)
            result.push(point)
        })
        // Push first point onto the end of the array to close GeoJSON polygon.
        let item: CoordinateSchema = input[0]
        if (result.length < 5) {
            let point = []
            point.push(+item.Longitude)
            point.push(+item.Latitude)
            point.push(+item.Height)
            result.push(point)
        }

        const wrapper = []
        wrapper.push(result)
        
        return {
          type: 'Feature',
          geometry: {
              type: 'Polygon',
              coordinates: wrapper,
          },
          properties: {}
        }

    }

    protected toWkt(input: Array<CoordinateSchema>): string {

        if (!input || input.length <= 0) {
            return ''
        }
        let output = 'POLYGON (('
        input.forEach((item: CoordinateSchema) => {
            if (output.length > 10) {
                output += ','
            }
            output += `${item.Longitude} ${item.Latitude}` // ${item.Height}`;
        });
        if (input.length < 5) {
            output += `,${input[0].Longitude} ${input[0].Latitude}` // ${input[0].Height}`;
        }
        output += '))'
        return output
        
    }

}
