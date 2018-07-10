import { ComposerDefSchema } from './'

export class DefinitionSchema {
    public id: string
    public description: string
    public references: DefinitionReferenceSchema
    public composers: Array<ComposerDefSchema> = []
    public parameters: Array<KeyValuePair>
}

export class DefinitionReferenceSchema {
    
}

export class KeyValuePair {
    public key: string
    public value: any
}