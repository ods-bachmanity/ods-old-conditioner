import { ErrorHandler } from '../common'
import { ConditionerResponseSchema, ErrorSchema } from './schemas'
import { DefinitionService } from './definitionService';

export class ConditionerService {
    constructor(private errorHandler: ErrorHandler) {}

    public execute(definitionId: string, parameters: any, body: any): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema> = new Promise(async (resolve, reject) => {

            const response = new ConditionerResponseSchema()
            const definitionService = new DefinitionService(this.errorHandler)
            try {
                const definition = await definitionService.get(definitionId)
                if (!definition) {
                    throw new Error(`Invalid Definition Id`)
                }

                return resolve(response)
            }
            catch (err) {
                console.error(`ConditionerService.execute(${definitionId}).error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = this.errorHandler.errorResponse(`ConditionerService.execute(${definitionId})`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in ConditionerService`), err)
                return reject(errorSchema)
            }

        })

        return result

    }

}