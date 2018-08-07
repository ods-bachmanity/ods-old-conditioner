import { ConditionerResponseSchema } from '../src/schemas'
import { ConditionerService } from '../src';
import { ErrorHandler, Logger } from '../common'

export class ConditionerRoute {
    
    public constructor (private server: any, private logger: Logger) {}

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            let definitionId = ''
            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')

                if (!req.params || !req.params.definitionId) {         
                    this.logger.warn(req.id(), `Invalid Definition Id`, `ConditionerRoute.init.post`)           
                    res.send(400, ErrorHandler.errorResponse(400,req.body.fileuri, req.body.fingerprint, req.body.version, 'Invalid Definition Id',[],req.params.definition,{}))
                    return next()
                }
                definitionId = req.params.definitionId
                const result = await this.executeRoute(definitionId, req)
                
                res.send(200, result)
            
                return next()
            }
            catch (err) {
                ErrorHandler.logError(req.id(), `ConditionerRoute.init.post(${path}).error:`, err)
                const errorResponse = ErrorHandler.errorResponse(400,null,null,null,err,[],definitionId,null)
                res.send(errorResponse.httpStatus ? errorResponse.httpStatus : 400, errorResponse)
                return next()
            }

        })

    }

    public async executeRoute(definitionId: string, requestContext: any): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {
    
                const conditionerService = new ConditionerService(this.logger)
                
                const records: ConditionerResponseSchema = await conditionerService.execute(definitionId, requestContext)
    
                return resolve(records)
    
            }
            catch (err) {
                const handledError = ErrorHandler.errorResponse(500, requestContext.body.fileuri, requestContext.body.fingerprint, requestContext.body.version,
                    err, [],definitionId, {})
                    ErrorHandler.logError(requestContext.id(), `conditionerRoute.executeRoute.error:`, handledError)
                    return reject(handledError)
            }

        })

        return result

    }

}