
const fs = require('fs-extra')
import * as _ from 'lodash'
import * as path from 'path'

import { DefinitionSchema } from './schemas'
import { ErrorHandler } from '../common'

export class DefinitionService {
    
    private _defs: Array<DefinitionSchema> = []

    constructor() {}

    public get(id: string): Promise<DefinitionSchema> {

        const result: Promise<DefinitionSchema|any> = new Promise(async (resolve, reject) => {

            let filePath = ''
            try {

                const isInMemoryObject = _.find(this._defs, {id: id})
                if (isInMemoryObject) {
                    return resolve(Object.assign({}, isInMemoryObject))
                }
                // __dirname is /app already
                filePath = path.join(__dirname, 'definitions',id + '.json')
                await fs.access(filePath, fs.constants.R_OK)
                const def = await fs.readJson(filePath)
                this._defs.push(def)
                return resolve(def)
            }
            catch (err) {
                let handleError
                if (err.code === 'ENOENT') {
                    console.log(`DefinitionService.get(${id}).error: Unable to find definition file @${filePath}`)
                    handleError = ErrorHandler.errorResponse(404, null,null,null,err,[],id,{})
                    return reject(handleError)
                }
                handleError = ErrorHandler.errorResponse(500, null,null,null,err,[],id,{})
                ErrorHandler.logError(`DefinitionService.get(${id}).error:`, handleError)
                return reject(handleError)
            }

        })

        return result

    }
}