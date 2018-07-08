import { ErrorHandler } from '../common'
import { ConditionerService } from '../app'
import { ConditionerResponseSchema } from '../app/schemas'

export class ConditionerRoute {
    
    private _conditionerService = new ConditionerService(this.errorHandler)

    public constructor (private server: any, private errorHandler: ErrorHandler) {

    }

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            try {
                if (!req.params || !req.params.definitionId) {
                    res.send(400, 'Bad Request')
                    return next()
                }
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                const id = req.params.definitionId
                console.log(`Conditioning fileuri for definition id ${id}`)
                const result: ConditionerResponseSchema = await this._conditionerService.execute(id, req.params, req.body)
                res.send(200, result)
            
                return next()
            }
            catch (err) {
                console.error(`ConditionerRoute.init.post(${path}): ${err}`)
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

}