import { SwaggerService } from '../common'
import { ErrorHandler, Logger } from '../common'

export class SwaggerRoute {
    
    public constructor (private server: any, private logger: Logger) {}

    public init (path: string) {

        const swaggerService = new SwaggerService(this.server)

        this.server.get(path, async (req, res, next) => {

            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
            
                const result = await swaggerService.get()
                res.send(200, result)
            
                return next();        
            }
            catch (err) {
                ErrorHandler.logError(req.id(), `SwaggerRoute.init.get(${path}).error:`, err)
                
                res.send(500, err)
                return next()
            }

        })

    }

}