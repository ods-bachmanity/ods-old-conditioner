import { ConditionerResponseSchema } from '../src/schemas'
import { ConditionerService } from '../src';
import { ErrorHandler } from '../common'

export class ConditionerRoute {
    
    public constructor (private server: any) {}

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            let definitionId = ''
            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')

                if (!req.params || !req.params.definitionId) {                    
                    res.send(400, ErrorHandler.errorResponse(400,req.body.fileuri, req.body.fingerprint, req.body.version, 'Invalid Definition Id',[],req.params.definition,{}))
                    return next()
                }
                definitionId = req.params.definitionId
                const result = await this.executeRoute(definitionId, req)
                
                res.send(200, result)
            
                return next()
            }
            catch (err) {
                ErrorHandler.logError(`ConditionerRoute.init.post(${path}).error:`, err)
                const errorResponse = ErrorHandler.errorResponse(400,null,null,null,err,[],definitionId,null)
                res.send(errorResponse.httpStatus ? errorResponse.httpStatus : 400, errorResponse)
                return next()
            }

        })

    }

    public async executeRoute(definitionId: string, requestContext: any): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {
    
                const conditionerService = new ConditionerService()
                
                const records: ConditionerResponseSchema = await conditionerService.execute(definitionId, requestContext)
    
                return resolve(records)
    
            }
            catch (err) {
                const handledError = ErrorHandler.errorResponse(500, requestContext.body.fileuri, requestContext.body.fingerprint, requestContext.body.version,
                    err, [],definitionId, {})
                    ErrorHandler.logError(`conditionerRoute.executeRoute.error:`, handledError)
                    return reject(handledError)
            }

        })

        return result

    }

}