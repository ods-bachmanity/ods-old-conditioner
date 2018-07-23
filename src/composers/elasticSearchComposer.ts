import { BaseComposer } from '.'
import { AuthenticationStrategies } from '../schemas'
import { ErrorHandler } from '../../common'

import * as rp from 'request-promise'

export class ElasticSearchComposer extends BaseComposer {


    public fx(): Promise<any> {
        
        const result = new Promise(async (resolve, reject) => {

            try {
                let url = this.executionContext.parameters.catalog_endpoint_search
                if (this.authenticationStrategy === AuthenticationStrategies.basic) {
                    const uname = this.executionContext.parameters.username
                    const pw = this.executionContext.parameters.password
                    if (uname && pw) {
                        url = url.replace(`://`, `://${uname}:${pw}@`)
                    }
                }
                const payload: any = {
                    q: `fingerprint:${this.executionContext.parameters.fingerprint}`,
                    _source_includes: 'rawheader'
                }

                if (process.env.INCLUDEFILEURIINGET && process.env.INCLUDEFILEURIINGET === 'true') {
                    payload.fileuri = this.executionContext.parameters.fileuri
                }

                const endpoint = {
                    uri: url,
                    simple: false,
                    qs: payload,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                if (!this.executionContext || !this.executionContext.parameters || !this.executionContext.parameters.fileuri) {
                    const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try`,
                    400, 'Missing fileuri in Request body', null)
                    return reject(error)
                }
                
                // console.info(`Calling ${JSON.stringify(endpoint, null, 2)}`)
                const response = await rp(endpoint)
                const body = JSON.parse(response)

                if (body.httpStatus === 404) {
                    const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try.response`,
                    404, 'No record returned for request', null)
                    return reject(error)
                }
                if (body.code && body.code !== 0) {
                    const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try.response`,
                    body.httpStatus || 500, 'Error retrieving record for request', null)
                    return reject(error)
                }
                if (!body 
                    || !body.hits 
                    || !body.hits.hits 
                    || !body.hits.hits[0] 
                    || !body.hits.hits[0]._source
                    || !body.hits.hits[0]._source.rawheader) {
                        const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try.response`,
                        body.httpStatus || 500, 'Invalid Record Format returned from Elastic Search', null)
                        return reject(error)
                }
                if (body.hits.total !== 1) {
                    const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try.response`,
                    body.httpStatus || 500, 'Invalid number of responses from Elastic Search returned', null)
                    return reject(error)
                }

                const fileObject = JSON.parse(body.hits.hits[0]._source.rawheader)
                
                return resolve(fileObject)
            }
            catch (err) {
                ErrorHandler.logError(`ElasticSearchComposer.fx.error:`, err)
                const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx()`, 
                    500, err.message || err.error ? err.message || err.error : `Error`, err)
                return reject(error)
            }
        })

        return result

    }

}