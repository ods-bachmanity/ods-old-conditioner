export class ConditionerResponseSchema {
    public fileUri: string
    public fingerprint: string
    public version: string

    public ods_code: number = 0
    public ods_errors: Array<string> = []
    public ods_warnings: Array<string> = []
    public ods_definition: string = ''

    public data: any
    public httpStatus?: number = 200

    public emc?: any
    public raw?: any
    public transformed?: any

}
