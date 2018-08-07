import * as config from 'config'
import * as winston from 'winston'

import { Utilities, RouteServer, ErrorHandler } from './common'
import { Router } from './routes/router'
import { ILogger } from './src/schemas/ILogger'

const path = require('path')
const fs = require('fs')

const _utilities = new Utilities()

if (!_utilities.preconditionCheck()) {
    console.error('One or more preconditions for startup were not met. Check log for details. Process terminated')
    process.exit(1)
}

const logger: ILogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: getDirectory('error'), level: 'error' }),
      new winston.transports.File({ filename: getDirectory('combined') })
    ]
});
  
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}
const errorHandler = new ErrorHandler(logger)

const rs = new RouteServer(logger)

const server = rs.init()
errorHandler.init(server)

const router = new Router(server, logger)
router.init(config.apiPrefix)

rs.start()

function getDirectory(directorySubType: string): string {
    
    const theDate = new Date()
    const targetFileName = `${theDate.getUTCDay()}-${getMonthName(theDate.getUTCMonth())}-${theDate.getUTCFullYear()}-${directorySubType}.log`
    // Make sure logs directory exists
    verifyTargetDirectory(path.join(process.cwd(), 'logs'))

    const targetPath = path.join(process.cwd(), 'logs', targetFileName)
    
    return targetPath

}

function verifyTargetDirectory(endpoint: string) {

    if (!fs.existsSync(endpoint)) {
        console.log(`Creating Logging Directory at: ${endpoint}`)
        fs.mkdirSync(endpoint)
    }

}

function getMonthName(month: number): string {
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