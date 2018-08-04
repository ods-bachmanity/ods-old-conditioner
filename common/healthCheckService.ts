import { Utilities } from './utilities'
import { HealthResponseSchema } from '../src/schemas';

export class HealthCheckService {

    public static get(): Promise<HealthResponseSchema> {
        
        const result: HealthResponseSchema = new HealthResponseSchema()
        result.data = {
            RunningProperly: true
        }
        result.message = 'No Rest for Old Men'
        return Promise.resolve(result);

    }

}
