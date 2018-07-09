import { ErrorHandler } from '../common'
import { ConditionerResponseSchema, ComposerDefSchema } from './schemas'
import { DefinitionService } from './definitionService';
import { ComposerFactory, BaseComposer } from './composers'
import { ExecutionContext } from './executionContext';

export class ConditionerService {
    private _definitionService = new DefinitionService()
    private _composerFactory = new ComposerFactory()

    constructor() {}

    public execute(definitionId: string, parameters: any, body: any): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema> = new Promise(async (resolve, reject) => {

            const response = new ConditionerResponseSchema()
            try {
                // GET DEFINITION FOR EXECUTION
                const definition = await this._definitionService.get(definitionId)
                if (!definition) {
                    throw new Error(`Invalid Definition Id`)
                }

                // VALIDATE REQUEST PARAMETERS AND BODY
                
                // CREATE EXECUTION CONTEXT
                const executionContext = new ExecutionContext(definition, parameters, body)

                // COMPOSE DOCUMENT SOURCES
                const composers: Array<any> = []
                definition.composers.forEach((composer: ComposerDefSchema) => {
                    const composerInstance: BaseComposer = this._composerFactory.CreateInstance(executionContext, composer)
                    if (composerInstance) {
                        composers.push(composerInstance.fx())
                    }
                })
                if (!composers) {
                    throw new Error('No composers found in definition')
                    return
                }
                executionContext.documents = await Promise.all(composers)
                response.data.documents = executionContext.documents
                return resolve(response)
            }
            catch (err) {
                console.error(`ConditionerService.execute(${definitionId}).error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = ErrorHandler.errorResponse(`ConditionerService.execute(${definitionId})`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ConditionerService`), err)
                return reject(errorSchema)
            }

        })

        return result

    }

}