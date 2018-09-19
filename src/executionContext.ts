import { DefinitionSchema, ComposerDefSchema, FieldSchema, MapDefSchema, ActionDefSchema, ConditionerResponseSchema } from './schemas'
import { ComposerFactory, BaseComposer } from './composers'
import { ErrorHandler, Utilities, Logger } from '../common'
import { TaskWorker, DefinitionService } from '.'

import * as config from 'config'
import * as _ from 'lodash'
import { isNullOrUndefined } from 'util';
import { ActionFactory } from './actions';

export class ExecutionContext {

    public raw: any = {}
    public transformed: any = {}
    public parameters: any = {}
    public mapped: any = {}
    public actions: any = {}
    public response: any = {}
    public warnings: Array<string> = []
    public errors: Array<string> = []

    private static _definitionService = null
    private _definition: DefinitionSchema = null
    private _utilities = new Utilities()

    public constructor(private definitionId: string, private requestContext: any, private logger: Logger) {
        // GET DEFINITION FOR EXECUTION
        if (!ExecutionContext._definitionService) {
            ExecutionContext._definitionService = new DefinitionService(this.logger)
        }
    }

    public get definition() {
        return this._definition
    }

    private async resolveDefinition(): Promise<DefinitionSchema> {

        const result: Promise<DefinitionSchema> = new Promise(async (resolve, reject) => {

            try {

                if (this._definition) {
                    return resolve(this._definition)
                }
                this._definition = await ExecutionContext._definitionService.get(this.definitionId, this.requestContext.id)
                if (!this._definition) {
                    throw new Error(`Invalid Definition Id`)
                }
    
                return resolve(this._definition)
    
            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(400,this.requestContext.body.fileuri,
                this.requestContext.body.fingerprint, this.requestContext.body.version, err, this.warnings, this.definitionId, {})
                ErrorHandler.logError(this.requestContext.id, `ExecutionContext.resolveDefinition.error:`, handleError)
                return reject(handleError)
            }

        })

        return result

    }

    private async initialize(): Promise<any> {

        const result = new Promise(async(resolve, reject) => {

            try {
                const definition = await this.resolveDefinition()
                
                this.parameters = {}
                this.logger.info(this.requestContext.id, 
                    `definition resolved id: ${definition.id} parameters:${definition.parameters.length} composers:${definition.composers.length} fields:${definition.schema.length} maps:${definition.maps.length} actions:${definition.actions.length}`,
                    `ExecutionContext.initialize`)
                if (definition.parameters) {
                    definition.parameters.forEach((item) => {
                        this.addParameter(item.key, item.value, this.requestContext)
                    })
                }
                this.raw = {}
                this.transformed = {}
                this.mapped = {}
                this.actions = {}
                this.response = {}
                this.warnings = []
                this.errors = []
        
                return resolve(true)
            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.requestContext.body.fileuri,
                    this.requestContext.body.fingerprint, this.requestContext.body.version, err, this.warnings,this.definitionId,{})
                ErrorHandler.logError(this.requestContext.id, `ExecutionContext.initialize.error:`, handleError)
                return reject(handleError)
            }
        })

        return result


    }

    public async execute(): Promise<any> {

        const result = new Promise(async(resolve, reject) => {

            try {
                await this.initialize()
                await this.compose()
                await this.schema()
                await this.map()
                await this.act()

                const response = await this.respond()
                return resolve(response)
            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.getParameterValue('fileuri'),
                this.getParameterValue('fingerprint'),this.getParameterValue('version'), err, this.warnings,this.definitionId,{})
                return reject(handleError)
            }

        })

        return result
    }

    public getParameterValue(key: string) {

        if (!this._definition) {
            return this.requestContext.body[key]
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
                    }
                }
            })
            return
        }
        const result = this._internalAddParameter(key, value, req)
    }

    private compose(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._definition) {
                    await this.initialize()
                }
                // COMPOSE DOCUMENT SOURCES
                const composerFactory = new ComposerFactory(this.logger)

                const composers: Array<any> = []
                this._definition.composers.forEach((composerDef: ComposerDefSchema) => {
                    const composerInstance: BaseComposer = composerFactory.CreateInstance(this, composerDef, this.requestContext.id)
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
                return resolve(true)

            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.getParameterValue('fileuri'),
                this.getParameterValue('fingerprint'),this.getParameterValue('version'), err, this.warnings,this.definitionId,{})
                ErrorHandler.logError(this.requestContext.id, `ExecutionContext.compose().error:`, handleError)
                return reject(handleError)
            }
        })

        return result
    }

    private schema(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {
                
                if (!this._definition) {
                    await this.initialize()
                }
                // EXECUTE DOCUMENT TRANFORMS
                if (!this._definition.schema || this._definition.schema.length <= 0) return resolve(JSON.parse(JSON.stringify(this.transformed)))

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
                            const taskWorker = new TaskWorker(this, field, this.requestContext.id, this.logger)
                            tasks.push(taskWorker.execute())
                        })
                        const response = await Promise.all(tasks)
                        this.transformed = _.merge(this.transformed, ...response)
                        currentOrdinal++    
                    }
                }
                return resolve(true)
            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.getParameterValue('fileuri'),
                this.getParameterValue('fingerprint'),this.getParameterValue('version'), err, this.warnings,this.definitionId,{})
                ErrorHandler.logError(this.requestContext.id, `ExecutionContext.schema().error:`, handleError)
                return reject(handleError)
            }
        })

        return result
    }

    private map(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._definition) {
                    await this.initialize()
                }
                const mapObject = JSON.parse(JSON.stringify(this._definition.mapStructure || {}))

                const maps = this._definition.maps
                if (maps && maps.length > 0) {

                    maps.forEach((map: MapDefSchema) => {

                        const value = this._utilities.readValue(map.source, this.transformed)
                        let wasNull = true
                        if (!isNullOrUndefined(value)) {
                            this._utilities.writeValue(map.target, value, mapObject)
                            wasNull = false
                        }
                        
                        if (map.valueIfNull && wasNull) {
                            this._utilities.writeValue(map.target, map.valueIfNull, mapObject)
                        }
                        if (map.removeIfNull && wasNull) {
                            this._utilities.removeElement(map.removeIfNull, mapObject)
                        }
                        if (!map.valueIfNull && !map.removeIfNull && wasNull) {
                            this._utilities.writeValue(map.target, null, mapObject)
                        }
                    })

                }
                this.mapped = JSON.parse(JSON.stringify(mapObject))

                return resolve(true)

            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.getParameterValue('fileuri'),
                this.getParameterValue('fingerprint'),this.getParameterValue('version'), err, this.warnings,this.definitionId,{})
                ErrorHandler.logError(this.requestContext.id, `ExecutionContext.map().error:`, handleError)
                return reject(handleError)
            }

        })

        return result

    }

    private act(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {
                
                if (!this._definition) {
                    await this.initialize()
                }
                const actions = this._definition.actions
                const actionFactory = new ActionFactory(this.logger)

                if (actions && actions.length > 0) {

                    const tasks: Array<any> = []
                    actions.forEach((actionDef: ActionDefSchema) => {
                        const action = actionFactory.CreateInstance(this, actionDef, this.requestContext.id)
                        tasks.push(action.fx())
                    })
                    const responses = await Promise.all(tasks)
                    this.actions = _.merge({}, ...responses)
                    
                    return resolve(true)

                } else {

                    return resolve(false)

                }
            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.getParameterValue('fileuri'),
                this.getParameterValue('fingerprint'),this.getParameterValue('version'), err, this.warnings,this.definitionId,{})
                ErrorHandler.logError(this.requestContext.id, `ExecutionContext.act().error:`, handleError)
                return reject(handleError)
            }

        })

        return result

    }

    private respond(): Promise<any> {

        const result = new Promise((resolve, reject) => {

            const response = new ConditionerResponseSchema()

            try {
                response.fileUri = this.getParameterValue('fileuri')
                response.fingerprint = this.getParameterValue('fingerprint')
                response.version = this.parameters['version']
                response.data = JSON.parse(JSON.stringify(this.mapped))
                response.ods_code = 0
                response.ods_warnings = JSON.parse(JSON.stringify(this.warnings))
                response.ods_errors = JSON.parse(JSON.stringify(this.errors))
                response.ods_definition = this.definitionId
                
                return resolve(response)
                
            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.getParameterValue('fileuri'),
                this.getParameterValue('fingerprint'),this.getParameterValue('version'), err, this.warnings,this.definitionId,{})
                ErrorHandler.logError(this.requestContext.id, `ExecutionContext.respond.error:`, handleError)
                return reject(handleError)
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