import { ErrorHandler } from '../common'
import { ConditionerService } from '../app'

export class ConditionerRoute {
    
    private _conditionerService = new ConditionerService()

    public constructor (private server: any, private errorHandler: ErrorHandler) {

    }

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            try {
                if (!req.params || !req.params.id) {
                    res.send(400, 'Bad Request')
                    return next()
                }
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                const id = req.params.id
                console.log(`Conditioning fileuri for definition id ${id}`)
                const result = await this._conditionerService.execute(id, req.params, req.body)
                res.send(200, result)
            
                return next()     
            }
            catch (err) {
                console.error(err)
                res.send(500, this.errorHandler.errorMessage('DefinitionRoute:Error'))
                return next()
            }

        })

    }

}