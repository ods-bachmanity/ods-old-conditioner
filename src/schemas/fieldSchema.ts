import { TransformDefSchema } from '.'

export class FieldSchema {
    public field: string
    public ordinal?: number = 0
    public required?: boolean = false
    public exactmatch?: string = null
    public whitelist?: Array<string> = []
    public blacklist?: Array<string> = []
    public mustbeincase?: boolean = false
    public case: Array<TransformDefSchema> = []
    public transforms: Array<TransformDefSchema> = []
    public after: Array<TransformDefSchema> = []
}
