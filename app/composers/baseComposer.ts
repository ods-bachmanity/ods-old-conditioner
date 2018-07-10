import { DefinitionSchema, ComposerDefSchema, KeyValuePair } from '../schemas'

import * as _ from 'lodash'

export class BaseComposer {

    protected definition: DefinitionSchema
    protected authenticationStrategy: AuthenticationStrategies = AuthenticationStrategies.none

    public constructor(protected executionContext: any, 
        protected composerDef: ComposerDefSchema) {
            this.definition = executionContext.definition
        
        if (composerDef && composerDef.args && composerDef.args.length > 0) {
            const record: KeyValuePair = _.find(composerDef.args, { key: 'auth'} )
            if (record) {
                switch (record.value) {
                    case 'basic':
                        this.authenticationStrategy = AuthenticationStrategies.basic
                        break
                    default:
                        break
                }
            }
        }

    }

    public fx(): Promise<any> {
        console.log('BaseComposer Ran')
        return Promise.resolve({})
    }

}

export enum AuthenticationStrategies {
    'none',
    'basic'
}