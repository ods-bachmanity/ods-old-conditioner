import { HealthCheckService } from '../common'

export class HealthCheckRoute {
    
    public constructor (private server: any) {}

    public init (path: string) {

        this.server.get(path, async (req, res, next) => {

            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
            
                const result = await HealthCheckService.get()
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