import { DefinitionService } from '../src'
import { ErrorHandler, Logger } from '../common'

export class DefinitionRoute {
    
    private _definitionService = new DefinitionService(this.logger)

    public constructor (private server: any, private logger: Logger) {

    }

    public init (path: string) {

        this.server.get(path, async (req, res, next) => {

            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                if (!req.params || !req.params.id) {
                    res.send(400, 'Bad Request')
                    return next()
                }

                const id = req.params.id
                const result = await this._definitionService.get(id, req.id())
                res.send(200, result)
            
                return next()     
            }
            catch (err) {
                ErrorHandler.logError(req.id(), `DefinitionRoute.init.get(${path}).error:`, err)
                
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

}