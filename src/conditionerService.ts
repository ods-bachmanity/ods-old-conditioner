import { ErrorHandler } from '../common'
import { ConditionerResponseSchema, ConditionerExecutionSchema } from './schemas'
import { ExecutionContext } from './';

export class ConditionerService {
    
    constructor() {}

    public execute(definitionId: string, requestContext: any): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema> = new Promise(async (resolve, reject) => {

            try {

                const executionContext: ExecutionContext = new ExecutionContext(definitionId)
                const definition = await executionContext.initialize()
    
                if (definition.parameters) {
                    definition.parameters.forEach((item) => {
                        executionContext.addParameter(item.key, item.value, requestContext)
                    })
                }
    
                const activity = new ConditionerExecutionSchema()

                activity.raw = await executionContext.compose()

                activity.transformed = await executionContext.schema()

                activity.map = await executionContext.map()

                activity.actions = await executionContext.act()
                
                const response = await executionContext.respond()

                return resolve(response)

            }
            catch (err) {
                console.error(`ConditionerService.execute(${definitionId}).error: ${err}`)
                const errorSchema = ErrorHandler.errorResponse(`ConditionerService.execute(${definitionId})`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ConditionerService`), err)
                return reject(errorSchema)
            }

        })

        return result

    }

}