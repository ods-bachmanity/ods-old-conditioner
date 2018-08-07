import { ActionDefSchema, DefinitionSchema, AuthenticationStrategies, KeyValuePair } from "../schemas";
import { ExecutionContext } from '..'
import { Logger } from '../../common'

import * as _ from 'lodash'

export class BaseAction {

    protected definition: DefinitionSchema
    protected authenticationStrategy: AuthenticationStrategies = AuthenticationStrategies.none

    constructor(protected executionContext: ExecutionContext, protected actionDef: ActionDefSchema, protected correlationId: string, protected logger: Logger, ) {
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

        this.logger.warn(this.correlationId, `BaseAction Ran for definition ${this.definition.id}`, `BaseAction.fx`)
        return Promise.resolve({})

    }
    
}