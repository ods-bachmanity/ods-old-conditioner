import { Utilities, RouteServer, ErrorHandler, Logger } from './common'
import * as config from 'config'

import { Router } from './routes/router'

const logger = new Logger()

const _utilities = new Utilities()

if (!_utilities.preconditionCheck()) {
    logger.error(`server`, `One or more preconditions for startup were not met. Check log for details. Process terminated`, `index`)
    process.exit(1)
}

const errorHandler = new ErrorHandler(logger)

const rs = new RouteServer(logger)

const server = rs.init()
errorHandler.init(server)

const router = new Router(server, logger)
router.init(config.apiPrefix)

rs.start()
