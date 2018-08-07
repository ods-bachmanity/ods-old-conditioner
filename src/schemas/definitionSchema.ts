import { ComposerDefSchema, FieldSchema, KeyValuePair, MapDefSchema, ActionDefSchema } from '.'

export class DefinitionSchema {
    public id: string
    public description: string
    public composers: Array<ComposerDefSchema> = []
    public parameters: Array<KeyValuePair>
    public schema: Array<FieldSchema>
    public mapStructure: any
    public maps: Array<MapDefSchema>
    public actions: Array<ActionDefSchema>
}
