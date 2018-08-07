import * as winston from 'winston'
const { combine, timestamp, label, printf } = winston.format;
const path = require('path')
const fs = require('fs')

const myFormat = printf(info => {
    
    if (info.message && typeof info.message === 'object') {
        info.message = JSON.stringify(info.message)
    }
    return JSON.stringify({
        timestamp: info.timestamp,
        correlationId: info.correlationId,
        level: info.level,
        source: info.source,
        message: info.message
    })

})

export class Logger {

    private _winstonLogger?: winston.Logger = null
    constructor() {

        this._winstonLogger = winston.createLogger({
            level: 'info',
            format: myFormat,
            transports: [
              new winston.transports.File({ filename: this.getDirectory('error'), level: 'error' }),
              new winston.transports.File({ filename: this.getDirectory('combined') })
            ]
        })
        //
        // If we're not in production then log to the `console` with the format:
        // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        // 
        if (process.env.NODE_ENV !== 'production') {
            this._winstonLogger.add(new winston.transports.Console({
                format: winston.format.simple()
            }))
        }
    }

    log(id: string, message: string, source: string) {
        this._winstonLogger.info(this.logPayload(id, message, source))
    }
    info(id: string, message: string, source: string) {
        this._winstonLogger.info(this.logPayload(id, message, source))
    }
    error(id: string, message: string, source: string) {
        this._winstonLogger.error(this.logPayload(id, message, source))
    }
    warn(id: string, message: string, source: string) {
        this._winstonLogger.warn(this.logPayload(id, message, source))
    }

    private logPayload(id: string, message: string, source: string): any {
        return {
            message: message,
            source: source,
            correlationId: id,
            timestamp: new Date().toISOString()
        }
    }

    private getDirectory(directorySubType: string): string {
    
        const theDate = new Date()
        const targetFileName = directorySubType + '.log' //`${theDate.getUTCDay()}-${this.getMonthName(theDate.getUTCMonth())}-${theDate.getUTCFullYear()}-${directorySubType}.log`
        // Make sure logs directory exists
        this.verifyTargetDirectory(path.join(process.cwd(), 'logs'))
    
        const targetPath = path.join(process.cwd(), 'logs', targetFileName)
        
        return targetPath
    
    }
    
    private verifyTargetDirectory(endpoint: string) {
    
        if (!fs.existsSync(endpoint)) {
            console.log(`Creating Logging Directory at: ${endpoint}`)
            fs.mkdirSync(endpoint)
        }
    
    }
    
    private getMonthName(month: number): string {
        switch(month) {
            case 1:
                return 'JAN'
            case 2:
                return 'FEB'
            case 3:
                return 'MAR'
            case 4:
                return 'APR'
            case 5:
                return 'MAY'
            case 6:
                return 'JUN'
            case 7:
                return 'JUL'
            case 8:
                return 'AUG'
            case 9:
                return 'SEP'
            case 10:
                return 'OCT'
            case 11:
                return 'NOV'
            case 12:
                return 'DEC'
            default:
                return 'UNK'
        }
    }
}
