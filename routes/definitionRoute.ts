import { DefinitionService } from '../src'
import { ErrorHandler } from '../common'

export class DefinitionRoute {
    
    private _definitionService = new DefinitionService()

    public constructor (private server: any) {

    }

    public init (path: string) {

        this.server.get(path, async (req, res, next) => {

            try {
                if (!req.params || !req.params.id) {
                    res.contentType = 'application/json'
                    res.header('Content-Type', 'application/json')
                    
                    res.send(400, 'Bad Request')
                    return next()
                }
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                const id = req.params.id
                const result = await this._definitionService.get(id)
                res.send(200, result)
            
                return next()     
            }
            catch (err) {
                ErrorHandler.logError(`DefinitionRoute.init.get(${path}).error:`, err)
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

}