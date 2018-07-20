import { ConditionerResponseSchema } from '../src/schemas'
import { ConditionerService } from '../src';

export class ConditionerRoute {
    
    public constructor (private server: any) {}

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            try {
                if (!req.params || !req.params.definitionId) {
                    res.contentType = 'application/json'
                    res.header('Content-Type', 'application/json')
                    
                    res.send(400, 'Bad Request')
                    return next()
                }
                const definitionId = req.params.definitionId
                const result = await this.executeRoute(definitionId, req)

                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                res.send(200, result)
            
                return next()
            }
            catch (err) {
                console.error(`ConditionerRoute.init.post(${path}).error: ${err}`)

                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

    public async executeRoute(definitionId: string, requestContext: any): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {
    
                const conditionerService = new ConditionerService()
                
                const records: ConditionerResponseSchema = await conditionerService.execute(definitionId, requestContext)
    
                return resolve(records)
    
            }
            catch (err) {
                console.error(`conditionerRoute.executeRoute.error: ${err}`)
                return reject(err)
            }

        })

        return result

    }

}