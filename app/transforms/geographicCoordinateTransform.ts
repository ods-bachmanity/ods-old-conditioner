import { Utilities } from '../../common'
import { ExecutionContext } from '../'
import { TransformDefSchema } from '../schemas'
import { BaseTransform } from './baseTransform';

export class GeographicCoordinateTransform extends BaseTransform {

    constructor(protected executionContext: ExecutionContext, protected transformDef: TransformDefSchema, protected fieldName: string) {
        super(executionContext, transformDef, fieldName)
    }

    public fx(): Promise<Boolean> {

        console.log(`Geographic Transform running for ${this.fieldName}`)
        
        Utilities.writeValue(`Metadata.COORD_GEOJSON`, super.toGeoJSON([{Longitude: '0', Latitude: '0', Height: '0'}])
            , this.executionContext.transformed)

        //`[0 52 0,0.0 51.4997222222222 0,2.00055555555556 51.4997222222222 0,2.00055555555556 52.0 0,0 52 0]`, 

        Utilities.writeValue(`Metadata.COORD_WKT`, 
            `POLYGON ((0 52 0,0.0 51.4997222222222 0,2.00055555555556 51.4997222222222 0,2.00055555555556 52.0 0,0 52 0))`, 
            this.executionContext.transformed)
        
        Utilities.writeValue(`Metadata.COORD_TYPE`, `G`, this.executionContext.transformed)

        return Promise.resolve(true)

    }

}
