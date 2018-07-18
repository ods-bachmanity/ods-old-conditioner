import { ConditionerResponseSchema } from '../app/schemas'
import { DefinitionService, ConditionerService, ExecutionContext } from '../app/';

const RunQueue = require('run-queue')
 
import * as _ from 'lodash'

export class BulkConditionerRoute {
    
    public constructor (private server: any) {}

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            try {
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
    
                if (!req.params || !req.params.definitionId) {
                    
                    res.send(400, 'Bad Request')
                    return next()

                }

                if (!req.body.files || req.body.files.length <= 0) {

                    res.send(400, {code: -1, message: 'Invalid Request Body. Missing files item.'})
                    return next()

                }

                const definitionId = req.params.definitionId
                
                const workitems = []
                const responses = []
                req.body.files.forEach((item) => {
                    const mockRequestBody = { body: item }
                    workitems.push(this.executeRoute(definitionId, mockRequestBody).then((workItemResponse) => {
                        responses.push(Object.assign({}, workItemResponse))
                    }))
                })

                const records = await Promise.all(workitems)
                const response = []
                responses.forEach((conditionedItem) => {
                    const output = {
                        contentId: conditionedItem.contentId,
                        fileUri: conditionedItem.fileUri,
                        fingerprint: conditionedItem.fingerprint,
                        version:  conditionedItem.version,
                        data: Object.assign({}, conditionedItem.data),
                        ods_code: conditionedItem.ods_code,
                        ods_errors: conditionedItem.ods_errors,
                        ods_definition: conditionedItem.ods_definition,
                        emc: conditionedItem.emc
                    }
                    response.push(output)
                })

                res.end(JSON.stringify(response))
                return next()
        
            }
            catch (err) {
                console.error(`BulkConditionerRoute.init.post(${path}).error: ${err}`)
                
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

    private executeRoute(definitionId: string, requestContext: any): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                // console.log(`Executing request ${JSON.stringify(requestContext.body,null,2)}`)
                const conditionerService = new ConditionerService()
                
                const records: ConditionerResponseSchema = await conditionerService.execute(definitionId, requestContext)
    
                return resolve(records)
    
            }
            catch (err) {
                console.error(`bulkConditionerRoute.executeRoute.error: ${err}`)
                return reject(err)
            }

        })

        return result

    }

}