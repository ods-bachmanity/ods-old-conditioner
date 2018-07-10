import { BaseAction } from './'
import { AuthenticationStrategies } from '../schemas'

const rp = require('request-promise')

export class ElasticUpdateAction extends BaseAction {

    public fx(): Promise<any> {

        const result = new Promise(async(resolve, reject) => {

            const date = new Date()
            let timestamp = date.toISOString()
            timestamp = timestamp.replace('Z', '+00:00')
            
            this.executionContext.mapped.ods = {}
            this.executionContext.mapped.ods.conditioners = {}
            
            this.executionContext.mapped.ods.conditioners[this.executionContext.definition.id] = {
                version: '0.0.1',
                timestamp: `${timestamp}`,
                status: true
            }
    
            try {
                // http://localhost:8081/emc/logs/${fingerprint}/_update
                let url = this.executionContext.parameters.catalog_endpoint_update
                if (this.authenticationStrategy === AuthenticationStrategies.basic) {
                    const uname = this.executionContext.parameters.username
                    const pw = this.executionContext.parameters.password
                    if (uname && pw) {
                        url = url.replace(`://`, `://${uname}:${pw}@`)
                    }
                }
                url = url.replace('${fingerprint}', this.executionContext.parameters['fingerprint'])
                
                const response = await rp.post({
                    headers: {'Content-Type': 'application/json'},
                    url: url,
                    simple: false,
                    body: JSON.stringify({
                        doc: this.executionContext.mapped
                    })
                })
                
                return resolve(JSON.parse(response))
                
            }
            catch (err) {
                this.executionContext.mapped.ods.conditioners[this.executionContext.definition.id] = {
                    version: '0.0.1',
                    timestamp: `${timestamp}`,
                    status: false,
                    error: err.message ? err.message : `Error in Elastic Action`
                }
                return reject(err)
            }

        })

        return result

    }

}