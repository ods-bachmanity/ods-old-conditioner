import { KeyValuePair } from "./";

export class TransformDefSchema {
    public className: string
    public args: Array<KeyValuePair> = []
    public match?: string
}
