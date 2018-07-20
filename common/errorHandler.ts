import * as config from 'config'
import { ErrorSchema } from '../src/schemas'

export class ErrorHandler {

    private _defaultMessage: string = `Error Occurred. Logs on Server.`

    constructor (private server) {}

    init () {

        this.server.on('InternalError', (req, res, err, next) => {
            console.error(`Internal Error: ${err}`)
            const error = new ErrorSchema()
            error.message = `Internal Error: ${err}`
            res.send(error.httpStatus, this.errorMessage(error.message))
            return next()
        })

        this.server.on('InternalServerError', (req, res, err, next) => {
            console.error(`Internal Server Error: ${err}`)
            const error = new ErrorSchema()
            error.message = `Internal Server Error: ${err}`
            res.send(error.httpStatus, this.errorMessage(error.message))
            return next()
        })

        this.server.on('restifyError', (req, res, err, next) => {
            console.error(`Restify Error: ${err}`)
            const error = new ErrorSchema()
            error.message = `Restify Error: ${err}`
            res.send(error.httpStatus, this.errorMessage(error.message))
            return next()
        })

        this.server.on('uncaughtException', (req, res, err, next) => {
            console.error(`Uncaught Exception: ${err}`)
            const error = new ErrorSchema()
            error.message = `Uncaught Exception: ${err}`
            res.send(error.httpStatus, this.errorMessage(error.message))
            return next()
        })

    }

    public static errorResponse(source: string, httpStatus: number, message: string, err: any): ErrorSchema {
        const errorSchema = new ErrorSchema()
        errorSchema.debug = (!config.production ? source : null)
        errorSchema.httpStatus = httpStatus || 500
        errorSchema.message = message || (err.message ? err.message : 'Error')
        errorSchema.error = (!config.production ? err : null)
        return errorSchema
    }

    private errorMessage(err: any) {

        if (config.production) {
            return this._defaultMessage
        }
        let result = this._defaultMessage
        if (err) {
            result = err.message ? err.message : err.toString()
        }
        return result

    }
}