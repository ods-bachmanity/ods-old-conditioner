import { ErrorHandler } from '../common'
import { DefinitionService } from '../app'

export class DefinitionRoute {
    
    private _definitionService = new DefinitionService(this.errorHandler)

    public constructor (private server: any, private errorHandler: ErrorHandler) {

    }

    public init (path: string) {

        this.server.get(path, async (req, res, next) => {

            try {
                if (!req.params || !req.params.id) {
                    res.send(400, 'Bad Request')
                    return next()
                }
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                const id = req.params.id
                console.log(`Searching for definition id ${id}`)
                const result = await this._definitionService.get(id)
                res.send(200, result)
            
                return next()     
            }
            catch (err) {
                console.error(err)
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

}