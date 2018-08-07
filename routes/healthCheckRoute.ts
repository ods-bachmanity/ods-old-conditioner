import { HealthCheckService } from '../common'
import { ErrorHandler, Logger } from '../common'

export class HealthCheckRoute {
    
    public constructor (private server: any, private logger: Logger) {}

    public init (path: string) {

        this.server.get(path, async (req, res, next) => {

            try {
            
                const result = await HealthCheckService.get()
                res.send(200, result)
            
                return next()
                
            }
            catch (err) {
                ErrorHandler.logError(req.id(), `HealthCheckRoute.init.get(${path}).error:`, err)

                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

}