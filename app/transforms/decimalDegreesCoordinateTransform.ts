import { BaseTransform } from './'
import { Utilities } from '../../common'

export class DecimalDegreesCoordinateTransform extends BaseTransform {

    public fx(): Promise<Boolean> {

        console.log(`Decimal Degrees Transform running for ${this.fieldName}`)
        Utilities.writeValue(this.fieldName, `IAMHERENOWXXXXXXX`, this.executionContext.transformed)
        Utilities.writeValue(`Metadata.GEO_COORDS`, `GEOJSONSOMETHINGGOESHERE`, this.executionContext.transformed)
        return Promise.resolve(true)

    }

}