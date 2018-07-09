
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
                    console.log(`DefinitionService: Loaded definition from memory collection`)
                    return resolve(Object.assign({}, isInMemoryObject))
                }
                // __dirname is /app already
                filePath = path.join(__dirname, 'definitions',id + '.json')
                await fs.access(filePath, fs.constants.R_OK)
                const def = await fs.readJson(filePath)
                console.log(`DefinitionService: Loaded definition from file system`)
                this._defs.push(def)
                return resolve(def)
            }
            catch (err) {
                const error = ErrorHandler.errorResponse(`DefinitionService.get(${id})`, 
                    500, err.message ? err.message : `Invalid Definition Id`, err)
                if (err.code === 'ENOENT') {
                    console.error(`DefinitionService.get(${id}).error: Unable to find definition file @${filePath}`)
                    error.httpStatus = 404
                    return reject(error)
                }
                console.error(`DefinitionService.get(${id}).error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                return reject(error)
            }

        })

        return result

    }
}