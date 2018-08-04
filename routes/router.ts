import * as config from 'config'
import * as restify from 'restify'
import * as fs from 'fs'
import * as path from 'path'

import { HealthCheckRoute, SwaggerRoute, DefinitionRoute, ConditionerRoute, BulkConditionerRoute } from '.'
import { ErrorHandler } from '../common'

export class Router {

    public constructor (private server, private errorHandler: ErrorHandler) {}

    public init(baseUri: string) {

        // Health Check
        // api/health
        const healthCheckRoute = new HealthCheckRoute(this.server)
        healthCheckRoute.init(baseUri + 'health')

        // Definition Route
        // api/definition/:id
        const definitionRoute = new DefinitionRoute(this.server)
        definitionRoute.init(baseUri + 'definition/:id')

        // Conditioner Route
        // api/conditioner/:id
        const conditionerRoute = new ConditionerRoute(this.server)
        conditionerRoute.init(baseUri + 'conditioner/:definitionId')

        // Bulk Conditioner Route
        // api/conditioner/bulk/:definition
        const bulkConditionerRoute = new BulkConditionerRoute(this.server)
        bulkConditionerRoute.init(baseUri + 'conditioner/bulk/:definitionId')

        /*
            Place all handler routes above this section
            This section is responsible for serving static content AFTER all other routes are handled
            Lastly, there is a handler to gracefully handle 'Resource Not Found' 404 status
        */
        if (config.serveSwagger) {
            console.log('Serving swagger content')
            const swaggerRoute = new SwaggerRoute(this.server)
            swaggerRoute.init('/swagger.io')
        }

        // Check if should serve static
        if (config.serveStaticPath) {
            const sharePath = config.serveStaticPath //e.g. ./public/
            const checkPath = sharePath.startsWith('./') ? path.join(process.cwd(), sharePath) : sharePath
            // Sync version ok here since this executes on start up only
            if (!fs.existsSync(checkPath)) {
                console.error(`Invalid serveStaticPath in config file, directory does not exist: ${checkPath}`)
            } else {
                console.log(`Serving Static content from ${sharePath}`)
                this.server.get('/*', restify.plugins.serveStatic({
                    directory: sharePath,
                    default: './index.html'
                }))
            }
        }

        // Handle 404
        this.server.on('NotFound', (req, res, next) => {
            console.error(`Router not found: ${req.url}`)
            res.contentType = 'application/json'
            res.header('Content-Type', 'application/json')
            
            res.send(404, ErrorHandler.errorResponse(404,req.body.fileuri,req.body.fingerprint,req.body.version,`Router not found: ${req.url}`,[],req.params.definitionId,{}))
        })
    }

}