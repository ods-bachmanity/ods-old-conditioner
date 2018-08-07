import { BaseTransform } from '.'
import { ExecutionContext } from '..'
import { TransformDefSchema } from '../schemas'
import { ErrorHandler } from '../../common'

const rp = require('request-promise')

export class CountryCodeTransform extends BaseTransform {

    private _servicePath: string = process.env.COUNTRYCODESERVICEURL

    public fx(): Promise<Boolean> {

        const result: Promise<Boolean> = new Promise(async (resolve, reject) => {
            
            try {

                const footprint = this.executionContext.transformed.Metadata.COORD_WKT
                
                if (!footprint) return resolve(false)
    
                const response = await this.callService(footprint)
                const codes = []
                const names = []
                if (response && response.code === 0 && response.rowCount > 0) {
                    response.rows.forEach((row) => {
                        codes.push(row.GENC_3)
                        names.push(row.COUNTRY)
                    })
                }
                this.executionContext.transformed.Metadata.GENC_3 = codes
                this.executionContext.transformed.Metadata.GENC_NAMES = names

                return resolve(true)
            }
            catch (err) {
                ErrorHandler.logError(this.correlationId, `CountryCodeTransform.fx().error:`, err)
                return reject(false)
            }
            
        })

        return result

    }

    private callService(footprint: string): Promise<any> {

        const result = new Promise(async (resolve, reject) => {

            try {

                if (!this._servicePath) {
                    return reject('Invalid Service Path for Country Code Service')
                }
    
                const response = await rp.post({
                    "headers": { "content-type": "application/json" },
                    "url": this._servicePath,
                    "body": JSON.stringify({
                        "wkt": footprint
                    })
                })
                const records = JSON.parse(response)
                return resolve(records)
    
            }
            catch (err) {
                ErrorHandler.logError(this.correlationId, `countryCodeTransform.callService.error:`, err);
                return reject(false);
            }
            
        })

        return result

    }


}