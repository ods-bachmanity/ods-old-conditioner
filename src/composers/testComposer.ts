import { DefinitionSchema, ComposerDefSchema, KeyValuePair } from '../schemas'

import * as _ from 'lodash'

export class TestComposer {

    public fx(): Promise<any> {
        
        return Promise.resolve({
            Metadata: {
                TESTCOMPOSER: 'EXECUTED PROPERLY'
            }
        })

    }

}
