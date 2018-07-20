import { BaseComposer, ElasticSearchComposer, TestComposer } from '.'
import { ComposerDefSchema } from '../schemas'
import { ExecutionContext } from '../'

export class ComposerFactory {

    private _objects: any = {
        ElasticSearchComposer,
        TestComposer
    }

    constructor() {}

    public CreateInstance(executionContext: ExecutionContext, composerDef: ComposerDefSchema): BaseComposer {

        const className = composerDef.className
        const theClass = this._objects[className]
        if (!theClass) {
            console.error(`No record of object ${className}`)
            return new BaseComposer(executionContext, composerDef)
        }
        return new theClass(executionContext, composerDef)

    }

}