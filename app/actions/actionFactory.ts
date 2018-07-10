import {
    BaseAction,
    ElasticUpdateAction
} from './'
import { ActionDefSchema } from '../schemas'
import { ExecutionContext } from '../'

export class ActionFactory {

    private _objects: any = {
        ElasticUpdateAction
    }

    constructor() {}

    public CreateInstance(executionContext: ExecutionContext, actionDef: ActionDefSchema): BaseAction {

        const className = actionDef.className
        const theClass = this._objects[className]
        if (!theClass) {
            console.error(`No record of object ${className}`)
            return new BaseAction(executionContext, actionDef)
        }
        return new theClass(executionContext, actionDef)

    }
}
