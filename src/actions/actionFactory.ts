import {
    BaseAction,
    ElasticUpdateAction
} from '.'
import { ActionDefSchema } from '../schemas'
import { ExecutionContext } from '..'
import { Logger } from '../../common'

export class ActionFactory {

    private _objects: any = {
        ElasticUpdateAction
    }

    constructor(private logger: Logger) {}

    public CreateInstance(executionContext: ExecutionContext, actionDef: ActionDefSchema, correlationId: string): BaseAction {

        const className = actionDef.className
        const theClass = this._objects[className]
        if (!theClass) {
            this.logger.error(correlationId, `No record of object ${className}`, `ActionFactory.CreateInstance`)
            return new BaseAction(executionContext, actionDef, correlationId, this.logger)
        }
        return new theClass(executionContext, actionDef, correlationId, this.logger)

    }
}
