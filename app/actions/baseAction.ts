import { ActionDefSchema, DefinitionSchema, AuthenticationStrategies, KeyValuePair } from "../schemas";
import { ExecutionContext } from '../'

import * as _ from 'lodash'

export class BaseAction {

    protected definition: DefinitionSchema
    protected authenticationStrategy: AuthenticationStrategies = AuthenticationStrategies.none

    constructor(protected executionContext: ExecutionContext, protected actionDef: ActionDefSchema) {
        this.definition = executionContext.definition

        if (actionDef && actionDef.args && actionDef.args.length > 0) {
            const record: KeyValuePair = _.find(actionDef.args, { key: 'auth'} )
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

        return Promise.resolve({})

    }
    
}