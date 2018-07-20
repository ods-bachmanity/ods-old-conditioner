import { 
    BaseTransform,
    CountryCodeTransform,
    DecimalDegreesCoordinateTransform,
    GeographicCoordinateTransform,
    UTMMGRSCoordinateTransform,
    UTMNCoordinateTransform,
    UTMSCoordinateTransform
} from './'
import { TransformDefSchema } from '../schemas'
import { ExecutionContext } from '../'

export class TransformFactory {

    private _objects: any = {
        CountryCodeTransform,
        DecimalDegreesCoordinateTransform,
        GeographicCoordinateTransform,
        UTMMGRSCoordinateTransform,
        UTMNCoordinateTransform,
        UTMSCoordinateTransform
    }

    constructor() {}

    public CreateInstance(executionContext: ExecutionContext, transformDef: TransformDefSchema, fieldName: string): BaseTransform {

        const className = transformDef.className
        const theClass = this._objects[className]
        if (!theClass) {
            console.error(`No record of object ${className}`)
            return new BaseTransform(executionContext, transformDef, fieldName)
        }
        return new theClass(executionContext, transformDef, fieldName)

    }

}