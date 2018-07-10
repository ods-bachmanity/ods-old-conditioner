import { FieldSchema, ErrorSchema, TransformDefSchema } from './schemas'
import { ExecutionContext } from './'
import { ErrorHandler, Utilities } from '../common'
import { isNullOrUndefined } from 'util';
import { TransformFactory } from './transforms';

import * as _ from 'lodash'

export class TaskWorker {

    private _transformFactory = new TransformFactory()

    public constructor(private executionContext: ExecutionContext, private fieldSchema: FieldSchema) {}

    public execute(): Promise<any> {

        const result = new Promise(async (resolve, reject) => {
            try {

                if (!this.fieldSchema) return resolve({})

                // TEST IF REQUIRED EXISTS AND HAS VALUE
                const fieldValue = Utilities.readValue(this.fieldSchema.field, this.executionContext.transformed)
                console.log(`Running task worker for field ${this.fieldSchema.field}: ${fieldValue}`)
                if (this.fieldSchema.required) {
                    const nullOrEmpty = isNullOrUndefined(fieldValue)
                    if (nullOrEmpty) {
                        return reject(this.errorResponse(`Required Field is Null or Empty: ${this.fieldSchema.field}`))
                    }
                }
                // TEST IF EXACT MATCH
                if (this.fieldSchema.exactmatch) {
                    const isExactMatch = fieldValue === this.fieldSchema.exactmatch
                    if (!isExactMatch) {
                        return reject(this.errorResponse(`Field is not an exact match: ${fieldValue} does not equal ${this.fieldSchema.exactmatch}`))
                    }
                }
                // TEST IF WHITE LIST
                if (this.fieldSchema.whitelist && this.fieldSchema.whitelist.length > 0) {
                    const index = this.fieldSchema.whitelist.indexOf(fieldValue)
                    if (index < 0) {
                        return reject(this.errorResponse(`Field is not in list of acceptable values: ${fieldValue}`))
                    }                    
                }

                // TEST IF BLACK LIST
                if (this.fieldSchema.blacklist && this.fieldSchema.blacklist.length > 0) {
                    const index = this.fieldSchema.blacklist.indexOf(fieldValue)
                    if (index >= 0) {
                        return reject(this.errorResponse(`Field is in a list of unacceptable values: ${fieldValue}`))
                    }
                }

                let matchedCaseRecord: TransformDefSchema = null

                // TEST IF MUST BE IN CASE LIST OF MATCHES
                if (this.fieldSchema.case && this.fieldSchema.case.length > 0) {
                    matchedCaseRecord = _.find(this.fieldSchema.case, { match: fieldValue })
                    if (this.fieldSchema.mustbeincase) {
                        if (!matchedCaseRecord) {
                            return reject(this.errorResponse(`Field value does not have a match in the case statement for definition: ${fieldValue}`))
                        }
                    }
                }

                // ALL VALIDATORS ARE COMPLETE AND SUCCESSFUL
                // EXECUTE ANY TRANSFORMS FROM CASE OR TRANSFORMS COLLECTION
                // First we run transforms from any case field
                if (matchedCaseRecord) {
                    const transform = this._transformFactory.CreateInstance(this.executionContext, matchedCaseRecord, this.fieldSchema.field)
                    const caseResult = await transform.fx()
                    if (!caseResult) {
                        return reject(this.errorResponse(`A problem occurred while running transform ${matchedCaseRecord.className}`))
                    }
                }

                // Next we run all transforms for the given field in one package
                if (this.fieldSchema.transforms && this.fieldSchema.transforms.length > 0) {
                    const tasks = []
                    this.fieldSchema.transforms.forEach((transform: TransformDefSchema) => {
                        const instance = this._transformFactory.CreateInstance(this.executionContext, transform, this.fieldSchema.field)
                        tasks.push(instance.fx())
                    })
                    const response = await Promise.all(tasks)
                    if (response.indexOf(false) >= 0) {
                        return reject(this.errorResponse(`A problem occurred while running a transform on field ${this.fieldSchema.field}`))
                    }
                }
                
                // CHECK fieldSchema.after for any transforms to run after initials complete
                if (this.fieldSchema.after && this.fieldSchema.after.length > 0) {
                    const tasks = []
                    this.fieldSchema.after.forEach((transform: TransformDefSchema) => {
                        const instance = this._transformFactory.CreateInstance(this.executionContext, transform, this.fieldSchema.field)
                        tasks.push(instance.fx())
                    })
                    const response = await Promise.all(tasks)
                    if (response.indexOf(false) >= 0) {
                        return reject(this.errorResponse(`A problem occurred while running an after transform on field ${this.fieldSchema.field}`))
                    }
                }

                return resolve(Object.assign({}, this.executionContext.transformed))
                
            }
            catch (err) {
                console.error(`TaskWorker.execute().error:`)
                console.error(`${JSON.stringify(err, null, 2)}`)
                const errorSchema = ErrorHandler.errorResponse(`TaskWorker.execute().error`,
                    err.httpStatus ? err.httpStatus : 500, (err.message ? err.message : `Error in TaskWorker for field ${this.fieldSchema.field}`), err)
                return reject(errorSchema)
            }
            return resolve()

        })

        return result

    }

    private errorResponse(message: string): ErrorSchema {

        // return reject(this.errorResponse(`Invalid Field Value for field ${this.fieldSchema.field}`))
        const myError: ErrorSchema = ErrorHandler.errorResponse(`TaskWorker.execute(${this.fieldSchema.field})`,
        400, message, null)
        return myError

    }

}