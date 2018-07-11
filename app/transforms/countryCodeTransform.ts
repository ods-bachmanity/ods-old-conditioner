import { BaseTransform } from './'
import { ExecutionContext } from '../'
import { TransformDefSchema } from '../schemas'

const rp = require('request-promise')

export class CountryCodeTransform extends BaseTransform {

    private _servicePath: string = process.env.COUNTRYCODESERVICEURL

    constructor(executionContext: ExecutionContext, transformDef: TransformDefSchema, fieldName: string) {
        super(executionContext, transformDef, fieldName)
    }

    public fx(): Promise<Boolean> {

        const result: Promise<Boolean> = new Promise(async (resolve, reject) => {
            
            try {

                const footprint = this.executionContext.transformed.Metadata.COORD_WKT
                console.log(`County Code service searching for WKT ${footprint}`)
    
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

                console.log(`************* CountryCodeTransform Responding ************* `)
                return resolve(true)
            }
            catch (err) {
                console.error(`CountryCodeTransform.fx().error: ${JSON.stringify(err)}`)
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
                console.log('ERROR:countryCodeTransform.callService');
                console.error(err.error ? err.error : err);
                return reject(false);
            }
            
        })

        return result;

    }


}