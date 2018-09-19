import { BaseComposer, ElasticSearchComposer, TestComposer, FieldComposer } from '.'
import { ComposerDefSchema } from '../schemas'
import { ExecutionContext } from '..'
import { Logger } from '../../common'

export class ComposerFactory {

    private _objects: any = {
        ElasticSearchComposer,
        TestComposer,
        FieldComposer
    }

    constructor(private logger: Logger) {}

    public CreateInstance(executionContext: ExecutionContext, composerDef: ComposerDefSchema, correlationId: string): BaseComposer {

        const className = composerDef.className
        const theClass = this._objects[className]
        if (!theClass) {
            this.logger.error(correlationId, `No record of object ${className}`, `ComposerFactory.CreateInstance`)
            return new BaseComposer(executionContext, composerDef, correlationId, this.logger)
        }
        return new theClass(executionContext, composerDef, correlationId, this.logger)

    }

}