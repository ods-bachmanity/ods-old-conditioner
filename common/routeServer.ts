import * as restify from 'restify'
import * as config from 'config'

export class RouteServer {

    private restifyServer: any;

    public init(): any {

        let options = {};
        if (!process.env.PRODUCTION) {
            options = {
                formatters: {
                    'text/html': function (req, res, body, next) {
                        if (!next) return;
                        next (null, body)
                    }
                }
            }
        }
        this.restifyServer = restify.createServer(options)

        this.restifyServer.use(restify.plugins.queryParser())
        this.restifyServer.use(restify.plugins.bodyParser())
        
        if (!process.env.PRODUCTION) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        return this.restifyServer;
    }

    public start() {

        let thePort = config.apiPort || config.PORT
        if (process.env.PRODUCTION && process.env.production === 'true') {
            thePort = process.env.PORT || thePort
        }
        
        this.restifyServer.listen(thePort, () => {
            console.log('%s listening at %s', this.restifyServer.name, this.restifyServer.url)
        })

    }

}