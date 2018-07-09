import { ComposerDefSchema } from './'

export class DefinitionSchema {
    public id: string
    public description: string
    public references: DefinitionReferenceSchema
    public composers: Array<ComposerDefSchema> = []
}

export class DefinitionReferenceSchema {
    
}
