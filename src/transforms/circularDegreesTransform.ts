import { BaseTransform } from '.'
import { DefinitionSchema, TransformDefSchema, CoordinateSchema } from '../schemas'
import { ExecutionContext } from '..'
import { Logger, Utilities } from '../../common'

import * as _ from 'lodash'

export class CircularDegreesTransform extends BaseTransform {

    private _utilities = new Utilities()

    public fx(): Promise<Boolean> {
        
        const result: Promise<boolean> = new Promise((resolve, reject) => {
            
            if (this._utilities.readValue(this.fieldName + '_CONVERTED', this.executionContext.transformed)) return resolve(true)

            const valueText = this._utilities.readValue(this.fieldName, this.executionContext.transformed)
            if(!valueText || isNaN(valueText)) {
                const warnText = `Attempted to transform Circular Degrees but field ${this.fieldName} did not exist or was not numeric.`
                this.logger.warn(this.correlationId, warnText, `CircularDegreesTransform`)
                this.executionContext.warnings.push(warnText)
                return resolve(true)
            }
            let newValue = parseFloat(valueText)
            if (newValue < 0 || newValue >= 360) {
                const warnText = `Attempted to transform Circular Degrees but field ${this.fieldName} was either less than 0 or greater than or equal to 360.`
                this.logger.warn(this.correlationId, warnText, `CircularDegreesTransform`)
                this.executionContext.warnings.push(warnText)
                return resolve(true)
            }

            this._utilities.writeValue(this.fieldName + '_CONVERTED', newValue, this.executionContext.transformed)

            console.log(`*****************************\n`)
            console.log(JSON.stringify(this.executionContext.transformed, null, 2) + '\n')
            console.log(`*****************************\n`)
            return resolve(true)

        })
        
        return result

    }

}
