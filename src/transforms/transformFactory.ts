import { 
    BaseTransform,
    CountryCodeTransform,
    DecimalDegreesCoordinateTransform,
    GeographicCoordinateTransform,
    UTMMGRSCoordinateTransform,
    UTMNCoordinateTransform,
    UTMSCoordinateTransform,
    HRTECoordinateTransform,
    CoordinateTransform,
    FloatTransform,
    IntegerTransform
} from '.'
import { TransformDefSchema } from '../schemas'
import { ExecutionContext } from '..'
import { Logger } from '../../common'

export class TransformFactory {

    private _objects: any = {
        CountryCodeTransform,
        DecimalDegreesCoordinateTransform,
        GeographicCoordinateTransform,
        UTMMGRSCoordinateTransform,
        UTMNCoordinateTransform,
        UTMSCoordinateTransform,
        HRTECoordinateTransform,
        CoordinateTransform,
        FloatTransform,
        IntegerTransform
    }

    constructor(private logger: Logger) {}

    public CreateInstance(executionContext: ExecutionContext, transformDef: TransformDefSchema, fieldName: string, correlationId: string): BaseTransform {

        const className = transformDef.className
        const theClass = this._objects[className]
        if (!theClass) {
            this.logger.error(correlationId, `No record of transform object ${className}`, `TransformFactory.CreateInstance`)
            return new BaseTransform(executionContext, transformDef, fieldName, correlationId, this.logger)
        }
        return new theClass(executionContext, transformDef, fieldName, correlationId, this.logger)

    }

}