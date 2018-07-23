import { DefinitionSchema, ComposerDefSchema, FieldSchema, MapDefSchema, ActionDefSchema, ConditionerResponseSchema } from './schemas'
import { ComposerFactory, BaseComposer } from './composers'
import { ErrorHandler, Utilities } from '../common'
import { TaskWorker, DefinitionService } from './'

import * as config from 'config'
import * as _ from 'lodash'
import { isNullOrUndefined } from 'util';
import { ActionFactory } from './actions';

export class ExecutionContext {

    public raw: any = {}
    public transformed: any = {}
    public parameters: any = {}
    public mapped: any = {}
    public data: any = {}
    public actions: any = {}
    public response: any = {}

    private static _definitionService = new DefinitionService()
    private _definition: DefinitionSchema = null
    private _utilities = new Utilities()

    public constructor(private definitionId: string) {
        // GET DEFINITION FOR EXECUTION
    }

    public get definition() {
        return this._definition
    }

    private async resolveDefinition() {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (this._definition) return resolve(this._definition)
                this._definition = await ExecutionContext._definitionService.get(this.definitionId)
                if (!this._definition) {
                    throw new Error(`Invalid Definition Id`)
                }
    
                return resolve(this._definition)
    
            }
            catch (err) {
                ErrorHandler.logError(`ExecutionContext.resolveDefinition.error:`, err)
                return reject(`Error retrieving Definition ${this.definitionId}`)
            }

        })

        return result

    }

    public async initialize(): Promise<any> {

        return this.resolveDefinition()

    }

    public getParameter(key: string) {

        if (!this._definition) {
            throw new Error(`Attempted to execute getParameter method without initializing ExecutionContext`)
        }
        const result = this.parameters[key]
        return result

    }

    public addParameter(key: string, value: string, req?: any) {

        if (!this._definition) {
            throw new Error(`Attempted to execute getParameter method without initializing ExecutionContext`)
        }

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

                if (!this._definition) {
                    await this.initialize()
                }
                // COMPOSE DOCUMENT SOURCES
                const composerFactory = new ComposerFactory()

                const composers: Array<any> = []
                this._definition.composers.forEach((composerDef: ComposerDefSchema) => {
                    const composerInstance: BaseComposer = composerFactory.CreateInstance(this, composerDef)
                    if (composerInstance) {
                        composers.push(composerInstance.fx())
                    }
                })

                if (!composers) {
                    throw new Error('No composers found in definition')
                }

                const documents = await Promise.all(composers)

                this.raw = _.merge({}, ...documents)
                this.transformed = _.cloneDeep(this.raw)
                return resolve(Object.assign({}, this.raw))

            }
            catch (err) {
                ErrorHandler.logError(`ExecutionContext.compose().error:`, err)
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
                
                if (!this._definition) {
                    await this.initialize()
                }
                // EXECUTE DOCUMENT TRANFORMS
                if (!this._definition.schema || this._definition.schema.length <= 0) return resolve(Object.assign({}, this.transformed))

                const maxOrdinal = 10
                let keepGoing = true
                let currentOrdinal = 0

                while (keepGoing && currentOrdinal <= maxOrdinal) {
                    const tasks: Array<any> = []
                    const fields = _.filter(this._definition.schema, {ordinal: currentOrdinal})
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
                ErrorHandler.logError(`ExecutionContext.schema().error:`, err)
                const errorSchema = ErrorHandler.errorResponse(`ExecutionContext.schema().error`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ExecutionContext`), err)
                return reject(errorSchema)
            }
        })

        return result
    }

    public map(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._definition) {
                    await this.initialize()
                }
                const mapObject = Object.assign({}, this._definition.mapStructure || {})

                const maps = this._definition.maps
                if (maps && maps.length > 0) {

                    maps.forEach((map: MapDefSchema) => {

                        const value = this._utilities.readValue(map.source, this.transformed)
                        if (!isNullOrUndefined(value)) {
                            this._utilities.writeValue(map.target, value, mapObject)
                        }
                    })

                }
                this.mapped = Object.assign({}, mapObject)

                return resolve(this.mapped)

            }
            catch (err) {
                ErrorHandler.logError(`ExecutionContext.map().error:`, err)
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
                
                if (!this._definition) {
                    await this.initialize()
                }
                const actions = this._definition.actions
                const actionFactory = new ActionFactory()

                if (actions && actions.length > 0) {

                    const tasks: Array<any> = []
                    actions.forEach((actionDef: ActionDefSchema) => {
                        const action = actionFactory.CreateInstance(this, actionDef)
                        tasks.push(action.fx())
                    })
                    const responses = await Promise.all(tasks)
                    this.actions = _.merge({}, ...responses)
                    
                    return resolve(Object.assign({}, this.actions))

                } else {

                    return resolve({})

                }
            }
            catch (err) {
                ErrorHandler.logError(`ExecutionContext.act().error:`, err)
                const errorSchema = ErrorHandler.errorResponse(`ExecutionContext.act().error`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ExecutionContext`), err)
                return reject(errorSchema)
            }

        })

        return result

    }

    public respond(): Promise<any> {

        const result = new Promise((resolve, reject) => {

            const response = new ConditionerResponseSchema()

            try {
                //response.fileUri = activity.transformed.FileUri
                //response.fingerprint = activity.transformed.FingerPrint
                response.version = this.parameters['version']
                //response.contentId = activity.transformed.FingerPrint
                response.data = JSON.parse(JSON.stringify(this.mapped))
                //response.ods_code = activity.code
                //response.ods_errors = []
                //response.ods_definition = executionContext.definition.id
                //response.emc = Object.assign({}, activity.actions)
                // response.transformed = activity.transformed
                
                return resolve(response)
                
            }
            catch (err) {
                ErrorHandler.logError(`ExecutionContext.respond.error:`, err)
                return reject(response)
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