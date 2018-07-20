import * as chai from 'chai'
import { DefinitionService } from '../src';
import { AssertionError } from 'assert';
import { isNullOrUndefined } from 'util';
const should = chai.should()
const expect = chai.expect;

chai.use(require('chai-as-promised'))

const definitionService = new DefinitionService()

describe('index tests work', () => {
    it ('should say true', () => {
        return Promise.resolve(true)
    })
})

describe('Definition Service, getDefinition for ntf-2', async () => {
    it('should load a ntf-2 definition', () => {
        const defType = 'ntf-2'
        const result = new Promise(async (resolve, reject) => {
            try {
                const response = await definitionService.get(defType)
                console.log(`\n${JSON.stringify({
                    id: response.id,
                    parameterCount: response.parameters.length,
                    composerCount: response.composers.length,
                    inspectorCount: response.schema.length,
                    mapCount: response.maps.length,
                    actionCount: response.actions.length
                }, null, 2)}\n`)
                resolve(!isNullOrUndefined(response))
            }
            catch (err) {
                reject(false)
            }
        })
        return result    
    })
})