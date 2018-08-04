import { ErrorHandler } from '../common'
import { ConditionerResponseSchema } from './schemas'
import { ExecutionContext } from './';

export class ConditionerService {
    
    constructor() {}

    public execute(definitionId: string, requestContext: any): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema> = new Promise(async (resolve, reject) => {

            try {

                const executionContext: ExecutionContext = new ExecutionContext(definitionId, requestContext)
    
                const activity = executionContext.execute()

                return resolve(activity)

            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(400, requestContext.body.fileuri, requestContext.body.fingerprint,
                    requestContext.body.version, err, [], definitionId, {})
                ErrorHandler.logError(`ConditionerService.execute(${definitionId}).error:`, handleError)
                return reject(handleError)
            }

        })

        return result

    }

}