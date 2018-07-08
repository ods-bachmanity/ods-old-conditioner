import { ConditionerResponseSchema } from './schemas'

export class ConditionerService {
    constructor() {}

    public execute(definitionId: string, parameters: any, body: any): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema|any> = new Promise(async (resolve, reject) => {

            try {
                const response = new ConditionerResponseSchema()
                response.message = `Conditioner is Up for definition ${definitionId}`
                return resolve(response)
            }
            catch (err) {
                console.error(`ConditionerService.get(${definitionId}).error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                return reject(err)
            }

        })

        return result

    }

}