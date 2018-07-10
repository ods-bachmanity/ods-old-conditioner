import { DefinitionSchema, ConditionerResponseSchema, ComposerDefSchema } from './schemas'
import { ComposerFactory, BaseComposer } from './composers'
import { ErrorHandler } from '../common'

import * as config from 'config'
import * as _ from 'lodash'

export class ExecutionContext {

    public source: any = {}
    public response = new ConditionerResponseSchema()
    public parameters: any = {}

    private _composerFactory = new ComposerFactory()

    public constructor(public definition: DefinitionSchema) {}

    public addParameter(key: string, value: string, req?: any) {

        if (value.indexOf('||') >= 0) {
            // There are multiple options available to set value
            const values = value.split('||')
            let isValueSet = false
            values.forEach((value) => {
                if (!isValueSet) {
                    const result = this._internalAddParameter(key, value, req)
                    if (result) {
                        isValueSet = true
                        console.log(`Setting ${key} to ${result}`)
                    }
                }
            })
            return
        }
        const result = this._internalAddParameter(key, value, req)
        console.log(`Setting ${key} to ${result}`)
    }

    public compose(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {
                // COMPOSE DOCUMENT SOURCES
                const composers: Array<any> = []
                this.definition.composers.forEach((composerDef: ComposerDefSchema) => {
                    const composerInstance: BaseComposer = this._composerFactory.CreateInstance(this, composerDef)
                    if (composerInstance) {
                        composers.push(composerInstance.fx())
                    }
                })
                if (!composers) {
                    throw new Error('No composers found in definition')
                    return
                }
                const documents = await Promise.all(composers)
                this.source = _.merge({}, ...documents)
                return resolve(Object.assign({}, this.source))
            }
            catch (err) {
                console.error(`ExecutionContext.compose().error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = ErrorHandler.errorResponse(`ExecutionContext.compose().error`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ExecutionContext`), err)
                return reject(errorSchema)
            }
        })

        return result
    }

    private _internalAddParameter(key: string, value: string, req: any): string|any {

        if (!value.startsWith('req.') && !value.startsWith('.env.') && !value.startsWith('config.')) {
            this.parameters[key] = value
            return (value)
        }
        if (value.startsWith('req.params.')) {
            if (!req || !req.params) return
            const realKey = value.replace('req.params.', '')
            this.parameters[key] = req.params[realKey]
            return (req.params[realKey])
        }
        if (value.startsWith('req.body.')) {
            if (!req || !req.body) return
            const realKey = value.replace('req.body.', '')
            this.parameters[key] = req.body[realKey]            
            return (req.body[realKey])
        }
        if (value.startsWith('.env.')) {
            if (!process || !process.env) return
            const realKey = value.replace('.env.', '')
            this.parameters[key] = process.env[realKey]
            return (process.env[realKey])
        }
        if (value.startsWith('config.')) {
            if (!config) return
            const realKey = value.replace('config.', '')
            this.parameters[key] = config[realKey]
            return (config[realKey])
        }

    }
}