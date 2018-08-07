import { ConditionerResponseSchema, ILogger } from '../src/schemas'

export class ErrorHandler {

    private static _logger: ILogger = null

    constructor (private logger: ILogger) {
        ErrorHandler._logger = logger
    }

    init (server: any) {

        server.on('InternalError', (req, res, err, next) => {
            ErrorHandler.logError(`Internal Error`, err)
            res.contentType = 'application/json'
            res.header('Content-Type', 'application/json')
            res.send(500, ErrorHandler.internalErrorResponse(err))
            return next()
        })

        server.on('InternalServerError', (req, res, err, next) => {
            ErrorHandler.logError(`Internal Server Error`, err)
            res.contentType = 'application/json'
            res.header('Content-Type', 'application/json')
            res.send(500, ErrorHandler.internalErrorResponse(err))
            return next()
        })

        server.on('restifyError', (req, res, err, next) => {
            ErrorHandler.logError(`Restify Error`, err)
            res.contentType = 'application/json'
            res.header('Content-Type', 'application/json')
            res.send(500, ErrorHandler.internalErrorResponse(err))
            return next()
        })

        server.on('uncaughtException', (req, res, err, next) => {
            ErrorHandler.logError(`Uncaught Exception`, err)
            res.contentType = 'application/json'
            res.header('Content-Type', 'application/json')
            res.send(500, ErrorHandler.internalErrorResponse(err))
            return next()
        })

    }

    public static logError(source: string, err: any) {

        const now = new Date()
        const timeString = `${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()}:${now.getUTCMilliseconds()}`
        if (ErrorHandler._logger) {
            ErrorHandler._logger.error(`${timeString}:> ERROR IN ${source} ${this.errorText(err)}`)
        }
        return

    }

    public static errorText(err: any) {

        if ((typeof err === "object") && (err !== null)) {
            if (err.ods_errors && err.ods_errors.length > 0) {
                return `${err.ods_errors.toString()}`
            }
            if (err.message) return err.message
            return `${JSON.stringify(err)}`
        }
        return `${err}`

    }

    public static errorResponse(httpStatusCode: number, fileUri: string, fingerprint: string, version: string, err: any, ods_warnings: Array<any>, ods_definition: string, data: any):ConditionerResponseSchema {

        if (err.ods_code) {
            err.ods_code = -1
            if (fileUri && !err.fileUri) err.fileUri = fileUri
            if (fingerprint && !err.fingerprint) err.fingerprint = fingerprint
            if (version && !err.version) err.version = version
            if (ods_warnings && ods_warnings.length > 0) {
                err.ods_warnings.push(ods_warnings)
            }
            if (ods_definition && !err.ods_definition) err.ods_definition = ods_definition
            if (data && !err.data) err.data = data
            return JSON.parse(JSON.stringify(err))
        }
        const result = new ConditionerResponseSchema()
        result.ods_code = -1
        result.httpStatus = httpStatusCode
        result.fileUri = fileUri || null
        result.fingerprint = fingerprint || null
        result.version = version || null
        result.ods_errors = [ErrorHandler.errorText(err)]
        result.ods_warnings = ods_warnings || []
        result.ods_definition = ods_definition || null
        result.data = data || {}

        return result

    }

    private static internalErrorResponse(err) {
        return {
            ods_code: -1,
            ods_errors: [ErrorHandler.errorText(err)],
            ods_warnings: [],
            ods_definition: null,
            data: {}
        }
    }


}