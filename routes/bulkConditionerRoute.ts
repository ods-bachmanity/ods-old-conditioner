import { ConditionerService } from '../app'
import { ConditionerResponseSchema } from '../app/schemas'
import { ExecutionContext } from '../app/executionContext';
import { DefinitionService } from '../app/definitionService';

import * as _ from 'lodash'

export class BulkConditionerRoute {
    
    private _definitionService = new DefinitionService()

    public constructor (private server: any) {

    }

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            try {
                if (!req.params || !req.params.definitionId || !req.body.files) {
                    res.contentType = 'application/json'
                    res.header('Content-Type', 'application/json')
                    
                    res.send(400, 'Bad Request')
                    return next()
                }
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                const id = req.params.definitionId
                
                // GET DEFINITION FOR EXECUTION
                const definition = await this._definitionService.get(id)
                if (!definition) {
                    throw new Error(`Invalid Definition Id`)
                }

                if (!req.body.files || req.body.files.length <= 0) {
                    res.send(400, {code: -1, message: 'Invalid Request Body. Missing files item.'})
                    return next()
                }

                const workItems = []
                req.body.files.forEach((item) => {
                    // CREATE EXECUTION CONTEXT
                    const executionContext = new ExecutionContext(definition)
                    if (definition.parameters) {
                        const mockRequestBody = { body: item }
                        definition.parameters.forEach((item) => {
                            executionContext.addParameter(item.key, item.value, mockRequestBody)
                        })
                    }
                    const conditionerService = new ConditionerService()

                    workItems.push(conditionerService.execute(executionContext))
                })
                const result: Array<ConditionerResponseSchema> = await Promise.all(workItems)
                res.send(200, result)
            
                return next()
            }
            catch (err) {
                console.error(`BulkConditionerRoute.init.post(${path}).error: ${JSON.stringify(err, null, 2)}`)
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

}