import { BaseTransform } from './'
import { Utilities } from '../../common'

export class CountryCodeTransform extends BaseTransform {

    public fx(): Promise<Boolean> {

        console.log(`Country Code Transform running for ${this.fieldName}`)
        Utilities.writeValue(`Metadata.GENC_3`, ['USA','CAN','MEX'], this.executionContext.transformed)
        Utilities.writeValue(`Metadata.GENC_NAMES`, [`United States`, `Canada`, `Mexico`], this.executionContext.transformed)
        return Promise.resolve(true)

    }

}