import { DefinitionSchema, ConditionerResponseSchema } from './schemas'

export class ExecutionContext {

    public documents: Array<any> = []
    public response = new ConditionerResponseSchema()

    public constructor(public definition: DefinitionSchema, public parameters: any, public body: any) {}


}