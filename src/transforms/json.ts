import BaseTransform from './base'
import type { Value } from '../value'

export class JsonTransform<T> extends BaseTransform<string, T> {
	constructor(wrapped: Value<string>) {
		super(wrapped)
	}

	protected wrapValue(value: string) {
		return JSON.parse(value) as T
	}

	static apply(wrapped: Value<string>) {
		return new JsonTransform(wrapped)
	}
}

export default JsonTransform.apply
