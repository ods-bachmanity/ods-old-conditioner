import { SwaggerService } from '../common'

export class SwaggerRoute {
    
    public constructor (private server: any) {}

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
                console.error(err)
                res.send(500, err)
                return next()
            }

        })

    }

}