export class ResponseLogger {

    public static get(responseContext: any): string {

        let runtime = 0
        if (responseContext.startTime) {
            const endTime = new Date()
            runtime = Math.abs(+endTime - +responseContext.startTime)/1000
        }
        return `runtime: ${runtime}, contentLength: ${responseContext.header('Content-Length')}, statusCode: ${responseContext.statusCode}, statusMessage: ${responseContext.statusMessage}`

    }

}