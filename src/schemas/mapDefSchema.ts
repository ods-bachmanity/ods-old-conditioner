export class MapDefSchema {
    public source: string
    public target: string
    public format?: string
    public translator?: any
    public removeIfNull: string = null
    public valueIfNull: any = null
}