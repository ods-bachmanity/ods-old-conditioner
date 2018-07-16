import { DefinitionSchema, ComposerDefSchema, FieldSchema, MapDefSchema, ActionDefSchema } from './schemas'
import { ComposerFactory, BaseComposer } from './composers'
import { ErrorHandler, Utilities } from '../common'
import { TaskWorker } from './'

import * as config from 'config'
import * as _ from 'lodash'
import { isNullOrUndefined } from 'util';
import { ActionFactory } from './actions';

export class ExecutionContext {

    public raw: any = {}
    public transformed: any = {}
    public parameters: any = {}
    public mapped: any = {}

    private _composerFactory = new ComposerFactory()
    private _actionFactory = new ActionFactory()

    public constructor(public definition: DefinitionSchema) {}

    public getParameter(key: string): any {

        const result = this.parameters[key]
        return result
        
    }
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
                        // console.log(`Setting ${key} to ${result}`)
                    }
                }
            })
            return
        }
        const result = this._internalAddParameter(key, value, req)
        // console.log(`Setting ${key} to ${result}`)
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
                this.raw = _.merge({}, ...documents)
                this.transformed = _.cloneDeep(this.raw)
                return resolve(Object.assign({}, this.raw))
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

    public schema(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {
                // EXECUTE DOCUMENT TRANFORMS
                if (!this.definition.schema || this.definition.schema.length <= 0) return resolve(Object.assign({}, this.transformed))

                const maxOrdinal = 10
                let keepGoing = true
                let currentOrdinal = 0

                while (keepGoing && currentOrdinal <= maxOrdinal) {
                    const tasks: Array<any> = []
                    const fields = _.filter(this.definition.schema, {ordinal: currentOrdinal})
                    if (!fields) {
                        currentOrdinal = maxOrdinal + 1
                        keepGoing = false
                    } else {
                        fields.forEach((field: FieldSchema) => {
                            const taskWorker = new TaskWorker(this, field)
                            tasks.push(taskWorker.execute())
                        })
                        const response = await Promise.all(tasks)
                        this.transformed = _.merge(this.transformed, ...response)
                        currentOrdinal++    
                    }
                }
                return resolve(Object.assign({}, this.transformed))
            }
            catch (err) {
                console.error(`ExecutionContext.schema().error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = ErrorHandler.errorResponse(`ExecutionContext.schema().error`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ExecutionContext`), err)
                return reject(errorSchema)
            }
        })

        return result
    }

    public map(): Promise<any> {

        const result = new Promise((resolve, reject) => {

            try {

                const mapObject = Object.assign({}, this.definition.mapStructure || {})

                const maps = this.definition.maps
                if (maps && maps.length > 0) {

                    maps.forEach((map: MapDefSchema) => {

                        const value = Utilities.readValue(map.source, this.transformed)
                        if (!isNullOrUndefined(value)) {
                            Utilities.writeValue(map.target, value, mapObject)
                        }
                    })

                }
                this.mapped = Object.assign({}, mapObject)
                return resolve(this.mapped)

            }
            catch (err) {
                console.error(`ExecutionContext.map().error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = ErrorHandler.errorResponse(`ExecutionContext.map().error`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ExecutionContext`), err)
                return reject(errorSchema)
            }

        })

        return result

    }

    public act(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                const actions = this.definition.actions
                if (actions && actions.length > 0) {

                    const tasks: Array<any> = []
                    actions.forEach((actionDef: ActionDefSchema) => {
                        const action = this._actionFactory.CreateInstance(this, actionDef)
                        tasks.push(action.fx())
                    })
                    const response = await Promise.all(tasks)
                    return resolve(Object.assign({}, response))
                } else {
                    return resolve()
                }
            }
            catch (err) {
                console.error(`ExecutionContext.act().error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = ErrorHandler.errorResponse(`ExecutionContext.act().error`,
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