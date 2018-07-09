import { BaseComposer } from '.'
import { ErrorHandler } from '../../common'

import * as rp from 'request-promise'

export class ElasticSearchComposer extends BaseComposer {


    public fx(): Promise<any> {
        
        const result = new Promise(async (resolve, reject) => {

            try {
                const endpoint = {
                    uri: 'http://localhost:8081/api/metadata/',
                    simple: false,
                    qs: '',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
        
                if (!this.executionContext || !this.executionContext.body || !this.executionContext.body.fileuri) {
                    const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try`,
                    400, 'Missing fileuri in Request body', null)
                    return reject(error)
                }
                endpoint.uri += this.executionContext.body.fileuri
                console.log(`Calling ${JSON.stringify(endpoint, null, 2)}`)
                const response = await rp(endpoint)
                const fileObject = JSON.parse(response)
                
                if (fileObject.httpStatus === 404) {
                    const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try.response`,
                    404, 'No record returned for request', null)
                    return reject(error)
                }
                if (fileObject.code && fileObject.code !== 0) {
                    const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx().try.response`,
                    fileObject.httpStatus || 500, 'Error retrieving record for request', null)
                    return reject(error)
                }

                return resolve(fileObject)
            }
            catch (err) {
                const error = ErrorHandler.errorResponse(`ElasticSearchComposer.fx()`, 
                    500, err.message ? err.message : `Error`, err)
                console.error(`ElasticSearchComposer.fx().error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                return reject(error)
            }
        })

        return result

    }

}