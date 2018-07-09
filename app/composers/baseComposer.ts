import { DefinitionSchema, ComposerDefSchema } from '../schemas'
export class BaseComposer {

    protected definition: DefinitionSchema

    public constructor(protected executionContext: any, 
        protected composerDef: ComposerDefSchema) {
            this.definition = executionContext.definition
    }

    public fx(): Promise<any> {
        console.log('BaseComposer Ran')
        return Promise.resolve({})
    }

}