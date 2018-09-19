import { DefinitionSchema, ComposerDefSchema, KeyValuePair, AuthenticationStrategies } from '../schemas'
import { ExecutionContext } from '..'
import { Logger } from '../../common'
import { BaseComposer } from './'

import * as _ from 'lodash'

export class FieldComposer extends BaseComposer {

    public fx(): Promise<any> {
        
        const result = {
            Metadata: {}
        }
        const arg = _.find(this.composerDef.args, { key: 'fields'})
        const value = arg.value

        value.forEach((item) => {
            result.Metadata[item] = this.executionContext.getParameterValue(item)
        })
        
        console.log(JSON.stringify(result, null, 2))
        return Promise.resolve(result)
    }

}
