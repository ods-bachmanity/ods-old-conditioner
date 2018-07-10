import { ErrorHandler } from '../common'
import { ConditionerResponseSchema, ComposerDefSchema, DefinitionSchema } from './schemas'
import { ExecutionContext } from './executionContext';

export class ConditionerService {
    
    constructor() {}

    public execute(executionContext: ExecutionContext): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema> = new Promise(async (resolve, reject) => {

            const response = new ConditionerResponseSchema()
            try {

                response.source = await executionContext.compose()

                response.transformed = await executionContext.schema()

                response.map = await executionContext.map()
                
                return resolve(response)

            }
            catch (err) {
                console.error(`ConditionerService.execute(${executionContext.definition.id}).error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = ErrorHandler.errorResponse(`ConditionerService.execute(${executionContext.definition.id})`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ConditionerService`), err)
                return reject(errorSchema)
            }

        })

        return result

    }

}