export class ErrorSchema {
    public code: number = -1
    public httpStatus: number = 500
    public message: string = ''
    public debug?: string = ''
    public error?: any
}
