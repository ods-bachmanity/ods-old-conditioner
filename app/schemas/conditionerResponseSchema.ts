export class ConditionerResponseSchema {
    public fileUri: string
    public fingerprint: string
    public version: string
    public contentId: string

    public data: any
    public ods_code: number = 0
    public ods_errors: Array<string> = []
    public ods_definition: string = ''

    public emc?: any
    public raw?: any
    public transformed?: any

}
