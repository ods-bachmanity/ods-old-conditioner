import { ErrorHandler } from '../common'
import { ConditionerResponseSchema, ConditionerExecutionSchema } from './schemas'
import { ExecutionContext } from './executionContext';
import { exec } from 'child_process';

export class ConditionerService {
    
    constructor() {}

    public execute(executionContext: ExecutionContext): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema> = new Promise(async (resolve, reject) => {

            const activity = new ConditionerExecutionSchema()
            try {

                console.log(`************* ConditionerService.compose ************* `)
                activity.source = await executionContext.compose()

                console.log(`************* ConditionerService.schema ************* `)
                activity.transformed = await executionContext.schema()

                console.log(`************* ConditionerService.map ************* `)
                activity.map = await executionContext.map()

                console.log(`************* ConditionerService.act ************* `)
                activity.actions = await executionContext.act()
                
                console.log(`************* ConditionerService.respond ************* `)
                return resolve(this.composeResponse(Object.assign({}, activity), Object.assign({}, executionContext)))

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

    private composeResponse(activity: ConditionerExecutionSchema, executionContext: ExecutionContext): ConditionerResponseSchema {

        const response = new ConditionerResponseSchema()

        response.fileUri = activity.transformed.FileUri
        response.fingerprint = activity.transformed.FingerPrint
        response.version = executionContext.parameters['version']
        response.contentId = activity.transformed.FingerPrint
        response.data = activity.map
        response.ods_code = activity.code
        response.ods_errors = []
        response.ods_definition = executionContext.definition.id
        response.emc = activity.actions
        // response.transformed = activity.transformed
        
        return response

    }

}