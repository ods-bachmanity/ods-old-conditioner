import { ConditionerService } from '../app'
import { ConditionerResponseSchema } from '../app/schemas'
import { ExecutionContext } from '../app/executionContext';
import { DefinitionService } from '../app/definitionService';

export class ConditionerRoute {
    
    private _conditionerService = new ConditionerService()
    private _definitionService = new DefinitionService()

    public constructor (private server: any) {

    }

    public init (path: string) {

        this.server.post(path, async (req, res, next) => {

            try {
                if (!req.params || !req.params.definitionId) {
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

                // CREATE EXECUTION CONTEXT
                const executionContext = new ExecutionContext(definition)
                if (definition.parameters) {
                    definition.parameters.forEach((item) => {
                        executionContext.addParameter(item.key, item.value, req)
                    })
                }
                
                const result: ConditionerResponseSchema = await this._conditionerService.execute(executionContext)
                res.send(200, result)
            
                return next()
            }
            catch (err) {
                console.error(`ConditionerRoute.init.post(${path}).error: ${JSON.stringify(err, null, 2)}`)
                res.contentType = 'application/json'
                res.header('Content-Type', 'application/json')
                
                res.send(err.httpStatus ? err.httpStatus : 500, err)
                return next()
            }

        })

    }

}