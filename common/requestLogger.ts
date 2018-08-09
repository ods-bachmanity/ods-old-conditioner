import * as requestIp from 'request-ip'

export class RequestLogger {

    static get(requestContext: any): string {
        
        const clientIp = requestIp.getClientIp(requestContext)
        return `path: ${requestContext.path()}, ua: ${requestContext.userAgent()}, httpV: ${requestContext.httpVersion}, m: ${requestContext.method}, ip: ${clientIp}`

    }

}