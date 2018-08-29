import { BaseTransform } from '.'
import { DefinitionSchema, TransformDefSchema, CoordinateSchema } from '../schemas'
import { ExecutionContext } from '..'
import { Logger, Utilities } from '../../common'
import { isNullOrUndefined } from 'util'

import * as _ from 'lodash'

export class IntegerTransform extends BaseTransform {

    private _utilities = new Utilities()

    public fx(): Promise<Boolean> {
        
        const result: Promise<boolean> = new Promise((resolve, reject) => {
            
            try {

                if (this._utilities.readValue(this.fieldName + '_CONVERTED', this.executionContext.transformed)) return resolve(true)

                const valueText = this._utilities.readValue(this.fieldName, this.executionContext.transformed)

                if(!valueText || isNaN(valueText)) {
                    const warnText = `Attempted to transform integer but field ${this.fieldName} did not exist or was not numeric.`
                    this.logger.warn(this.correlationId, warnText, `Integerransform`)
                    this.executionContext.warnings.push(warnText)
                    return resolve(true)
                }
                let newValue = parseInt(valueText)
                
                if (this.transformDef.args && this.transformDef.args.length > 0) {
                    // Validate Args first
                    let min = this.arg('min')
                    let max = this.arg('max')
                    let whitelist = this.arg('whitelist')

                    if (this.validateWhiteList(valueText, whitelist) || this.validateMinMax(newValue, min, max)) {
                        this._utilities.writeValue(this.fieldName + '_CONVERTED', newValue, this.executionContext.transformed)
                    }

                    return resolve(true)        
                }
                this._utilities.writeValue(this.fieldName + '_CONVERTED', newValue, this.executionContext.transformed)
                return resolve(true)
            }
            catch (ex) {

                this.logger.warn(this.correlationId, ex.message, `IntegerTransform`)
                this.executionContext.errors.push(ex.message)
                return reject(ex)

            }

        })
        
        return result

    }

    private validateMinMax(value: any, min: number, max: number): boolean {

        if (!value) return true

        if (!isNullOrUndefined(min) && !isNullOrUndefined(max)) {
            if (value < min || value > max) {
                this.log(`Attempted to transform integer but field ${this.fieldName} was either less than ${min} or greater than ${max}.`)
                return false
            }
            return true
        }
        if (!isNullOrUndefined(min)) {
            if (value < min ) {
                this.log(`Attempted to transform integer but field ${this.fieldName} was less than ${min}.`)
                return false
            }
            return true
        }
        if (!isNullOrUndefined(max)) {
            if (value > max) {
                this.log(`Attempted to transform integer but field ${this.fieldName} was greater than ${max}.`)
                return false
            }
            return true
        }
        return true

    }

    private validateWhiteList(value: string, whitelist: Array<any>): boolean {

        if (!value || !whitelist || whitelist.length <= 0) return false

        let indx = whitelist.indexOf(value)
        if (indx >= 0) return true

        const newValue = parseInt(value)
        indx = whitelist.indexOf(newValue)
        if (indx >= 0) return true

        return false

    }

    private log(message: string) {

        this.logger.warn(this.correlationId, message, `IntegerTransform`)
        this.executionContext.warnings.push(message)

    }
}
