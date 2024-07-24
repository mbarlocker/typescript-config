import BaseTransform from './base'
import type { Value } from '../value'

export class TrimTransform extends BaseTransform<string, string> {
	constructor(wrapped: Value<string>) {
		super(wrapped)
	}

	protected wrapValue(value: string) {
		return value.trim()
	}

	static apply(wrapped: Value<string>) {
		return new TrimTransform(wrapped)
	}
}

export default TrimTransform.apply
