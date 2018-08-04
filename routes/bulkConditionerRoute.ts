import { ConditionerResponseSchema } from '../src/schemas'
import { ConditionerService } from '../src';
import { ErrorHandler } from '../common'

export class BulkConditionerRoute {
    
    public constructor (private server: any) {}

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            let definitionId = ''
            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
    
                if (!req.params || !req.params.definitionId) {
                    
                    res.send(400, ErrorHandler.errorResponse(400,null,null,null,'Missing definition id parameter',[],null,{}))
                    return next()

                }

                if (!req.body.files || req.body.files.length <= 0) {

                    res.send(400, ErrorHandler.errorResponse(400,null,null,null,'Invalid Request Body. Missing files item',[],null,{}))
                    return next()

                }

                definitionId = req.params.definitionId
                
                const workitems = []
                const responses = []
                req.body.files.forEach((item) => {
                    const mockRequestBody = { body: item }
                    workitems.push(this.executeRoute(definitionId, mockRequestBody).then((workItemResponse) => {
                        responses.push(Object.assign({}, workItemResponse))
                    }))
                })

                await Promise.all(workitems)
                const response = []
                responses.forEach((conditionedItem) => {
                    const output:ConditionerResponseSchema = {
                        fileUri: conditionedItem.fileUri,
                        fingerprint: conditionedItem.fingerprint,
                        version:  conditionedItem.version,
                        ods_code: conditionedItem.ods_code,
                        ods_errors: conditionedItem.ods_errors,
                        ods_warnings: conditionedItem.ods_warnings,
                        ods_definition: conditionedItem.ods_definition,
                        data: Object.assign({}, conditionedItem.data)
                    }
                    response.push(output)
                })

                res.end(JSON.stringify(response))
                return next()
        
            }
            catch (err) {
                ErrorHandler.logError(`BulkConditionerRoute.init.post(${path}).error:`, err)
                const errorResponse = ErrorHandler.errorResponse(400,null,null,null,err,[],definitionId,null)
                res.send(errorResponse.httpStatus ? errorResponse.httpStatus : 400, errorResponse)
                return next()
            }

        })

    }

    private executeRoute(definitionId: string, requestContext: any): Promise<ConditionerResponseSchema> {

        const result: Promise<ConditionerResponseSchema> = new Promise(async (resolve, reject) => {

            try {

                const conditionerService = new ConditionerService()
                
                const records: ConditionerResponseSchema = await conditionerService.execute(definitionId, requestContext)
    
                return resolve(records)
    
            }
            catch (err) {
                const handledError = ErrorHandler.errorResponse(500, requestContext.body.fileuri, requestContext.body.fingerprint, requestContext.body.version,
                    err, [],definitionId, {})
                ErrorHandler.logError(`bulkConditionerRoute.executeRoute.error:`, handledError)
                return reject(handledError)
            }

        })

        return result

    }

}