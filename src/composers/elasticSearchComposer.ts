import { BaseComposer } from '.'
import { AuthenticationStrategies, ComposerDefSchema } from '../schemas'
import { ErrorHandler, Logger } from '../../common'
import { ExecutionContext } from '../'

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

                if (!this.executionContext || !this.executionContext.parameters 
                    || !this.executionContext.parameters.fileuri
                    || !this.executionContext.parameters.fingerprint
                    || !this.executionContext.parameters.version) {
                    const handleError = ErrorHandler.errorResponse(400,this.executionContext.getParameterValue('fileuri'),
                    this.executionContext.getParameterValue('fingerprint'),this.executionContext.getParameterValue('version'), 
                    `Missing critical parameter in Request body`, 
                    this.executionContext.warnings,this.executionContext.definition.id,{})
                    ErrorHandler.logError(this.correlationId, `elasticSearchComposer.fx()`, handleError)
                    return reject(handleError)
                }
                
                const response = await rp(endpoint)
                const body = JSON.parse(response)

                if (body.httpStatus === 404) {
                    const handleError = ErrorHandler.errorResponse(404,this.executionContext.getParameterValue('fileuri'),
                    this.executionContext.getParameterValue('fingerprint'),this.executionContext.getParameterValue('version'), 
                    `No record returned for request`, 
                    this.executionContext.warnings,this.executionContext.definition.id,{})
                    ErrorHandler.logError(this.correlationId, `elasticSearchComposer.fx()`, handleError)
                    return reject(handleError)
                }
                if (body.code && body.code !== 0) {
                    const handleError = ErrorHandler.errorResponse(500,this.executionContext.getParameterValue('fileuri'),
                    this.executionContext.getParameterValue('fingerprint'),this.executionContext.getParameterValue('version'), 
                    `Error retrieving record for request`, 
                    this.executionContext.warnings,this.executionContext.definition.id,{})
                    ErrorHandler.logError(this.correlationId, `elasticSearchComposer.fx():Error retrieving record for request:\n ${JSON.stringify(body, null, 1)}`, handleError)
                    return reject(handleError)
                }
                if (!body 
                    || !body.hits 
                    || !body.hits.hits 
                    || !body.hits.hits[0] 
                    || !body.hits.hits[0]._source
                    || !body.hits.hits[0]._source.rawheader) {
                        const handleError = ErrorHandler.errorResponse(500,this.executionContext.getParameterValue('fileuri'),
                        this.executionContext.getParameterValue('fingerprint'),this.executionContext.getParameterValue('version'), 
                        `Invalid Record Format returned from Elastic Search`, 
                        this.executionContext.warnings,this.executionContext.definition.id,{})
                        ErrorHandler.logError(this.correlationId, `elasticSearchComposer.fx():Invalid Record Format returned from Elastic Search:\n ${JSON.stringify(body,null,1)} `, handleError)
                        return reject(handleError)
                }
                if (body.hits.total !== 1) {
                    const handleError = ErrorHandler.errorResponse(500,this.executionContext.getParameterValue('fileuri'),
                    this.executionContext.getParameterValue('fingerprint'),this.executionContext.getParameterValue('version'), 
                    `Invalid number of responses from Elastic Search returned`, 
                    this.executionContext.warnings,this.executionContext.definition.id,{})
                    ErrorHandler.logError(this.correlationId, `elasticSearchComposer.fx():Invalid number of respones from Elastic Search returned:\n ${JSON.stringify(body,null,1)}`, handleError)
                    return reject(handleError)
                }

                const fileObject = JSON.parse(body.hits.hits[0]._source.rawheader)
                
                return resolve(fileObject)
            }
            catch (err) {
                const handleError = ErrorHandler.errorResponse(500,this.executionContext.getParameterValue('fileuri'),
                this.executionContext.getParameterValue('fingerprint'),this.executionContext.getParameterValue('version'), 
                `Error executing elasticSearchComposer.fx():`, 
                this.executionContext.warnings,this.executionContext.definition.id,{})
                ErrorHandler.logError(this.correlationId, `elasticSearchComposer.fx()`, handleError)
                return reject(handleError)
            }
        })

        return result

    }

}