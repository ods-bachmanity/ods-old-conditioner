import * as config from 'config'
import * as restify from 'restify'
import * as fs from 'fs'
import * as path from 'path'

import { HealthCheckRoute, SwaggerRoute, DefinitionRoute, ConditionerRoute, BulkConditionerRoute } from '.'
import { ErrorHandler, Logger, RequestLogger, ResponseLogger, Utilities } from '../common'

export class Router {

    public constructor (private server, private logger: Logger) {}

    public init(baseUri: string) {

        this.server.pre((req, res, next) => {
            res.contentType = 'application/json'
            res.header('Content-Type', 'application/json')
            req.startTime = new Date()
            const reqLog = RequestLogger.get(req)
            this.logger.info(req.id(), reqLog, `REQUEST`)
            return next()
        })

        // Health Check
        // api/health
        const healthCheckRoute = new HealthCheckRoute(this.server, this.logger)
        healthCheckRoute.init(baseUri + 'health')

        // Definition Route
        // api/definition/:id
        const definitionRoute = new DefinitionRoute(this.server, this.logger)
        definitionRoute.init(baseUri + 'definition/:id')

        // Conditioner Route
        // api/conditioner/:id
        const conditionerRoute = new ConditionerRoute(this.server, this.logger)
        conditionerRoute.init(baseUri + 'conditioner/:definitionId')

        // Bulk Conditioner Route
        // api/conditioner/bulk/:definition
        const bulkConditionerRoute = new BulkConditionerRoute(this.server, this.logger)
        bulkConditionerRoute.init(baseUri + 'conditioner/bulk/:definitionId')

        /*
            Place all handler routes above this section
            This section is responsible for serving static content AFTER all other routes are handled
            Lastly, there is a handler to gracefully handle 'Resource Not Found' 404 status
        */
        if (config.serveSwagger) {
            this.logger.info(`server`, `Serving swagger content`, `router.init.serveSwagger`)
            const swaggerRoute = new SwaggerRoute(this.server, this.logger)
            swaggerRoute.init('/swagger.io')
        }

        // Check if should serve static
        if (config.serveStaticPath) {
            const sharePath = config.serveStaticPath //e.g. ./public/
            const checkPath = sharePath.startsWith('./') ? path.join(process.cwd(), sharePath) : sharePath
            // Sync version ok here since this executes on start up only
            if (!fs.existsSync(checkPath)) {
                this.logger.error(`server`, `Invalid serveStaticPath in config file, directory does not exist: ${checkPath}`, `Router.init.serveStaticPath`)
            } else {
                this.logger.info(`server`, `Serving Static content from ${sharePath}`, `Router.init.serveStaticPath`)
                this.server.get('/*', restify.plugins.serveStatic({
                    directory: sharePath,
                    default: './index.html'
                }))
            }
        }

        // Handle 404
        this.server.on('NotFound', (req, res, next) => {
            this.logger.error(req.id(), `Router not found: ${req.url}`, `Router.init.onnotfound`)
            res.contentType = 'application/json'
            res.header('Content-Type', 'application/json')
            
            res.send(404, ErrorHandler.errorResponse(404,
                Utilities.safeReadReqBody(req, 'fileuri'),
                Utilities.safeReadReqBody(req, 'fingerprint'), 
                Utilities.safeReadReqBody(req, 'version'),
                `Router not found: ${req.url}`,[],req.params.definitionId,{}))
        })

        this.server.on('after', (req, res, route, error) => {

            if (req.startTime) res.startTime = req.startTime
            if (error) {
                this.logger.error(req.id(), ResponseLogger.get(res), 'RESPONSE')
                return
            }
            this.logger.info(req.id(), ResponseLogger.get(res), `RESPONSE`)

        })
    }

}