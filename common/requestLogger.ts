import * as requestIp from 'request-ip'

export class RequestLogger {

    static get(requestContext: any): string {
        
        const clientIp = requestIp.getClientIp(requestContext)
        return JSON.stringify({
            path: requestContext.path(),
            ua: requestContext.userAgent(),
            qs: requestContext.query,
            p: JSON.parse(JSON.stringify(requestContext.params||{})),
            httpV: requestContext.httpVersion,
            m: requestContext.method,
            ip: clientIp
        })

    }

}